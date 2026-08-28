from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.chat_service import ChatService

router = APIRouter()

class ChatRequest(BaseModel):
    question: str = Field(..., description="The user's question to the AI.")
    document_id: Optional[str] = Field(None, description="Optional UUID to restrict search to a single document.")
    top_k: int = Field(5, description="Number of chunks to retrieve.", ge=1, le=20)
    similarity_threshold: float = Field(0.3, description="Minimum similarity threshold.", ge=0.0, le=1.0)

class Source(BaseModel):
    document_id: str
    chunk_id: str
    chunk_index: int
    similarity: float

class ChatResponse(BaseModel):
    question: str
    answer: str
    sources: List[Source]

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    try:
        chat_service = ChatService()
        result = chat_service.chat(
            question=request.question,
            document_id=request.document_id,
            top_k=request.top_k,
            similarity_threshold=request.similarity_threshold
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # We allow 500 error for retrieval or generation error, but give a clear message
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
