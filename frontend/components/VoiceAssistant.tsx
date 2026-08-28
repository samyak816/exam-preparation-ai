"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Square, Loader2, AlertCircle } from "lucide-react";

type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

interface VoiceAssistantProps {
  onTranscript: (text: string) => void;
  isThinking?: boolean;
  lastAiResponse?: string;
}

export function VoiceAssistant({ onTranscript, isThinking = false, lastAiResponse }: VoiceAssistantProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isSupported, setIsSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    if (isThinking) {
      setVoiceState("thinking");
    }
  }, [isThinking]);

  // When we get a new AI response and we were in voice mode, speak it
  useEffect(() => {
    if (lastAiResponse && voiceState === "thinking") {
      speakText(lastAiResponse);
    }
  }, [lastAiResponse]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Voice input isn't supported in this browser.");
      setVoiceState("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (text.trim()) {
        onTranscript(text);
        setVoiceState("thinking");
      } else {
        setVoiceState("idle");
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone permission denied. Please allow access.");
      } else if (event.error === "no-speech") {
        setErrorMsg("No speech detected. Please try again.");
      } else {
        setErrorMsg(`Voice error: ${event.error}`);
      }
      setVoiceState("error");
    };

    recognition.onend = () => {
      if (voiceState === "listening") {
        setVoiceState("idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceState("listening");
    setErrorMsg("");
  }, [onTranscript, voiceState]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState("idle");
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;

    // Strip markdown for cleaner speech
    const cleanText = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*{1,2}(.*?)\*{1,2}/g, "$1")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[-*]\s/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();

    if (!cleanText) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Load voice preferences from localStorage
    const savedRate = localStorage.getItem("voice-rate");
    const savedPitch = localStorage.getItem("voice-pitch");
    utterance.rate = savedRate ? parseFloat(savedRate) : 1.0;
    utterance.pitch = savedPitch ? parseFloat(savedPitch) : 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setVoiceState("speaking");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setVoiceState("idle");
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceState("idle");
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setVoiceState("idle");
  };

  const stateLabels: Record<VoiceState, string> = {
    idle: "Tap to speak",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
    error: errorMsg || "Error",
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg" style={{ color: "rgb(var(--muted-foreground))", backgroundColor: "rgb(var(--muted))" }}>
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Voice unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Main Mic Button */}
      {voiceState === "listening" ? (
        <button
          onClick={stopListening}
          aria-label="Stop listening"
          title="Stop listening"
          className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors voice-pulse focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <Square className="w-5 h-5" />
        </button>
      ) : voiceState === "thinking" ? (
        <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/50">
          <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      ) : voiceState === "speaking" ? (
        <button
          onClick={stopSpeaking}
          aria-label="Stop speaking"
          title="Stop speaking"
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <VolumeX className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={startListening}
          aria-label="Start voice input"
          title="Start voice input"
          className="p-2.5 rounded-xl border transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--muted-foreground))" }}
        >
          <Mic className="w-5 h-5" />
        </button>
      )}

      {/* State Label (compact) */}
      {voiceState !== "idle" && (
        <span className="text-xs font-medium" style={{ color: voiceState === "error" ? "rgb(var(--danger))" : "rgb(var(--muted-foreground))" }}>
          {stateLabels[voiceState]}
        </span>
      )}

      {voiceState === "error" && (
        <button
          onClick={() => { setVoiceState("idle"); setErrorMsg(""); }}
          className="text-xs underline"
          style={{ color: "rgb(var(--muted-foreground))" }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
