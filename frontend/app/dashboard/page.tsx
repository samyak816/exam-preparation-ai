"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardCard } from "@/components/DashboardCard";
import { FileText, MessageSquare, BrainCircuit, ArrowRight, File, Plus, Sparkles, Mic } from "lucide-react";
import Link from "next/link";
import { getDocuments } from "@/lib/api";

type Document = {
  id: string;
  filename: string;
  created_at: string;
};

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    getDocuments()
      .then((res) => {
        if (res.documents) setDocuments(res.documents.slice(0, 5));
      })
      .catch(console.error);

    // Load quiz count from localStorage
    try {
      const history = JSON.parse(localStorage.getItem("quiz-history") || "[]");
      setQuizCount(history.length);
    } catch {}
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "rgb(var(--foreground))" }}>
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgb(var(--muted-foreground))" }}>Overview of your study materials and progress.</p>
          </header>

          {/* Quick Actions & Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DashboardCard title="Documents" value={documents.length.toString()} subtitle="Uploaded notes" icon={FileText} iconColor="text-indigo-600 dark:text-indigo-400" bgColor="bg-card border" />
            <DashboardCard title="Questions" value="—" subtitle="Coming soon" icon={MessageSquare} iconColor="text-indigo-600 dark:text-indigo-400" bgColor="bg-card border" />
            <DashboardCard title="Quizzes" value={quizCount.toString()} subtitle="Completed" icon={BrainCircuit} iconColor="text-indigo-600 dark:text-indigo-400" bgColor="bg-card border" />
            <DashboardCard title="Voice Tutor" value="Ready" subtitle="Microphone enabled" icon={Mic} iconColor="text-indigo-600 dark:text-indigo-400" bgColor="bg-card border" />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Study Assistant Card */}
            <div
              className="lg:col-span-2 rounded-xl p-6 border flex flex-col justify-between"
              style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
            >
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "rgb(var(--foreground))" }}>
                    Study Assistant
                  </h2>
                </div>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                  Ask questions based on your uploaded documents, generate quizzes, or review key concepts with the voice tutor.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/chat" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors text-sm">
                  <MessageSquare className="w-4 h-4 mr-2" /> Ask AI
                </Link>
                <Link href="/chat" className="inline-flex items-center px-4 py-2 font-semibold rounded-md border transition-colors text-sm hover:bg-muted" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}>
                  <Mic className="w-4 h-4 mr-2" style={{ color: "rgb(var(--muted-foreground))" }} /> Voice Tutor
                </Link>
                <Link href="/quiz" className="inline-flex items-center px-4 py-2 font-semibold rounded-md border transition-colors text-sm hover:bg-muted" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}>
                  <BrainCircuit className="w-4 h-4 mr-2" style={{ color: "rgb(var(--muted-foreground))" }} /> Take Quiz
                </Link>
              </div>
            </div>

            {/* Recent Notes */}
            <div
              className="rounded-xl p-6 border flex flex-col"
              style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "rgb(var(--muted-foreground))" }}>Recent Notes</h3>
                <Link href="/upload" className="p-1.5 rounded-md transition-colors hover:bg-muted" style={{ color: "rgb(var(--foreground))" }}>
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-1 flex-1">
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "rgb(var(--foreground))" }} />
                    <p className="text-xs font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>No notes uploaded</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-2 rounded-md transition-colors hover:bg-muted cursor-default border border-transparent" style={{ color: "rgb(var(--foreground))" }}>
                      <div className="p-1.5 rounded text-indigo-600 dark:text-indigo-400 shrink-0">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                        <p className="text-[11px]" style={{ color: "rgb(var(--muted-foreground))" }}>
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/upload"
                className="flex items-center justify-center w-full mt-4 py-2 text-xs font-semibold rounded-md border transition-colors hover:bg-muted"
                style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
              >
                Upload Document
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
