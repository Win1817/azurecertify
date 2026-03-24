import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetAttempt, useAnalyzeAttempt } from "@workspace/api-client-react";
import { Layout, cn } from "@/components/layout";
import { ScoreDial } from "@/components/score-dial";
import type { Options as ConfettiOptions } from "canvas-confetti";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, BrainCircuit, Target, BookOpen, Clock, Activity, CheckCircle2, XCircle } from "lucide-react";

export default function Results() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const [, setLocation] = useLocation();
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const { data, isLoading } = useGetAttempt(attemptId);
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeAttempt({
    mutation: {
      onSuccess: () => {
        setLocation(`/analysis/${attemptId}`);
      }
    }
  });

  useEffect(() => {
    if (data?.result.passed && !hasCelebrated) {
      try {
        import("canvas-confetti").then(({ default: confetti }) => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0078D4', '#107C10', '#FFFFFF']
          });
        }).catch(() => {});
      } catch {}
      setHasCelebrated(true);
    }
  }, [data, hasCelebrated]);

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const { attempt, result, analysis } = data;

  const handleGenerateAnalysis = () => {
    if (analysis) {
      setLocation(`/analysis/${attemptId}`);
      return;
    }
    analyze({
      data: {
        attemptId,
        certificationCode: attempt.certificationCode,
        score: result.score,
        topicBreakdown: result.topicBreakdown,
        questionResults: result.questionResults.map(q => ({
          topic: q.topic,
          correct: q.correct
        }))
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 animate-in fade-in duration-500 space-y-8">
        
        {/* Header Summary Card */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className={cn(
            "absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none",
            result.passed ? "bg-success" : "bg-destructive"
          )}></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="shrink-0">
              <ScoreDial score={result.score} size={220} strokeWidth={18} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                {attempt.certificationCode} Results
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                You correctly answered <span className="font-bold text-white">{result.correctCount}</span> out of {result.totalCount} questions.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <Clock className="w-3.5 h-3.5" /> Time Spent
                  </div>
                  <div className="text-xl font-bold">
                    {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <Target className="w-3.5 h-3.5" /> Accuracy
                  </div>
                  <div className="text-xl font-bold">
                    {Math.round((result.correctCount / result.totalCount) * 100)}%
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <Activity className="w-3.5 h-3.5" /> Status
                  </div>
                  <div className={cn("text-xl font-bold", result.passed ? "text-success" : "text-destructive")}>
                    {result.passed ? "Pass" : "Fail"}
                  </div>
                </div>
              </div>

              {/* AI Analysis CTA */}
              <button
                onClick={handleGenerateAnalysis}
                disabled={isAnalyzing}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating AI Analysis...</>
                ) : analysis ? (
                  <><BrainCircuit className="w-5 h-5" /> View AI Study Plan</>
                ) : (
                  <><BrainCircuit className="w-5 h-5" /> Generate AI Analysis</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Topic Breakdown Chart */}
        <div className="glass-panel p-8 rounded-3xl">
          <h2 className="text-2xl font-display font-semibold mb-8 flex items-center gap-2">
            <Target className="text-primary" /> Topic Performance
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.topicBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="topic" type="category" width={200} tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                  {result.topicBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 70 ? '#107C10' : entry.percentage >= 50 ? '#FCE100' : '#E81123'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="glass-panel p-8 rounded-3xl">
           <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="text-primary" /> Detailed Review
          </h2>
          <div className="space-y-4">
            {result.questionResults.map((q, idx) => (
              <div key={q.questionId} className="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {q.correct ? (
                      <CheckCircle2 className="text-success w-5 h-5" />
                    ) : (
                      <XCircle className="text-destructive w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-muted-foreground">Question {idx + 1}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-muted-foreground truncate max-w-[200px]">{q.topic}</span>
                    </div>
                    <div className="text-sm mb-4">
                      Your answer: <span className={cn("font-bold", q.correct ? "text-success" : "text-destructive")}>{q.userAnswer || 'Skipped'}</span>
                      {!q.correct && (
                         <span className="ml-4">Correct answer: <span className="font-bold text-success">{q.correctAnswer}</span></span>
                      )}
                    </div>
                    {!q.correct && (
                      <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-sm text-foreground/80 leading-relaxed">
                        <span className="font-semibold text-primary block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
