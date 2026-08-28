from fastapi import APIRouter, HTTPException
from app.rag.models import SearchRequest, SearchResult
from app.rag.retriever import SemanticRetriever
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]

@router.post("", response_model=SearchResponse)
async def semantic_search(request: SearchRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        retriever = SemanticRetriever()
        results = retriever.search(request)
        return SearchResponse(
            query=request.query,
            results=results
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Do not expose internal details like credentials, but provide context
        error_msg = str(e)
        if "API key" in error_msg or "password" in error_msg.lower():
            error_msg = "Internal configuration error."
        raise HTTPException(status_code=500, detail=f"Search failed: {error_msg}")
