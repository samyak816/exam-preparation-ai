"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { BrainCircuit, CheckCircle2, XCircle, ChevronRight, RotateCcw, Home, Loader2, Book } from "lucide-react";
import { generateQuiz, getDocuments } from "@/lib/api";
import Link from "next/link";

type Question = { question: string; options: string[]; correct_answer: number; explanation: string };
type Quiz = { topic: string; questions: Question[] };
type DocItem = { id: string; filename: string };

export default function QuizPage() {
  const [topic, setTopic] = useState("Machine Learning");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("all");
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState("");

  const [quizState, setQuizState] = useState<"setup" | "loading" | "active" | "complete">("setup");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setQuizState("loading");
    setErrorMsg("");
    try {
      const data = await generateQuiz(topic, numQuestions, difficulty, selectedDocId === "all" ? undefined : selectedDocId);
      if (data.error) throw new Error(data.error);
      setQuiz(data);
      setCurrentQ(0);
      setScore(0);
      setSelectedOpt(null);
      setRevealed(false);
      setQuizState("active");
    } catch (err: any) {
      setErrorMsg(err.message || "Quiz generation failed.");
      setQuizState("setup");
    }
  };

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedOpt(idx);
    setRevealed(true);
    if (quiz && idx === quiz.questions[currentQ].correct_answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedOpt(null);
      setRevealed(false);
    } else {
      // Save to localStorage
      try {
        const history = JSON.parse(localStorage.getItem("quiz-history") || "[]");
        history.push({
          topic: quiz.topic,
          score,
          total: quiz.questions.length,
          percentage: Math.round((score / quiz.questions.length) * 100),
          timestamp: new Date().toISOString(),
          document: selectedDocId,
        });
        localStorage.setItem("quiz-history", JSON.stringify(history));
      } catch {}
      setQuizState("complete");
    }
  };

  const tryAnother = async () => {
    setQuiz(null);
    setScore(0);
    setCurrentQ(0);
    setSelectedOpt(null);
    setRevealed(false);
    setErrorMsg("");
    // Immediately regenerate with same settings
    setQuizState("loading");
    try {
      const data = await generateQuiz(topic, numQuestions, difficulty, selectedDocId === "all" ? undefined : selectedDocId);
      if (data.error) throw new Error(data.error);
      setQuiz(data);
      setQuizState("active");
    } catch (err: any) {
      setErrorMsg(err.message || "Quiz generation failed.");
      setQuizState("setup");
    }
  };

  const backToSetup = () => {
    setQuizState("setup");
    setQuiz(null);
    setScore(0);
    setCurrentQ(0);
    setSelectedOpt(null);
    setRevealed(false);
    setErrorMsg("");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center" style={{ color: "rgb(var(--foreground))" }}>
                <BrainCircuit className="w-7 h-7 mr-2.5 text-indigo-500" /> Practice Quiz
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgb(var(--muted-foreground))" }}>Test your knowledge with AI-generated questions.</p>
            </div>
            {quizState === "active" && quiz && (
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
                Question {currentQ + 1} of {quiz.questions.length}
              </span>
            )}
          </div>

          {/* SETUP */}
          {quizState === "setup" && (
            <div className="rounded-xl border p-6 md:p-8 shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <h2 className="text-lg font-bold mb-6" style={{ color: "rgb(var(--foreground))" }}>Create a Practice Quiz</h2>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 flex items-start text-sm">
                  <XCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" /> {errorMsg}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgb(var(--foreground))" }}>Study Material</label>
                  <div className="relative">
                    <Book className="absolute left-3 top-3 w-4 h-4" style={{ color: "rgb(var(--muted-foreground))" }} />
                    {docLoading ? (
                      <div className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm flex items-center" style={{ backgroundColor: "rgb(var(--input))", borderColor: "rgb(var(--border))", color: "rgb(var(--muted-foreground))" }}>Loading your study materials...</div>
                    ) : docError ? (
                      <div className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm flex items-center text-red-500" style={{ backgroundColor: "rgb(var(--input))", borderColor: "rgb(var(--border))" }}>{docError}</div>
                    ) : documents.length === 0 ? (
                      <div className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm flex items-center" style={{ backgroundColor: "rgb(var(--input))", borderColor: "rgb(var(--border))", color: "rgb(var(--muted-foreground))" }}>No study materials uploaded yet.</div>
                    ) : (
                      <select value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)} aria-label="Select document"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        style={{ backgroundColor: "rgb(var(--input))", borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}>
                        <option value="all">All documents</option>
                        {documents.map((d) => <option key={d.id} value={d.id}>{d.filename}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgb(var(--foreground))" }}>Topic</label>
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Quiz topic"
                    className="w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    style={{ backgroundColor: "rgb(var(--input))", borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgb(var(--foreground))" }}>Questions</label>
                    <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} aria-label="Number of questions"
                      className="w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      style={{ backgroundColor: "rgb(var(--input))", borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}>
                      {[3, 5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgb(var(--foreground))" }}>Difficulty</label>
                    <div className="flex rounded-xl border p-1" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--input))" }}>
                      {["easy", "medium", "hard"].map((lvl) => (
                        <button key={lvl} onClick={() => setDifficulty(lvl)}
                          className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-colors ${
                            difficulty === lvl ? "bg-indigo-600 text-white shadow-sm" : ""
                          }`}
                          style={difficulty !== lvl ? { color: "rgb(var(--muted-foreground))" } : undefined}>
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={!topic.trim()}
                  className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-40 transition-colors mt-4">
                  Generate Quiz
                </button>
              </div>
            </div>
          )}

          {/* LOADING */}
          {quizState === "loading" && (
            <div className="rounded-2xl border p-12 flex flex-col items-center justify-center min-h-[350px]" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/40 rounded-full flex items-center justify-center">
                  <BrainCircuit className="w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 p-0.5 rounded-full">
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "rgb(var(--foreground))" }}>Creating your quiz...</h2>
              <p className="text-sm text-center max-w-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                Reading your notes on "{topic}" and crafting {numQuestions} {difficulty} questions.
              </p>
            </div>
          )}

          {/* ACTIVE */}
          {quizState === "active" && quiz && (
            <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="p-6 md:p-8 border-b" style={{ borderColor: "rgb(var(--border))" }}>
                <h2 className="text-lg md:text-xl font-bold leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>
                  {quiz.questions[currentQ].question}
                </h2>
              </div>

              <div className="p-6 md:p-8 space-y-3">
                {quiz.questions[currentQ].options.map((opt, idx) => {
                  const isCorrect = idx === quiz.questions[currentQ].correct_answer;
                  const isSelected = selectedOpt === idx;

                  let cls = "border transition-all duration-200 ";
                  if (revealed) {
                    if (isCorrect) cls += "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 ring-1 ring-green-500";
                    else if (isSelected) cls += "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300";
                    else cls += "opacity-50";
                  } else {
                    cls += "hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20";
                  }

                  return (
                    <button key={idx} onClick={() => handleSelect(idx)} disabled={revealed}
                      className={`w-full flex items-start text-left p-4 rounded-lg cursor-pointer ${cls}`}
                      style={!revealed ? { borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" } : undefined}>
                      <div className="shrink-0 w-6 h-6 rounded border flex items-center justify-center font-bold text-[11px] mr-3 mt-0.5" style={!revealed ? { borderColor: "rgb(var(--border))" } : undefined}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1 font-medium">{opt}</span>
                      {revealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-2 mt-0.5" />}
                      {revealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-2 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className="p-6 md:p-8 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                  <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: "rgb(var(--muted))" }}>
                    <h4 className="font-bold text-sm mb-1" style={{ color: "rgb(var(--foreground))" }}>Explanation</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{quiz.questions[currentQ].explanation}</p>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleNext}
                      className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors text-sm">
                      {currentQ < quiz.questions.length - 1 ? "Next Question" : "See Results"} <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPLETE */}
          {quizState === "complete" && quiz && (
            <div className="rounded-xl border p-10 text-center shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center mb-4">
                <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "rgb(var(--foreground))" }}>Assessment Complete</h2>
              <p className="mb-8 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>You finished the {quiz.topic} quiz.</p>

              <div className="inline-block p-6 rounded-xl border mb-8 min-w-[200px] shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgb(var(--muted-foreground))" }}>Score</p>
                <div className="flex items-baseline justify-center space-x-1.5">
                  <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{score}</span>
                  <span className="text-xl font-bold" style={{ color: "rgb(var(--muted-foreground))" }}>/ {quiz.questions.length}</span>
                </div>
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                  <span className="text-2xl font-bold" style={{ color: "rgb(var(--foreground))" }}>{Math.round((score / quiz.questions.length) * 100)}%</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={tryAnother}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors text-sm">
                  <RotateCcw className="w-4 h-4 mr-2" /> Try Another Quiz
                </button>
                <Link href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 font-semibold rounded-md border transition-colors text-sm hover:bg-muted"
                  style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}>
                  <Home className="w-4 h-4 mr-2" /> Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
