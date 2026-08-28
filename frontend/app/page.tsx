import Link from "next/link";
import { BookOpen, BrainCircuit, MessageSquare, ArrowRight, CheckCircle2, Sparkles, Mic } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      title: "Study From Your Notes",
      description: "Upload your PDFs, DOCX, and TXT files. The AI reads exactly what you're learning.",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "AI-Powered Explanations",
      description: "Get crystal-clear answers and summaries strictly based on your provided material.",
      icon: MessageSquare,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "Practice With Quizzes",
      description: "Test yourself with dynamic, auto-generated multiple choice questions.",
      icon: BrainCircuit,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Voice Tutor",
      description: "Speak your questions and hear AI answers read aloud. Hands-free studying.",
      icon: Mic,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 max-w-5xl mx-auto w-full z-10">
        {/* Decorative blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl -z-10 opacity-30 bg-indigo-200 dark:bg-indigo-900/30"></div>
        <div className="absolute top-10 right-0 w-[350px] h-[350px] rounded-full blur-3xl -z-10 opacity-20 bg-purple-200 dark:bg-purple-900/20"></div>

        <div
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold mb-10"
          style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Your AI study assistant is ready</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]" style={{ color: "rgb(var(--foreground))" }}>
          Study smarter.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Prepare better.</span>
        </h1>

        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>
          Your AI-powered exam preparation assistant for AI/ML students.
          Stop memorizing and start understanding.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all"
          >
            Start Preparing
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            href="/upload"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 text-base font-bold rounded-xl border-2 transition-all hover:shadow-sm"
            style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))", backgroundColor: "rgb(var(--card))" }}
          >
            Upload Notes
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-8 text-sm font-semibold" style={{ color: "rgb(var(--muted-foreground))" }}>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> Free to use</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> PDF & DOCX</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> Voice Tutor</div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl border transition-all duration-200 hover:shadow-md group"
                style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "rgb(var(--foreground))" }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
