from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, documents, search, chat, quiz
from app.core.config import settings

app = FastAPI(
    title=settings.project_name,
    openapi_url=f"{settings.api_v1_str}/openapi.json"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(health.router, prefix=settings.api_v1_str, tags=["health"])
app.include_router(documents.router, prefix=f"{settings.api_v1_str}/documents", tags=["documents"])
app.include_router(search.router, prefix=f"{settings.api_v1_str}/search", tags=["search"])
app.include_router(chat.router, prefix=f"{settings.api_v1_str}/chat", tags=["chat"])
app.include_router(quiz.router, prefix=f"{settings.api_v1_str}/quiz", tags=["quiz"])
