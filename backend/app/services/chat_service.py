import os
from typing import List, Optional, Dict, Any
from google import genai
from app.core.config import settings
from app.rag.retriever import SemanticRetriever
from app.rag.models import SearchRequest, SearchResult

class ChatService:
    def __init__(self):
        self.retriever = SemanticRetriever()
        
        api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing. Cannot initialize ChatService.")
            
        self.client = genai.Client(api_key=api_key)
        # Requirement: Use gemini-3.6-flash
        self.model_name = "gemini-3.6-flash"

    def chat(self, question: str, document_id: Optional[str] = None, top_k: int = 5, similarity_threshold: float = 0.3) -> Dict[str, Any]:
        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")
            
        # 1. Retrieve relevant chunks
        search_req = SearchRequest(
            query=question,
            document_id=document_id,
            top_k=top_k,
            similarity_threshold=similarity_threshold
        )
        
        try:
            results = self.retriever.search(search_req)
        except Exception as e:
            raise Exception(f"Retrieval error: {str(e)}")
            
        # 2. Check if we have enough context
        if not results:
            return {
                "question": question,
                "answer": "I couldn't find enough information about that in your uploaded study material. Try uploading the relevant notes or asking about another topic.",
                "sources": []
            }
            
        # 3. Construct Context for Prompt
        context_blocks = []
        sources = []
        for i, res in enumerate(results):
            context_blocks.append(f"Chunk {i+1}\n{res.content}")
            sources.append({
                "document_id": res.document_id,
                "chunk_id": res.chunk_id,
                "chunk_index": res.chunk_index,
                "similarity": res.similarity
            })
            
        context_text = "\n\n".join(context_blocks)
        
        prompt = f"""You are Exam Preparation AI, an AI study assistant for AI/ML students.

Your task is to analyze the STUDENT MESSAGE and determine if it is a direct QUESTION or just pasted STUDY_MATERIAL (like definitions, notes, textbook excerpts).

1. INTENT DETECTION & BEHAVIOR:
- If the user asks a question, answer the question normally using the STUDY MATERIAL context.
- If the user just pastes study material without a clear question (e.g., definitions, formulas, terminology), classify it as STUDY_MATERIAL. Do not ask them what they want. Instead, proactively provide an exam-focused explanation.

2. STUDY MATERIAL FORMAT:
If it is STUDY_MATERIAL, you MUST use this exact default structure:

### Quick Explanation
Explain the material simply.

### Key Points
List the important concepts.

### Exam Tip
Mention what the student should remember.

### Quick Check
Give 2-3 short questions based on the material.

3. SUPPORT STUDY COMMANDS:
Recognize and follow commands like: Explain, Summarize, Simplify, Generate MCQs, Generate flashcards, Give examples, Create exam tips, etc.

4. RULES:
- Prefer the supplied study material over general knowledge.
- Do not invent facts that are not supported by the supplied material.
- Explain concepts clearly for an engineering student preparing for exams.
- When useful, use headings, bullet points, examples, formulas, or short step-by-step explanations.
- If the supplied material does not contain enough information, clearly say so.
- Do not claim that information came from the notes unless it is actually present in the retrieved context.
- VERY IMPORTANT: Do NOT respond with generic lines like "It looks like you've shared..." or "How would you like me to help?" Provide the proactive study response instead.

RELEVANT STUDY MATERIAL CONTEXT:
----------------
{context_text}
----------------

STUDENT MESSAGE:
{question}
"""

        # 4. Generate Answer via Gemini
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            answer = response.text
        except Exception as e:
            raise Exception(f"Gemini generation error: {str(e)}")
            
        return {
            "question": question,
            "answer": answer,
            "sources": sources
        }
