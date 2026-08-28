import os
from typing import List
from google import genai
from google.genai import types
from app.core.config import settings

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        if not self.api_key:
            # Fallback to check os.environ directly if not loaded
            self.api_key = os.environ.get("GEMINI_API_KEY")
            
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is missing. Please set it in your .env file or environment.")
            
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = settings.embedding_model
        self.dimension = settings.embedding_dimension

    def embed_text(self, text: str) -> List[float]:
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text.")
            
        try:
            result = self.client.models.embed_content(
                model=self.model_name,
                contents=text,
                config=types.EmbedContentConfig(
                    output_dimensionality=self.dimension,
                    task_type="RETRIEVAL_DOCUMENT",
                )
            )
            return result.embeddings[0].values
        except Exception as e:
            raise Exception(f"Gemini API error during embedding generation: {str(e)}")

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
            
        embeddings = []
        for i, text in enumerate(texts):
            try:
                result = self.client.models.embed_content(
                    model=self.model_name,
                    contents=text,
                    config=types.EmbedContentConfig(
                        output_dimensionality=self.dimension,
                        task_type="RETRIEVAL_DOCUMENT",
                    )
                )
                embeddings.append(result.embeddings[0].values)
            except Exception as e:
                raise Exception(f"Gemini API error during batch embedding generation at index {i}: {str(e)}")
                
        return embeddings
