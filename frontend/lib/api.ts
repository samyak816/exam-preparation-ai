export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function healthCheck() {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error("Backend is offline or unreachable.");
  }
  return response.json();
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Upload failed");
  }

  return response.json();
}

export async function searchDocuments(query: string, topK: number = 3) {
  const response = await fetch(`${API_URL}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, top_k: topK }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Search failed");
  }

  return response.json();
}

export async function chatRequest(question: string, topK: number = 5, similarityThreshold: number = 0.3, documentId?: string) {
  const body: any = {
    question,
    top_k: topK,
    similarity_threshold: similarityThreshold
  };
  
  if (documentId) {
    body.document_id = documentId;
  }

  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Chat request failed");
  }

  return response.json();
}

export async function getDocuments() {
  let response;
  try {
    response = await fetch(`${API_URL}/api/documents`);
  } catch (error) {
    throw new Error("Could not connect to the backend. Is it running?");
  }
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch documents");
  }

  return response.json();
}

export async function generateQuiz(topic: string, numberOfQuestions: number = 5, difficulty: string = "medium", documentId?: string) {
  const body: any = {
    topic,
    number_of_questions: numberOfQuestions,
    difficulty,
  };
  
  if (documentId && documentId !== "all") {
    body.document_id = documentId;
  }

  const response = await fetch(`${API_URL}/api/quiz/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Quiz generation failed");
  }

  return response.json();
}
