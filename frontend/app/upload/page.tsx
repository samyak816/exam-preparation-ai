import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { UploadBox } from "@/components/UploadBox";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold flex items-center" style={{ color: "rgb(var(--foreground))" }}>
              <UploadCloud className="w-7 h-7 mr-2.5 text-indigo-500" /> Upload Notes
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgb(var(--muted-foreground))" }}>Upload your study materials to get AI-powered assistance.</p>
          </header>
          <UploadBox />
        </div>
      </main>
    </div>
  );
}
