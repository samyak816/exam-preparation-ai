from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    project_name: str = "Exam Preparation AI Backend"
    api_v1_str: str = "/api"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    gemini_api_key: str = ""
    embedding_model: str = "gemini-embedding-2"
    embedding_dimension: int = 768
    supabase_url: str = ""
    supabase_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
