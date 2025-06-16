import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ChatRequest {
  threadId: string
  message: string
  context?: any[]
  roadmapData?: any // Add roadmap data parameter
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  citations?: any[]
}

interface RegulatoryDocument {
  id: string
  title: string
  content: string
  cfr_title: number
  cfr_part: number
  cfr_section: string
  source_url: string
  similarity?: number
}

interface Citation {
  id: string
  code: string
  title: string
  url: string
  type: 'regulatory' | 'fda' | 'iso' | 'eu-mdr'
  confidence: number
}

const SYSTEM_PROMPT = `You are QualiPilot, an expert FDA regulatory compliance assistant specializing in medical device regulations. Your expertise covers:

- FDA 21 CFR Parts 800-1299 (Medical Device Regulations)
- ISO 13485 Quality Management Systems
- EU MDR 2017/745 Medical Device Regulation
- Device classification (Class I, II, III)
- 510(k) premarket notifications
- PMA applications
- QSR (Quality System Regulation)
- Design controls and risk management

CRITICAL INSTRUCTIONS:
1. Always provide specific regulatory citations in the format [21CFR§XXX.XX] for FDA regulations
2. Include confidence scores for your responses (High/Medium/Low)
3. Reference the most current regulatory requirements
4. Provide practical implementation guidance
5. Always include relevant URLs to official sources
6. Acknowledge when information may be outdated or when you're uncertain
7. Focus on actionable compliance advice

When citing regulations:
- FDA: [21CFR§820.30] for design controls
- ISO: [ISO§13485:2016] for quality management
- EU: [EUMDR§Article62] for clinical evaluation

Maintain a professional, authoritative tone while being helpful and practical.`

const MAX_TOKENS = 4000
const RESPONSE_RESERVE = 1500
const MAX_CONTEXT_MESSAGES = 8
const SIMILARITY_THRESHOLD = 0.7
const MAX_RETRIEVED_DOCS = 5

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { threadId, message, context = [], roadmapData = null }: ChatRequest = await req.json()

    if (!threadId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: threadId, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify thread ownership
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('id, user_id')
      .eq('id', threadId)
      .eq('user_id', user.id)
      .single()

    if (threadError || !thread) {
      return new Response(
        JSON.stringify({ error: 'Thread not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Save user message
    const { data: userMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        content: message,
        role: 'user',
        citations: []
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error saving user message:', messageError)
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Perform RAG search
    const relevantDocs = await performRAGSearch(supabase, message, openaiApiKey)
    
    // Get conversation history
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('content, role, citations')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(MAX_CONTEXT_MESSAGES)

    // Build context-aware prompt with roadmap data if available
    const contextPrompt = buildContextPrompt(message, relevantDocs, messageHistory || [], roadmapData)
    
    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: contextPrompt }
    ]

    // Set up streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: messages,
              max_tokens: RESPONSE_RESERVE,
              temperature: 0.1,
              stream: true,
              presence_penalty: 0.1,
              frequency_penalty: 0.1
            }),
          })

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body from OpenAI')
          }

          let fullResponse = ''
          let buffer = ''

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = new TextDecoder().decode(value)
              buffer += chunk

              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  
                  if (data === '[DONE]') continue

                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content || ''
                    
                    if (content) {
                      fullResponse += content
                      
                      const sseData = `data: ${JSON.stringify({
                        type: 'content',
                        content: content,
                        fullContent: fullResponse
                      })}\n\n`
                      
                      controller.enqueue(new TextEncoder().encode(sseData))
                    }
                  } catch (parseError) {
                    console.error('Error parsing OpenAI chunk:', parseError)
                  }
                }
              }
            }

            // Extract citations and calculate confidence
            const citations = extractCitations(fullResponse, relevantDocs)
            const confidenceScore = calculateConfidenceScore(fullResponse, relevantDocs)

            // Save assistant response
            const { error: saveError } = await supabase
              .from('messages')
              .insert({
                thread_id: threadId,
                content: fullResponse,
                role: 'assistant',
                citations: citations
              })

            if (saveError) {
              console.error('Error saving assistant message:', saveError)
            }

            // Send completion event
            const completionData = `data: ${JSON.stringify({
              type: 'complete',
              content: fullResponse,
              citations: citations,
              confidence: confidenceScore,
              messageId: userMessage.id,
              retrievedDocs: relevantDocs.length
            })}\n\n`
            
            controller.enqueue(new TextEncoder().encode(completionData))

          } finally {
            reader.releaseLock()
          }

        } catch (error) {
          console.error('Stream error:', error)
          
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: error.message || 'An error occurred while processing your request'
          })}\n\n`
          
          controller.enqueue(new TextEncoder().encode(errorData))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Request error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function performRAGSearch(
  supabase: any, 
  query: string, 
  openaiApiKey: string
): Promise<RegulatoryDocument[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query, openaiApiKey)
    
    // Perform hybrid search: semantic + keyword
    const { data: semanticResults, error: semanticError } = await supabase.rpc(
      'search_regulatory_documents',
      {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        similarity_threshold: SIMILARITY_THRESHOLD,
        match_count: MAX_RETRIEVED_DOCS
      }
    )

    if (semanticError) {
      console.error('Semantic search error:', semanticError)
    }

    // Perform keyword search as fallback
    const { data: keywordResults, error: keywordError } = await supabase
      .from('regulatory_documents')
      .select('*')
      .textSearch('content', query.replace(/[^\w\s]/g, ''))
      .limit(MAX_RETRIEVED_DOCS)

    if (keywordError) {
      console.error('Keyword search error:', keywordError)
    }

    // Combine and deduplicate results
    const allResults = [
      ...(semanticResults || []),
      ...(keywordResults || [])
    ]

    const uniqueResults = allResults.reduce((acc, doc) => {
      if (!acc.find(existing => existing.id === doc.id)) {
        acc.push(doc)
      }
      return acc
    }, [] as RegulatoryDocument[])

    return uniqueResults.slice(0, MAX_RETRIEVED_DOCS)

  } catch (error) {
    console.error('RAG search error:', error)
    return []
  }
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const maxLength = 8000
  const textToEmbed = text.length > maxLength ? text.substring(0, maxLength) : text
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: textToEmbed,
      model: 'text-embedding-ada-002'
    })
  })
  
  if (!response.ok) {
    throw new Error(`OpenAI embeddings API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.data[0].embedding
}

function buildContextPrompt(
  query: string, 
  relevantDocs: RegulatoryDocument[], 
  messageHistory: any[],
  roadmapData: any // Add roadmap data parameter
): string {
  let prompt = `User Query: ${query}\n\n`

  // Add roadmap data if available
  if (roadmapData) {
    prompt += `User's Regulatory Profile:\n`
    
    // Device information
    if (roadmapData.deviceInfo) {
      prompt += `Device: ${roadmapData.deviceInfo.name || 'Not specified'}\n`
      prompt += `Classification: Class ${roadmapData.classification?.device_class || roadmapData.deviceInfo.classification || 'Not specified'}\n`
      
      if (roadmapData.deviceInfo.productCode) {
        prompt += `Product Code: ${roadmapData.deviceInfo.productCode}\n`
      }
      
      if (roadmapData.deviceInfo.regulationNumber) {
        prompt += `Regulation Number: ${roadmapData.deviceInfo.regulationNumber}\n`
      }
    }
    
    // Regulatory pathway
    if (roadmapData.pathway) {
      prompt += `Regulatory Pathway: ${roadmapData.pathway.name || 'Not specified'}\n`
    }
    
    // Applicable regulations
    if (roadmapData.regulatoryOverview?.applicableRegulations) {
      prompt += `\nApplicable Regulations:\n`
      roadmapData.regulatoryOverview.applicableRegulations.slice(0, 5).forEach((reg: string) => {
        prompt += `- ${reg}\n`
      })
    }
    
    // Required standards
    if (roadmapData.regulatoryOverview?.requiredStandards) {
      prompt += `\nRequired Standards:\n`
      roadmapData.regulatoryOverview.requiredStandards.slice(0, 3).forEach((std: string) => {
        prompt += `- ${std}\n`
      })
    }
    
    prompt += `\n`
  }

  if (relevantDocs.length > 0) {
    prompt += `Relevant Regulatory Context:\n`
    relevantDocs.forEach((doc, index) => {
      prompt += `\n[Document ${index + 1}] ${doc.title}\n`
      prompt += `CFR: ${doc.cfr_title} CFR ${doc.cfr_part}.${doc.cfr_section}\n`
      prompt += `URL: ${doc.source_url}\n`
      prompt += `Content: ${doc.content.substring(0, 800)}...\n`
    })
    prompt += `\n`
  }

  if (messageHistory.length > 1) {
    prompt += `Recent Conversation Context:\n`
    messageHistory.slice(-4).forEach((msg, index) => {
      if (msg.role !== 'system') {
        prompt += `${msg.role}: ${msg.content.substring(0, 200)}...\n`
      }
    })
    prompt += `\n`
  }

  prompt += `Please provide a comprehensive response that:
1. Directly addresses the user's question
2. References specific CFR sections using [21CFR§XXX.XX] format
3. Includes practical implementation guidance
4. Provides confidence level (High/Medium/Low)
5. Cites official sources with URLs where applicable
6. Considers the user's specific device classification and regulatory pathway
7. Tailors advice to the user's regulatory profile when relevant

Response:`

  return prompt
}

function extractCitations(text: string, relevantDocs: RegulatoryDocument[]): Citation[] {
  const citations: Citation[] = []
  
  // Extract CFR citations
  const cfrPattern = /\[21CFR§(\d+)\.(\d+)\]/g
  let match
  while ((match = cfrPattern.exec(text)) !== null) {
    const [, part, section] = match
    citations.push({
      id: Math.random().toString(36).substr(2, 9),
      code: `21 CFR ${part}.${section}`,
      title: `Code of Federal Regulations Title 21 Part ${part} Section ${section}`,
      url: `https://www.ecfr.gov/current/title-21/part-${part}/section-${part}.${section}`,
      type: 'fda',
      confidence: 0.9
    })
  }

  // Extract ISO citations
  const isoPattern = /\[ISO§(\d+(?::\d+)?)\]/g
  while ((match = isoPattern.exec(text)) !== null) {
    const [, standard] = match
    citations.push({
      id: Math.random().toString(36).substr(2, 9),
      code: `ISO ${standard}`,
      title: `International Organization for Standardization ${standard}`,
      url: `https://www.iso.org/standard/${standard.replace(':', '-')}.html`,
      type: 'iso',
      confidence: 0.8
    })
  }

  // Extract EU MDR citations
  const euMdrPattern = /\[EUMDR§(Article\d+)\]/g
  while ((match = euMdrPattern.exec(text)) !== null) {
    const [, article] = match
    citations.push({
      id: Math.random().toString(36).substr(2, 9),
      code: `EU MDR ${article}`,
      title: `European Medical Device Regulation ${article}`,
      url: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745`,
      type: 'eu-mdr',
      confidence: 0.8
    })
  }

  // Add citations from retrieved documents
  relevantDocs.forEach(doc => {
    if (doc.similarity && doc.similarity > SIMILARITY_THRESHOLD) {
      citations.push({
        id: doc.id,
        code: `21 CFR ${doc.cfr_part}.${doc.cfr_section}`,
        title: doc.title,
        url: doc.source_url,
        type: 'regulatory',
        confidence: doc.similarity
      })
    }
  })

  return citations
}

function calculateConfidenceScore(response: string, relevantDocs: RegulatoryDocument[]): string {
  let score = 0
  
  // Check for specific citations
  const cfrCitations = (response.match(/\[21CFR§\d+\.\d+\]/g) || []).length
  score += cfrCitations * 0.3
  
  // Check for relevant document usage
  score += relevantDocs.length * 0.2
  
  // Check for confidence indicators in response
  if (response.includes('specifically states') || response.includes('according to')) score += 0.2
  if (response.includes('may') || response.includes('generally')) score -= 0.1
  
  if (score >= 0.8) return 'High'
  if (score >= 0.5) return 'Medium'
  return 'Low'
}