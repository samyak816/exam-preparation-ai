from typing import Optional, List
from pydantic import BaseModel, Field

class DocumentChunk(BaseModel):
    chunk_index: int
    text: str
    start_char: int
    end_char: int
    embedding: Optional[List[float]] = None

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    document_id: Optional[str] = None
    top_k: int = Field(5, ge=1, le=20)
    similarity_threshold: float = Field(0.5, ge=0.0, le=1.0)

class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    chunk_index: int
    content: str
    similarity: float
