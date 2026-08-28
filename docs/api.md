# API Specification

This document outlines the initial RESTful API endpoints exposed by the FastAPI backend for the Exam Preparation AI Agent.

Base URL: `/api`

---

## 1. Health Check

Check the status of the backend service.

*   **Endpoint:** `GET /api/health`
*   **Description:** Returns a simple JSON object indicating the server is running.
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
      "status": "healthy",
      "version": "1.0.0"
    }
    ```

---

## 2. Document Upload

Upload a document (PDF, DOCX, TXT) for processing and indexing.

*   **Endpoint:** `POST /api/documents/upload`
*   **Description:** Accepts a multipart/form-data request containing the file. Extracts text, generates embeddings, and stores them in the database.
*   **Headers:**
    *   `Authorization: Bearer <token>`
*   **Request Body:** `multipart/form-data`
    *   `file`: The file to upload.
*   **Response (201 Created):**
    ```json
    {
      "document_id": "uuid-1234",
      "filename": "machine_learning_notes.pdf",
      "status": "processing",
      "message": "Document uploaded and is being processed."
    }
    ```

---

## 3. List Documents

Retrieve a list of documents uploaded by the authenticated user.

*   **Endpoint:** `GET /api/documents`
*   **Description:** Returns metadata for all documents owned by the user.
*   **Headers:**
    *   `Authorization: Bearer <token>`
*   **Request Body:** None
*   **Response (200 OK):**
    ```json
    {
      "documents": [
        {
          "document_id": "uuid-1234",
          "filename": "machine_learning_notes.pdf",
          "upload_date": "2026-08-14T10:00:00Z",
          "status": "ready"
        }
      ]
    }
    ```

---

## 4. AI Chat

Send a query to the AI agent based on the uploaded documents.

*   **Endpoint:** `POST /api/chat`
*   **Description:** Accepts a user query, performs RAG (Retrieval-Augmented Generation) against the user's documents, and returns the AI's response.
*   **Headers:**
    *   `Authorization: Bearer <token>`
*   **Request Body:** `application/json`
    ```json
    {
      "query": "What is backpropagation?",
      "document_ids": ["uuid-1234"] // Optional: restrict search to specific docs
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "response": "Backpropagation is an algorithm used in training neural networks...",
      "sources": [
        {
          "document_id": "uuid-1234",
          "page_number": 15
        }
      ]
    }
    ```

---

## 5. Generate Quiz

Generate a quiz based on uploaded documents.

*   **Endpoint:** `POST /api/quiz/generate`
*   **Description:** Generates a set of questions (e.g., multiple choice) from the specified documents using the AI model.
*   **Headers:**
    *   `Authorization: Bearer <token>`
*   **Request Body:** `application/json`
    ```json
    {
      "document_ids": ["uuid-1234"],
      "topic": "Neural Networks", // Optional
      "num_questions": 5,
      "question_type": "multiple_choice"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "quiz_id": "uuid-5678",
      "questions": [
        {
          "id": "q1",
          "question": "Which function is commonly used as an activation function in hidden layers?",
          "options": ["Sigmoid", "ReLU", "Linear", "Softmax"],
          "answer": "ReLU"
        }
      ]
    }
    ```
