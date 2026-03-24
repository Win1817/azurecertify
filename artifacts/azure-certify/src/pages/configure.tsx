import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useConfigureExam } from "@workspace/api-client-react";
import type { ExamConfigMode, ExamConfigDifficulty } from "@workspace/api-client-react";
import { Layout, cn } from "@/components/layout";
import { ArrowLeft, Target, Settings2, Play, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ConfigureExam() {
  const params = useParams();
  const certCode = params.code as "AZ-900" | "AZ-104" | "AZ-305";
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<ExamConfigMode>("practice");
  const [difficulty, setDifficulty] = useState<ExamConfigDifficulty>("mixed");
  const [count, setCount] = useState<number>(30);

  const { mutate: configure, isPending, error } = useConfigureExam({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/exam/${data.sessionId}`);
      }
    }
  });

  const handleStart = () => {
    configure({
      data: {
        certificationCode: certCode,
        mode,
        difficulty,
        questionCount: count
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-300">
        
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold mb-2">Configure {certCode}</h1>
          <p className="text-lg text-muted-foreground">Customize your examination parameters to fit your study needs.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Failed to configure exam</h3>
              <p className="text-sm opacity-90">{error.message || "An unknown error occurred."}</p>
            </div>
          </div>
        )}

        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-10 border border-white/10">
          
          {/* Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="text-primary w-5 h-5" /> Exam Mode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "practice", title: "Practice Mode", desc: "No time limit, immediate feedback, and AI explanations available during the test." },
                { id: "exam", title: "Simulation Mode", desc: "Strict timer, no immediate feedback. Authentic exam environment." }
              ].map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => setMode(opt.id as ExamConfigMode)}
                  className={cn(
                    "p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    mode === opt.id 
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,120,212,0.15)]" 
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                  )}
                >
                  <h4 className="font-semibold text-lg mb-1">{opt.title}</h4>
                  <p className="text-sm text-muted-foreground">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings2 className="text-primary w-5 h-5" /> Difficulty Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["easy", "medium", "hard", "mixed"] as ExamConfigDifficulty[]).map(level => (
                <div 
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "p-4 rounded-xl border text-center cursor-pointer transition-all duration-200 capitalize font-medium",
                    difficulty === level 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-muted-foreground"
                  )}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="text-primary w-5 h-5" /> Question Count
              </div>
              <span className="text-primary font-display font-bold text-xl">{count}</span>
            </h3>
            <div className="pt-4">
              <input 
                type="range" 
                min="10" 
                max="60" 
                step="5"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>10 (Quick Quiz)</span>
                <span>60 (Full length)</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={handleStart}
              disabled={isPending}
              className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out flex items-center gap-2 text-lg"
            >
              {isPending ? "Generating via AI..." : "Start Exam Session"}
              {!isPending && <Play className="w-5 h-5 fill-current" />}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
