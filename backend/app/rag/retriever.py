from app.rag.embeddings import EmbeddingService
from app.db.repositories import DocumentRepository
from app.rag.models import SearchRequest, SearchResult
from typing import List

class SemanticRetriever:
    def __init__(self):
        self.embedding_service = EmbeddingService()

    def search(self, request: SearchRequest) -> List[SearchResult]:
        if not request.query or not request.query.strip():
            raise ValueError("Query cannot be empty")
            
        # 1. Generate query embedding
        try:
            query_embedding = self.embedding_service.embed_text(request.query)
        except Exception as e:
            # Re-raise to be handled by API layer
            raise Exception(f"Embedding generation failed: {str(e)}")
        
        # 2. Search database
        try:
            db_results = DocumentRepository.search_similar_chunks(
                query_embedding=query_embedding,
                document_id=request.document_id,
                similarity_threshold=request.similarity_threshold,
                top_k=request.top_k
            )
        except Exception as e:
            raise Exception(f"Database search failed: {str(e)}")
            
        # 3. Format results
        results = []
        if db_results:
            for row in db_results:
                results.append(SearchResult(
                    chunk_id=str(row.get("chunk_id")),
                    document_id=str(row.get("document_id")),
                    chunk_index=row.get("chunk_index"),
                    content=row.get("content"),
                    similarity=row.get("similarity")
                ))
            
        return results
