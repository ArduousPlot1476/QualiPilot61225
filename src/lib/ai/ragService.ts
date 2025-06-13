import { supabase } from '../supabase/client';

export interface RegulatoryDocument {
  id: string;
  title: string;
  content: string;
  cfr_title: number;
  cfr_part: number;
  cfr_section: string;
  source_url: string;
  similarity?: number;
}

export interface SearchOptions {
  query: string;
  similarityThreshold?: number;
  maxResults?: number;
  includeKeywordSearch?: boolean;
}

export interface SearchResult {
  documents: RegulatoryDocument[];
  searchType: 'semantic' | 'keyword' | 'hybrid';
  totalResults: number;
  processingTime: number;
}

export class RAGService {
  private static readonly SIMILARITY_THRESHOLD = 0.7;
  private static readonly MAX_RESULTS = 5;
  private static readonly EMBEDDING_MODEL = 'text-embedding-ada-002';

  /**
   * Perform hybrid search combining semantic and keyword search
   */
  static async searchDocuments(options: SearchOptions): Promise<SearchResult> {
    const startTime = Date.now();
    const {
      query,
      similarityThreshold = this.SIMILARITY_THRESHOLD,
      maxResults = this.MAX_RESULTS,
      includeKeywordSearch = true
    } = options;

    try {
      // Generate embedding for semantic search
      const queryEmbedding = await this.generateQueryEmbedding(query);
      
      // Perform semantic search
      const semanticResults = await this.performSemanticSearch(
        queryEmbedding,
        similarityThreshold,
        maxResults
      );

      let allResults = semanticResults;
      let searchType: 'semantic' | 'keyword' | 'hybrid' = 'semantic';

      // Perform keyword search if enabled and semantic results are insufficient
      if (includeKeywordSearch && semanticResults.length < maxResults) {
        const keywordResults = await this.performKeywordSearch(query, maxResults);
        allResults = this.combineAndDeduplicateResults(semanticResults, keywordResults);
        searchType = keywordResults.length > 0 ? 'hybrid' : 'semantic';
      }

      const processingTime = Date.now() - startTime;

      return {
        documents: allResults.slice(0, maxResults),
        searchType,
        totalResults: allResults.length,
        processingTime
      };

    } catch (error) {
      console.error('RAG search error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for specific CFR sections
   */
  static async searchCFRSection(
    title: number,
    part: number,
    section?: string
  ): Promise<RegulatoryDocument[]> {
    try {
      let query = supabase
        .from('regulatory_documents')
        .select('*')
        .eq('cfr_title', title)
        .eq('cfr_part', part);

      if (section) {
        query = query.eq('cfr_section', section);
      }

      const { data, error } = await query.order('cfr_section');

      if (error) {
        throw new Error(`CFR search failed: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('CFR search error:', error);
      throw error;
    }
  }

  /**
   * Get document by ID with related citations
   */
  static async getDocumentWithCitations(documentId: string): Promise<{
    document: RegulatoryDocument;
    citations: any[];
  } | null> {
    try {
      const { data: document, error: docError } = await supabase
        .from('regulatory_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        return null;
      }

      const { data: citations, error: citError } = await supabase
        .from('regulatory_citations')
        .select('*')
        .eq('document_id', documentId);

      if (citError) {
        console.error('Error fetching citations:', citError);
      }

      return {
        document,
        citations: citations || []
      };

    } catch (error) {
      console.error('Error fetching document with citations:', error);
      return null;
    }
  }

  /**
   * Generate embedding for query text
   */
  private static async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      // Call OpenAI embeddings API through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-embedding', {
        body: { text: query, model: this.EMBEDDING_MODEL }
      });

      if (error) {
        throw new Error(`Embedding generation failed: ${error.message}`);
      }

      return data.embedding;

    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Perform semantic search using vector similarity
   */
  private static async performSemanticSearch(
    queryEmbedding: number[],
    similarityThreshold: number,
    maxResults: number
  ): Promise<RegulatoryDocument[]> {
    try {
      const { data, error } = await supabase.rpc('search_regulatory_documents', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        similarity_threshold: similarityThreshold,
        match_count: maxResults
      });

      if (error) {
        throw new Error(`Semantic search failed: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }

  /**
   * Perform keyword-based search
   */
  private static async performKeywordSearch(
    query: string,
    maxResults: number
  ): Promise<RegulatoryDocument[]> {
    try {
      // Clean query for text search
      const cleanQuery = query.replace(/[^\w\s]/g, '').trim();
      
      if (!cleanQuery) {
        return [];
      }

      const { data, error } = await supabase
        .from('regulatory_documents')
        .select('*')
        .or(`title.ilike.%${cleanQuery}%,content.ilike.%${cleanQuery}%`)
        .limit(maxResults);

      if (error) {
        throw new Error(`Keyword search failed: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Keyword search error:', error);
      return [];
    }
  }

  /**
   * Combine and deduplicate search results
   */
  private static combineAndDeduplicateResults(
    semanticResults: RegulatoryDocument[],
    keywordResults: RegulatoryDocument[]
  ): RegulatoryDocument[] {
    const combined = [...semanticResults];
    const existingIds = new Set(semanticResults.map(doc => doc.id));

    for (const doc of keywordResults) {
      if (!existingIds.has(doc.id)) {
        combined.push(doc);
        existingIds.add(doc.id);
      }
    }

    return combined;
  }

  /**
   * Extract regulatory citations from text
   */
  static extractCitations(text: string): Array<{
    type: 'cfr' | 'iso' | 'eu-mdr';
    code: string;
    url: string;
    confidence: number;
  }> {
    const citations = [];

    // CFR citations
    const cfrPattern = /(?:21\s*CFR\s*)?(\d+)\.(\d+)/gi;
    let match;
    while ((match = cfrPattern.exec(text)) !== null) {
      const [, part, section] = match;
      citations.push({
        type: 'cfr' as const,
        code: `21 CFR ${part}.${section}`,
        url: `https://www.ecfr.gov/current/title-21/part-${part}/section-${part}.${section}`,
        confidence: 0.9
      });
    }

    // ISO citations
    const isoPattern = /ISO\s*(\d+(?::\d+)?)/gi;
    while ((match = isoPattern.exec(text)) !== null) {
      const [, standard] = match;
      citations.push({
        type: 'iso' as const,
        code: `ISO ${standard}`,
        url: `https://www.iso.org/standard/${standard.replace(':', '-')}.html`,
        confidence: 0.8
      });
    }

    // EU MDR citations
    const euMdrPattern = /(?:EU\s*MDR|MDR)\s*(Article\s*\d+)/gi;
    while ((match = euMdrPattern.exec(text)) !== null) {
      const [, article] = match;
      citations.push({
        type: 'eu-mdr' as const,
        code: `EU MDR ${article}`,
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745',
        confidence: 0.8
      });
    }

    return citations;
  }

  /**
   * Chunk text for processing
   */
  static chunkText(
    text: string,
    chunkSize: number = 800,
    overlapPercentage: number = 0.2
  ): string[] {
    const overlap = Math.floor(chunkSize * overlapPercentage);
    const chunks: string[] = [];
    
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize);
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }
}