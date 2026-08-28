"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Activity, BrainCircuit, Trophy, TrendingUp, Trash2 } from "lucide-react";

type QuizResult = {
  topic: string;
  score: number;
  total: number;
  percentage: number;
  timestamp: string;
  document?: string;
};

export default function ProgressPage() {
  const [history, setHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("quiz-history") || "[]");
      setHistory(stored);
    } catch {}
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("quiz-history");
    setHistory([]);
  };

  const avgScore = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.percentage, 0) / history.length) : 0;
  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.percentage)) : 0;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-2xl font-bold flex items-center" style={{ color: "rgb(var(--foreground))" }}>
              <Activity className="w-7 h-7 mr-2.5 text-indigo-500" /> Progress
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgb(var(--muted-foreground))" }}>Track your quiz performance and study progress.</p>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-md bg-muted text-indigo-600 dark:text-indigo-400 border" style={{ borderColor: "rgb(var(--border))" }}>
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgb(var(--muted-foreground))" }}>Quizzes Completed</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "rgb(var(--foreground))" }}>{history.length}</p>
            </div>

            <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-md bg-muted text-indigo-600 dark:text-indigo-400 border" style={{ borderColor: "rgb(var(--border))" }}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgb(var(--muted-foreground))" }}>Average Score</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "rgb(var(--foreground))" }}>{avgScore}%</p>
            </div>

            <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-md bg-muted text-indigo-600 dark:text-indigo-400 border" style={{ borderColor: "rgb(var(--border))" }}>
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgb(var(--muted-foreground))" }}>Best Score</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "rgb(var(--foreground))" }}>{bestScore}%</p>
            </div>
          </div>

          {/* Recent Quizzes */}
          <div className="rounded-xl border shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgb(var(--border))" }}>
              <h2 className="text-lg font-bold" style={{ color: "rgb(var(--foreground))" }}>Recent Quizzes</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="flex items-center text-xs font-medium text-red-500 hover:text-red-600 transition-colors" aria-label="Clear quiz history">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-12 text-center">
                <BrainCircuit className="w-10 h-10 mx-auto mb-3" style={{ color: "rgb(var(--border))" }} />
                <p className="text-sm font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>No quizzes completed yet. Take a quiz to see your progress!</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
                {[...history].reverse().map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        h.percentage >= 80 ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                        : h.percentage >= 50 ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                        : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                      }`}>
                        {h.percentage}%
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "rgb(var(--foreground))" }}>{h.topic}</p>
                        <p className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
                          {h.score}/{h.total} correct · {new Date(h.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
