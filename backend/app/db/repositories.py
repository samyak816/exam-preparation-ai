from typing import List, Dict, Any, Optional
from app.db.database import get_supabase_client

class DocumentRepository:
    """
    Repository layer for interacting with the Supabase database.
    This separates the SQL/Supabase logic from the application logic.
    """
    
    @staticmethod
    def create_document(document_data: Dict[str, Any]) -> dict:
        """
        Creates a new document record in the database.
        
        :param document_data: dictionary containing 'filename', 'file_type', 'original_file_path', etc.
        :return: The created database record (including generated 'id').
        """
        supabase = get_supabase_client()
        result = supabase.table("documents").insert(document_data).execute()
        return result.data[0] if result.data else {}

    @staticmethod
    def get_document_by_id(document_id: str) -> dict:
        """
        Retrieves a document by its UUID.
        """
        supabase = get_supabase_client()
        result = supabase.table("documents").select("*").eq("id", document_id).execute()
        return result.data[0] if result.data else {}

    @staticmethod
    def get_all_documents() -> List[dict]:
        """
        Retrieves all uploaded documents, ordered by created_at descending.
        """
        supabase = get_supabase_client()
        result = supabase.table("documents").select("*").order("created_at", desc=True).execute()
        return result.data

    @staticmethod
    def insert_document_chunks(chunks_data: List[Dict[str, Any]]) -> List[dict]:
        """
        Inserts multiple document chunks (including their text and embeddings) into the database.
        
        :param chunks_data: List of dictionaries matching the 'document_chunks' table schema.
        :return: The created records.
        """
        if not chunks_data:
            return []
            
        supabase = get_supabase_client()
        # Supabase API allows batch inserting by passing a list of dictionaries
        result = supabase.table("document_chunks").insert(chunks_data).execute()
        return result.data
        
    @staticmethod
    def get_chunks_by_document_id(document_id: str) -> List[dict]:
        """
        Retrieves all chunks associated with a specific document, ordered by chunk_index.
        
        :param document_id: The UUID of the document.
        :return: List of chunk records.
        """
        supabase = get_supabase_client()
        result = supabase.table("document_chunks").select("*").eq("document_id", document_id).order("chunk_index").execute()
        return result.data

    @staticmethod
    def search_similar_chunks(
        query_embedding: List[float],
        document_id: Optional[str] = None,
        similarity_threshold: float = 0.5,
        top_k: int = 5
    ) -> List[dict]:
        """
        Searches for document chunks similar to the query embedding.
        Uses the match_document_chunks RPC function in Supabase.
        """
        supabase = get_supabase_client()
        
        rpc_params = {
            "query_embedding": query_embedding,
            "match_threshold": similarity_threshold,
            "match_count": top_k
        }
        
        if document_id:
            rpc_params["filter_document_id"] = document_id
            
        result = supabase.rpc("match_document_chunks", rpc_params).execute()
        return result.data
