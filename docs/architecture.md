# Architecture

The Exam Preparation AI Agent follows a modern, scalable, and decoupled architecture, separating the client interface, server logic, AI processing, and data persistence.

## 1. Frontend (Client-side)
*   **Framework:** Next.js with React
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Deployment:** Vercel
*   **Responsibilities:**
    *   Presenting the User Interface (UI) for document uploading, chatting, and quizzes.
    *   Handling user authentication (communicating with Supabase Auth).
    *   Managing local state and interacting with the backend APIs.

## 2. Backend (Server-side)
*   **Framework:** FastAPI (Python)
*   **Deployment:** Render or Railway
*   **Responsibilities:**
    *   Exposing RESTful APIs for the frontend to consume.
    *   Handling business logic.
    *   Orchestrating the RAG (Retrieval-Augmented Generation) pipeline.
    *   Managing communication with the database and AI provider.

## 3. AI & RAG Pipeline
*   **Model Provider:** Gemini API (Google)
*   **Embeddings:** Text embedding model for vectorizing document content.
*   **RAG Architecture:**
    *   **Ingestion:** Parsing PDF, DOCX, TXT files, chunking text, generating embeddings, and storing them in the vector database.
    *   **Retrieval:** Converting user queries into embeddings, performing similarity search in the vector database to retrieve relevant context.
    *   **Generation:** Prompting the Gemini model with the user query and the retrieved context to generate accurate and grounded answers.

## 4. Database (Data Persistence)
*   **Relational Database:** PostgreSQL
*   **Vector Extension:** pgvector (for storing and querying high-dimensional embeddings)
*   **Hosting:** Supabase
*   **Responsibilities:**
    *   Storing user profiles, chat history, quiz results, and document metadata.
    *   Storing and performing similarity searches on document embeddings via pgvector.

## 5. Authentication
*   **Provider:** Supabase Auth
*   **Responsibilities:** Secure user registration, login, and session management.

## System Flow Diagram (High-Level)
1. User interacts with the **Next.js Frontend**.
2. Frontend sends requests to the **FastAPI Backend**.
3. Backend processes documents/queries:
    *   For uploads: Extracts text, generates embeddings via **Gemini API**, stores in **Supabase PostgreSQL (pgvector)**.
    *   For chat: Retrieves relevant chunks from **Supabase**, sends prompt + context to **Gemini API**, returns response to frontend.
