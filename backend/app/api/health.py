from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def health_check():
    return {
        "status": "healthy",
        "service": "exam-preparation-ai-backend"
    }

from app.core.config import settings
@router.get("/debug")
async def debug_settings():
    return {"dimension": settings.embedding_dimension}
