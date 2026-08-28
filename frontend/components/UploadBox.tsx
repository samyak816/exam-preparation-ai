"use client";

import React, { useState } from "react";
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadDocument } from "@/lib/api";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadResponse {
  filename: string;
  file_type: string;
  status: string;
  text_length: number;
  chunk_count: number;
  document_id: string;
  database_saved: boolean;
  message: string;
}

export function UploadBox() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
  };

  const handleFileSelection = (file: File) => {
    if (status === "uploading") return;
    if (file.size > 50 * 1024 * 1024) { alert("File too large. Max 50MB."); return; }
    const valid = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (valid.includes(file.type) || file.name.match(/\.(pdf|docx|txt)$/i)) {
      setSelectedFile(file);
      setStatus("idle");
      setErrorMessage("");
      setUploadResult(null);
    } else {
      alert("Please upload a PDF, DOCX, or TXT file.");
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMessage("");
    try {
      const result = await uploadDocument(selectedFile);
      setUploadResult(result);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setStatus("idle");
    setErrorMessage("");
    setUploadResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${
            dragActive ? "border-indigo-500" : ""
          }`}
          style={{
            borderColor: dragActive ? undefined : "rgb(var(--border))",
            backgroundColor: dragActive ? "rgba(var(--primary), 0.05)" : "rgb(var(--card))",
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept=".pdf,.docx,.txt" aria-label="Upload file" />
          <div className="p-3 bg-muted text-indigo-600 dark:text-indigo-400 rounded-md mb-4 shadow-sm border" style={{ borderColor: "rgb(var(--border))" }}>
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: "rgb(var(--foreground))" }}>Upload study material</h3>
          <p className="mb-6 text-center text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>Drag & drop your notes here</p>
          <div className="flex items-center w-full max-w-xs mx-auto mb-6">
            <div className="flex-1 border-t" style={{ borderColor: "rgb(var(--border))" }}></div>
            <span className="px-3 text-xs uppercase font-bold" style={{ color: "rgb(var(--muted-foreground))" }}>or</span>
            <div className="flex-1 border-t" style={{ borderColor: "rgb(var(--border))" }}></div>
          </div>
          <button className="px-5 py-2 font-semibold rounded-md border pointer-events-none text-sm transition-colors hover:bg-muted shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}>
            Choose files
          </button>
          <p className="text-xs mt-6 font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>Supports PDF, DOCX, and TXT (Max 50MB)</p>
        </div>
      ) : (
        <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-muted text-indigo-600 dark:text-indigo-400 rounded-md border" style={{ borderColor: "rgb(var(--border))" }}>
                <File className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold" style={{ color: "rgb(var(--foreground))" }}>{selectedFile.name}</h4>
                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--muted-foreground))" }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {(status === "idle" || status === "error") && (
              <button onClick={resetUpload} className="p-1 rounded-full transition-colors hover:bg-red-50 dark:hover:bg-red-950/20" title="Remove file" aria-label="Remove file" style={{ color: "rgb(var(--muted-foreground))" }}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {status === "error" && (
            <div className="mt-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 flex items-start space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div><p className="font-semibold">Upload Failed</p><p>{errorMessage}</p></div>
            </div>
          )}

          {status === "success" && uploadResult && (
            <div className="mt-6 p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="font-semibold">{uploadResult.message}</p>
              </div>
              <ul className="pl-7 space-y-1">
                <li><span className="font-medium">File:</span> {uploadResult.filename}</li>
                <li><span className="font-medium">Chunks:</span> {uploadResult.chunk_count}</li>
                <li><span className="font-medium">Status:</span> {uploadResult.status}</li>
              </ul>
              <div className="pl-7 mt-3">
                <button onClick={resetUpload} className="px-4 py-2 font-medium rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors text-sm">
                  Upload Another Document
                </button>
              </div>
            </div>
          )}

          {status !== "success" && (
            <div className="mt-6 flex justify-end">
              <button onClick={handleProcess} disabled={status === "uploading"}
                className="flex items-center px-6 py-2.5 font-semibold rounded-lg transition-colors text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {status === "uploading" ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing document...</>) : "Process Document"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
