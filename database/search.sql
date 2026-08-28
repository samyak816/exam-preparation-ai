-- PostgreSQL function for pgvector similarity search
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    filter_document_id uuid DEFAULT NULL
)
RETURNS TABLE (
    chunk_id uuid,
    document_id uuid,
    chunk_index int,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        document_chunks.id AS chunk_id,
        document_chunks.document_id,
        document_chunks.chunk_index,
        document_chunks.content,
        1 - (document_chunks.embedding <=> query_embedding) AS similarity
    FROM document_chunks
    WHERE 
        (filter_document_id IS NULL OR document_chunks.document_id = filter_document_id)
        AND 1 - (document_chunks.embedding <=> query_embedding) >= match_threshold
    ORDER BY document_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
