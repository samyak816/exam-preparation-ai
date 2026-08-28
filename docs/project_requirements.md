# Project Requirements

## Overview
The Exam Preparation AI Agent is designed for AI/ML department students. It allows them to upload course materials (PDF, DOCX, TXT) and interact with an AI to ask questions, summarize content, and generate quizzes based on those materials.

## Functional Requirements

### 1. User Authentication
*   Users must be able to sign up, log in, and log out using Supabase Auth.
*   Access to document uploading, chatting, and quiz features must be restricted to authenticated users.

### 2. Document Management
*   Users can upload study materials in PDF, DOCX, and TXT formats.
*   The system must parse the uploaded files, extract text, and segment it appropriately for processing.
*   Users should be able to view a list of their uploaded documents.

### 3. AI Chat Interface (RAG)
*   Users can ask natural language questions about their uploaded documents.
*   The system must retrieve relevant context from the uploaded documents to answer the questions accurately.
*   The chat interface should maintain conversation history per session.

### 4. Quiz Generation
*   Users can request the generation of a quiz based on specific uploaded documents or topics within them.
*   The system should generate multiple-choice or short-answer questions using the AI model based on the document content.

## Non-Functional Requirements

### 1. Performance
*   The web interface should load quickly and be responsive across devices.
*   Document processing and embedding generation should be handled asynchronously or provide clear progress feedback.
*   Chat responses should be generated with minimal latency.

### 2. Scalability
*   The backend architecture (FastAPI + Python) must be capable of handling multiple concurrent requests.
*   The database (PostgreSQL + pgvector) should efficiently index and search vector embeddings as the number of documents grows.

### 3. Security
*   All API endpoints must be secure, validating user authentication tokens.
*   Uploaded documents must be securely stored and isolated per user (users cannot query other users' documents).
*   API keys (Gemini, Supabase) must be securely managed via environment variables and never exposed to the client.

### 4. Usability
*   The UI (Next.js + Tailwind CSS) should be intuitive, clean, and accessible.
*   Clear error messages should be displayed for unsupported file types, failed uploads, or AI processing errors.

### 5. Tech Stack Adherence
*   **Frontend:** Next.js, TypeScript, Tailwind CSS
*   **Backend:** Python, FastAPI
*   **AI:** Gemini API, RAG architecture, Embeddings
*   **Database:** PostgreSQL, pgvector (hosted on Supabase)
*   **Auth:** Supabase Auth
