-- Create function for semantic search of regulatory documents
CREATE OR REPLACE FUNCTION search_regulatory_documents(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  cfr_title integer,
  cfr_part integer,
  cfr_section text,
  source_url text,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    rd.id,
    rd.title,
    rd.content,
    rd.cfr_title,
    rd.cfr_part,
    rd.cfr_section,
    rd.source_url,
    1 - (rd.embedding <=> query_embedding) AS similarity
  FROM regulatory_documents rd
  WHERE 1 - (rd.embedding <=> query_embedding) > similarity_threshold
  ORDER BY rd.embedding <=> query_embedding
  LIMIT match_count;
$$;