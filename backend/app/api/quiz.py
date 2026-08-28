from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.quiz_service import QuizService

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str = Field(..., description="The topic to generate the quiz on.")
    document_id: Optional[str] = Field(None, description="Optional UUID to restrict search to a single document.")
    number_of_questions: int = Field(5, description="Number of questions to generate (1-20).", ge=1, le=20)
    difficulty: str = Field("medium", description="Difficulty level: easy, medium, hard.")

@router.post("/generate")
async def generate_quiz_endpoint(request: QuizRequest):
    if not request.topic or not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
        
    if request.difficulty not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Difficulty must be easy, medium, or hard.")
        
    try:
        quiz_service = QuizService()
        result = quiz_service.generate_quiz(
            topic=request.topic,
            number_of_questions=request.number_of_questions,
            difficulty=request.difficulty,
            document_id=request.document_id
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
