import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface eCFRDocument {
  title: string
  part: number
  section?: string
  content: string
  url: string
  lastModified: string
}

interface EmbeddingResponse {
  data: Array<{
    embedding: number[]
  }>
}

const ECFR_API_BASE = 'https://www.ecfr.gov/api/versioner/v1'
const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings'

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

    // Verify service role access
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.includes('service_role')) {
      return new Response(
        JSON.stringify({ error: 'Service role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting eCFR sync for Title 21 medical device regulations...')

    // Sync Title 21 CFR Parts 800-1299 (Medical Devices)
    const medicalDeviceParts = Array.from({ length: 500 }, (_, i) => 800 + i) // Parts 800-1299

    let totalSynced = 0
    let totalErrors = 0

    for (const part of medicalDeviceParts) {
      try {
        console.log(`Syncing CFR Title 21 Part ${part}...`)
        
        // Fetch part structure from eCFR API
        const partResponse = await fetch(
          `${ECFR_API_BASE}/structure/2024-01-01/title-21/part-${part}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'QualiPilot-Regulatory-Assistant/1.0'
            }
          }
        )

        if (!partResponse.ok) {
          if (partResponse.status === 404) {
            console.log(`Part ${part} not found, skipping...`)
            continue
          }
          throw new Error(`eCFR API error: ${partResponse.status}`)
        }

        const partData = await partResponse.json()
        
        if (!partData.children || partData.children.length === 0) {
          console.log(`Part ${part} has no sections, skipping...`)
          continue
        }

        // Process each section in the part
        for (const section of partData.children) {
          if (section.type !== 'section') continue

          try {
            // Fetch section content
            const sectionResponse = await fetch(
              `${ECFR_API_BASE}/full/2024-01-01/title-21/part-${part}/section-${section.identifier}`,
              {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'QualiPilot-Regulatory-Assistant/1.0'
                }
              }
            )

            if (!sectionResponse.ok) {
              console.error(`Failed to fetch section ${section.identifier}: ${sectionResponse.status}`)
              totalErrors++
              continue
            }

            const sectionData = await sectionResponse.json()
            
            // Extract text content
            const content = extractTextContent(sectionData)
            if (!content || content.length < 100) {
              console.log(`Section ${section.identifier} has insufficient content, skipping...`)
              continue
            }

            // Create document object
            const document: eCFRDocument = {
              title: `21 CFR ${part}.${section.identifier} - ${section.title || 'Medical Device Regulation'}`,
              part: part,
              section: section.identifier,
              content: content,
              url: `https://www.ecfr.gov/current/title-21/part-${part}/section-${part}.${section.identifier}`,
              lastModified: new Date().toISOString()
            }

            // Generate embedding for semantic search
            const embedding = await generateEmbedding(content, openaiApiKey)
            
            // Store in database
            await storeDocument(supabase, document, embedding)
            
            totalSynced++
            console.log(`Synced: ${document.title}`)

            // Rate limiting - respect eCFR API limits
            await new Promise(resolve => setTimeout(resolve, 100))

          } catch (sectionError) {
            console.error(`Error processing section ${section.identifier}:`, sectionError)
            totalErrors++
          }
        }

        // Rate limiting between parts
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (partError) {
        console.error(`Error processing part ${part}:`, partError)
        totalErrors++
      }
    }

    console.log(`eCFR sync completed. Synced: ${totalSynced}, Errors: ${totalErrors}`)

    return new Response(
      JSON.stringify({
        success: true,
        synced: totalSynced,
        errors: totalErrors,
        message: 'eCFR sync completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('eCFR sync error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'eCFR sync failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function extractTextContent(sectionData: any): string {
  let content = ''
  
  function extractFromNode(node: any): void {
    if (typeof node === 'string') {
      content += node + ' '
      return
    }
    
    if (node.text) {
      content += node.text + ' '
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(extractFromNode)
    }
  }
  
  if (sectionData.children) {
    sectionData.children.forEach(extractFromNode)
  }
  
  return content.trim().replace(/\s+/g, ' ')
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  // Chunk text if too long (max 8192 tokens for text-embedding-ada-002)
  const maxLength = 8000 // Conservative limit
  const textToEmbed = text.length > maxLength ? text.substring(0, maxLength) : text
  
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
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
  
  const data: EmbeddingResponse = await response.json()
  return data.data[0].embedding
}

async function storeDocument(
  supabase: any,
  document: eCFRDocument,
  embedding: number[]
): Promise<void> {
  // Check if document already exists
  const { data: existing } = await supabase
    .from('regulatory_documents')
    .select('id')
    .eq('cfr_title', 21)
    .eq('cfr_part', document.part)
    .eq('cfr_section', document.section)
    .single()

  const documentData = {
    title: document.title,
    cfr_title: 21,
    cfr_part: document.part,
    cfr_section: document.section,
    content: document.content,
    embedding: `[${embedding.join(',')}]`,
    source_url: document.url,
    last_updated: document.lastModified,
    metadata: {
      source: 'eCFR',
      sync_date: new Date().toISOString(),
      content_length: document.content.length
    }
  }

  if (existing) {
    // Update existing document
    const { error } = await supabase
      .from('regulatory_documents')
      .update(documentData)
      .eq('id', existing.id)

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`)
    }
  } else {
    // Insert new document
    const { error } = await supabase
      .from('regulatory_documents')
      .insert(documentData)

    if (error) {
      throw new Error(`Failed to insert document: ${error.message}`)
    }
  }
}