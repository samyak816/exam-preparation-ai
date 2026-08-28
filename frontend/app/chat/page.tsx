"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Send, Bot, User, Loader2, AlertCircle, Sparkles, Book } from "lucide-react";
import { chatRequest, getDocuments } from "@/lib/api";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { VoiceAssistant } from "@/components/VoiceAssistant";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: any[];
  isError?: boolean;
};

type DocItem = { id: string; filename: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("all");
  const [lastAiResponse, setLastAiResponse] = useState<string>("");
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDocuments()
      .then((res) => {
        const docs = Array.isArray(res) ? res : (res.documents || []);
        setDocuments(docs);
        setDocLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setDocError("Could not load your study materials. Make sure the backend is running.");
        setDocLoading(false);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (overrideQuestion?: string) => {
    const q = overrideQuestion || inputValue.trim();
    if (!q || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setLastAiResponse("");

    try {
      const response = await chatRequest(q, 5, 0.3, selectedDocId === "all" ? undefined : selectedDocId);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: response.answer, sources: response.sources };
      setMessages((prev) => [...prev, aiMsg]);
      setLastAiResponse(response.answer);
    } catch (err: any) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: err.message || "Something went wrong.", isError: true };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getUniqueSources = (sources: any[]) => {
    if (!sources) return [];
    const map = new Map();
    sources.forEach((s) => { if (!map.has(s.chunk_index)) map.set(s.chunk_index, s); });
    return Array.from(map.values());
  };

  const handleVoiceTranscript = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 flex flex-col" style={{ backgroundColor: "rgb(var(--background))" }}>
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div>
            <h1 className="text-xl font-bold flex items-center" style={{ color: "rgb(var(--foreground))" }}>
              <Sparkles className="w-5 h-5 text-indigo-500 mr-2" /> Ask AI
            </h1>
            <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>Ask questions based on your uploaded notes.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Book className="w-4 h-4" style={{ color: "rgb(var(--muted-foreground))" }} />
            {docLoading ? (
              <span className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>Loading your study materials...</span>
            ) : docError ? (
              <span className="text-sm text-red-500">{docError}</span>
            ) : documents.length === 0 ? (
              <span className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>No study materials uploaded yet.</span>
            ) : (
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                aria-label="Select document"
                className="text-sm rounded-lg p-2 border outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ backgroundColor: "rgb(var(--input))", borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
              >
                <option value="all">All Documents</option>
                {documents.map((d) => <option key={d.id} value={d.id}>{d.filename}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "rgb(var(--foreground))" }}>Study Workspace</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>Ask questions based on your uploaded material. The AI will provide clear explanations and generate study aids.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Explain supervised learning", "Summarize key concepts", "Generate exam questions"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-4 py-2 rounded-md border transition-colors hover:bg-muted text-sm font-medium"
                    style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start w-full ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="shrink-0 mr-3 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isError ? "bg-red-100 dark:bg-red-950/40" : "bg-indigo-600"}`}>
                        {msg.isError ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 max-w-[90%] ${
                      msg.role === "user"
                        ? "rounded-xl bg-muted"
                        : "rounded-xl border shadow-sm"
                    }`}
                    style={
                      msg.role === "ai"
                        ? { backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }
                        : { backgroundColor: "rgb(var(--muted))", color: "rgb(var(--foreground))" }
                    }
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}

                    {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--muted-foreground))" }}>Sources</p>
                        <ul className="space-y-1">
                          {getUniqueSources(msg.sources).map((src, idx) => (
                            <li key={idx} className="flex items-center text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                              Chunk {src.chunk_index}
                              <span className="mx-1.5 opacity-40">·</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{(src.similarity * 100).toFixed(0)}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.role === "ai" && msg.content.includes("### Quick Explanation") && (
                      <div className="mt-4 pt-3 flex flex-wrap gap-2 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                        {["Explain Simply", "Summarize", "Make MCQs", "Make Flashcards", "Exam Questions"].map((action) => (
                          <button
                            key={action}
                            onClick={() => {
                              const prevUserMsg = messages[messages.indexOf(msg) - 1]?.content || "";
                              handleSend(`${action}:\n\n${prevUserMsg}`);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                            style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--background))" }}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="shrink-0 ml-3 mt-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgb(var(--muted))" }}>
                        <User className="w-4 h-4" style={{ color: "rgb(var(--muted-foreground))" }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start">
                  <div className="shrink-0 mr-3 mt-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-xl border flex items-center space-x-2" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-sm font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>Analyzing materials...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-4" style={{ backgroundColor: "rgb(var(--background))" }}>
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end rounded-xl border transition-colors focus-within:border-indigo-500 bg-card shadow-sm"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your notes..."
                rows={1}
                aria-label="Chat message input"
                className="w-full pl-4 pr-2 py-3.5 bg-transparent resize-none outline-none max-h-32 min-h-[52px] text-sm"
                style={{ color: "rgb(var(--foreground))" }}
              />
              <div className="flex items-center space-x-1 pr-2 pb-2">
                <VoiceAssistant onTranscript={handleVoiceTranscript} isThinking={isLoading} lastAiResponse={lastAiResponse} />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                  className="p-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "rgb(var(--muted-foreground))" }}>
              AI can make mistakes. Verify important information against your source material.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
