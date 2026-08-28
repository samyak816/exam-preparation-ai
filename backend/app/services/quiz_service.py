import os
import json
from typing import List, Optional, Dict, Any
from google import genai
from app.core.config import settings
from app.rag.retriever import SemanticRetriever
from app.rag.models import SearchRequest

class QuizService:
    def __init__(self):
        self.retriever = SemanticRetriever()
        
        api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing. Cannot initialize QuizService.")
            
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-3.6-flash"

    def generate_quiz(self, topic: str, number_of_questions: int = 5, difficulty: str = "medium", document_id: Optional[str] = None) -> Dict[str, Any]:
        if not topic or not topic.strip():
            raise ValueError("Topic cannot be empty.")
            
        if not (1 <= number_of_questions <= 20):
            raise ValueError("Number of questions must be between 1 and 20.")
            
        if difficulty not in ["easy", "medium", "hard"]:
            raise ValueError("Difficulty must be easy, medium, or hard.")
            
        # 1. Retrieve relevant chunks based on topic
        # Fetch a healthy amount of top_k to ensure enough content for the quiz
        search_req = SearchRequest(
            query=f"{topic} concepts and facts",
            document_id=document_id,
            top_k=min(15, number_of_questions * 3), 
            similarity_threshold=0.3
        )
        
        try:
            results = self.retriever.search(search_req)
        except Exception as e:
            raise Exception(f"Retrieval error: {str(e)}")
            
        # 2. Check if we have enough context
        if not results:
            return {
                "topic": topic,
                "error": "I couldn't find enough information about that topic in your uploaded study material to generate a quiz."
            }
            
        # 3. Construct Context for Prompt
        context_blocks = []
        for i, res in enumerate(results):
            context_blocks.append(f"Chunk {i+1}\n{res.content}")
            
        context_text = "\n\n".join(context_blocks)
        
        prompt = f"""You are Exam Preparation AI, an AI study assistant for AI/ML students.
Your task is to generate a multiple-choice quiz based strictly on the supplied study material.

Topic: {topic}
Number of questions: {number_of_questions}
Difficulty: {difficulty}

Rules:
- DO NOT generate questions from general knowledge. ONLY use facts present in the STUDY MATERIAL below.
- Generate EXACTLY {number_of_questions} multiple-choice questions.
- Provide exactly 4 options per question.
- Indicate the correct answer index (0, 1, 2, or 3).
- Provide a brief explanation for the correct answer based on the text.
- Output ONLY valid JSON in the specified format, without Markdown code fences, just the raw JSON object.

Format your response exactly like this:
{{
    "topic": "{topic}",
    "questions": [
        {{
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 1,
            "explanation": "Explanation here."
        }}
    ]
}}

STUDY MATERIAL:
----------------
{context_text}
----------------
"""

        # 4. Generate Quiz via Gemini
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            raw_text = response.text
            
            # Clean up the output in case the model adds markdown code fences
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            raw_text = raw_text.strip()
            
            quiz_data = json.loads(raw_text)
            return quiz_data
        except json.JSONDecodeError:
            raise Exception("Failed to parse the generated quiz. The model did not return valid JSON.")
        except Exception as e:
            raise Exception(f"Gemini generation error: {str(e)}")
