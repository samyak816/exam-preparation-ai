# ExamPrep AI

**An AI-powered study companion that transforms course material into an interactive exam-preparation workspace.**

ExamPrep AI lets students upload their own study material — PDF, DOCX, or TXT — and then chat with it, generate quizzes, and study using AI responses grounded in that material via Retrieval-Augmented Generation (RAG).

![Frontend](https://img.shields.io/badge/Frontend-Next.js-000000?logo=next.js&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pgvector-336791?logo=postgresql&logoColor=white)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Description |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📚 **Document-Based AI Chat** | Ask questions about uploaded study material and receive contextual answers grounded in the relevant source content. |
| 🧠 **Retrieval-Augmented Generation** | Retrieves relevant passages from uploaded documents before generating a response, keeping answers tied to the student's own material rather than general model knowledge. |
| 📝 **Smart Quiz Generation** | Automatically generates quizzes from uploaded material to test understanding and support exam prep. |
| 📖 **Study Assistant Mode** | Paste terminology or study text directly for focused explanations and targeted study help. |
| 🔐 **User Authentication** | Supabase Auth handles registration, login, logout, and authenticated access to app features. |

---

## How It Works

ExamPrep AI follows a three-stage RAG pipeline:

### 1. Upload & Ingestion

When a user uploads a PDF, DOCX, or TXT file:

1. The backend extracts the raw text.
2. The text is split into smaller chunks.
3. Each chunk is converted into a vector embedding via the Gemini API.
4. Embeddings and document metadata are stored in PostgreSQL using `pgvector`.

### 2. Retrieval

When a user asks a question:

1. The question is converted into a vector embedding.
2. A similarity search runs against the vector database.
3. The most relevant document chunks are retrieved.

### 3. Generation

The backend sends the following to Gemini to produce the final response:

- The user's original question
- The retrieved document context
- Study-assistant system instructions

---

## Architecture

```text
                     ┌───────────────────────────┐
                     │      Next.js Frontend      │
                     │   React + TypeScript       │
                     │   Tailwind CSS             │
                     └─────────────┬─────────────┘
                                   │
                                   │ REST API
                                   ▼
                     ┌───────────────────────────┐
                     │      FastAPI Backend       │
                     │           Python           │
                     ├───────────────────────────┤
                     │ Document Processing        │
                     │ RAG Pipeline               │
                     │ Chat Services              │
                     │ Quiz Services              │
                     └─────────────┬─────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
          ┌─────────────────────┐     ┌─────────────────────┐
          │   Google Gemini     │     │      Supabase       │
          │                     │     │                     │
          │  Embeddings         │     │  PostgreSQL +       │
          │  Generation         │     │  pgvector           │
          │                     │     │  Authentication     │
          └─────────────────────┘     └─────────────────────┘