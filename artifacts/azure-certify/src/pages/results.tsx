import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetAttempt, useAnalyzeAttempt } from "@workspace/api-client-react";
import { Layout, cn } from "@/components/layout";
import { ScoreDial } from "@/components/score-dial";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BrainCircuit, Target, BookOpen, Clock, Activity,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, MessageCircle,
  AlertTriangle, Sparkles, TrendingUp, ShieldCheck, Gauge
} from "lucide-react";

function ReadinessGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "#107C10";
    if (s >= 60) return "#0078D4";
    if (s >= 40) return "#FCE100";
    return "#E81123";
  };
  const getLabel = (s: number) => {
    if (s >= 85) return "Exam Ready";
    if (s >= 70) return "Almost There";
    if (s >= 50) return "Needs Work";
    return "Keep Studying";
  };
  const color = getColor(score);
  const circumference = 2 * Math.PI * 54;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - filled }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold font-display"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Gauge className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
}

function TopicStatusIcon({ percentage }: { percentage: number }) {
  if (percentage >= 80) return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (percentage >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
}

export default function Results() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const [, setLocation] = useLocation();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

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

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
  const readinessScore = analysis?.readinessScore ?? Math.round(result.score * 0.95);
  const incorrectCount = result.totalCount - result.correctCount;

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
        questionResults: result.questionResults.map((q: any) => ({
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden"
        >
          <div className={cn(
            "absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none",
            result.passed ? "bg-success" : "bg-destructive"
          )}></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="shrink-0">
              <ScoreDial score={result.score} size={220} strokeWidth={18} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {attempt.certificationCode} Results
                </h1>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-bold border",
                  result.passed
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-destructive/10 text-destructive border-destructive/30"
                )}>
                  {result.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                You correctly answered <span className="font-bold text-white">{result.correctCount}</span> out of {result.totalCount} questions.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <Clock className="w-3.5 h-3.5" /> Time
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
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <XCircle className="w-3.5 h-3.5" /> Mistakes
                  </div>
                  <div className="text-xl font-bold text-destructive">
                    {incorrectCount}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <Gauge className="w-3.5 h-3.5" /> Readiness
                  </div>
                  <div className={cn("text-xl font-bold", readinessScore >= 70 ? "text-success" : readinessScore >= 50 ? "text-yellow-500" : "text-destructive")}>
                    {readinessScore}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerateAnalysis}
                  disabled={isAnalyzing}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                >
                  {isAnalyzing ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating AI Analysis...</>
                  ) : analysis ? (
                    <><BrainCircuit className="w-5 h-5" /> View AI Study Plan <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <><BrainCircuit className="w-5 h-5" /> Generate AI Analysis</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mentor Message (if analysis exists) */}
        {analysis?.mentorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Ezzy says</div>
                <p className="text-foreground/90 leading-relaxed italic">"{analysis.mentorMessage}"</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Topic Breakdown Chart with Status Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-display font-semibold mb-8 flex items-center gap-2">
            <Target className="text-primary" /> Topic Performance
          </h2>

          {/* Topic Cards with insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {result.topicBreakdown.map((entry: any, idx: number) => (
              <motion.div
                key={entry.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={cn(
                  "p-4 rounded-xl border flex items-center gap-4",
                  entry.percentage >= 80
                    ? "bg-success/5 border-success/20"
                    : entry.percentage >= 60
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : "bg-destructive/5 border-destructive/20"
                )}
              >
                <TopicStatusIcon percentage={entry.percentage} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold truncate">{entry.topic}</span>
                    <span className={cn(
                      "text-sm font-bold ml-2",
                      entry.percentage >= 80 ? "text-success" : entry.percentage >= 60 ? "text-yellow-500" : "text-destructive"
                    )}>
                      {entry.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: entry.percentage >= 80 ? '#107C10' : entry.percentage >= 60 ? '#FCE100' : '#E81123'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 * idx }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.correct}/{entry.total}</span>
                  </div>
                  {analysis?.topicInsights?.[entry.topic] && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {analysis.topicInsights[entry.topic]}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="h-[250px] w-full">
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
                  {result.topicBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 70 ? '#107C10' : entry.percentage >= 50 ? '#FCE100' : '#E81123'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Mistake Analysis Section */}
        {incorrectCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-8 rounded-3xl border-destructive/10"
          >
            <h2 className="text-2xl font-display font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Mistake Analysis
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Review each incorrect answer to understand where you went wrong. Click to expand.
            </p>
            <div className="space-y-3">
              {result.questionResults
                .map((q: any, idx: number) => ({ ...q, originalIndex: idx }))
                .filter((q: any) => !q.correct)
                .map((q: any) => {
                  const isExpanded = expandedQuestions.has(q.questionId);
                  return (
                    <motion.div
                      key={q.questionId}
                      layout
                      className="rounded-xl border border-destructive/10 bg-destructive/[0.02] overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(q.questionId)}
                        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <XCircle className="text-destructive w-5 h-5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-semibold text-muted-foreground">Q{q.originalIndex + 1}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-muted-foreground truncate max-w-[200px]">{q.topic}</span>
                          </div>
                          <div className="text-sm">
                            Your answer: <span className="font-bold text-destructive">{q.userAnswer || 'Skipped'}</span>
                            <span className="mx-2 text-muted-foreground">→</span>
                            Correct: <span className="font-bold text-success">{q.correctAnswer}</span>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 space-y-4">
                              {/* Question Text */}
                              {q.content && (
                                <div className="p-4 rounded-lg bg-black/30 border border-white/5 text-sm leading-relaxed">
                                  <span className="font-semibold text-foreground/60 block mb-2">Question:</span>
                                  {q.content}
                                </div>
                              )}
                              {/* Options */}
                              {q.options && (
                                <div className="space-y-2">
                                  {q.options.map((opt: any) => (
                                    <div
                                      key={opt.key}
                                      className={cn(
                                        "p-3 rounded-lg text-sm border flex items-start gap-3",
                                        opt.key === q.correctAnswer
                                          ? "bg-success/10 border-success/30"
                                          : opt.key === q.userAnswer
                                          ? "bg-destructive/10 border-destructive/30"
                                          : "bg-white/[0.02] border-white/5"
                                      )}
                                    >
                                      <span className={cn(
                                        "font-bold w-6 h-6 rounded flex items-center justify-center text-xs shrink-0",
                                        opt.key === q.correctAnswer
                                          ? "bg-success/20 text-success"
                                          : opt.key === q.userAnswer
                                          ? "bg-destructive/20 text-destructive"
                                          : "bg-white/10 text-muted-foreground"
                                      )}>
                                        {opt.key}
                                      </span>
                                      <span>{opt.text}</span>
                                      {opt.key === q.correctAnswer && <CheckCircle2 className="w-4 h-4 text-success ml-auto shrink-0 mt-0.5" />}
                                      {opt.key === q.userAnswer && opt.key !== q.correctAnswer && <XCircle className="w-4 h-4 text-destructive ml-auto shrink-0 mt-0.5" />}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Explanation */}
                              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm text-foreground/80 leading-relaxed">
                                <span className="font-semibold text-primary flex items-center gap-1.5 mb-2">
                                  <Sparkles className="w-3.5 h-3.5" /> Why this matters:
                                </span>
                                {q.explanation}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Correct Answers Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="text-primary" /> Full Review
          </h2>
          <div className="space-y-3">
            {result.questionResults.map((q: any, idx: number) => (
              <div key={q.questionId} className={cn(
                "p-4 rounded-xl border flex items-center gap-4",
                q.correct ? "border-white/5 bg-white/[0.02]" : "border-destructive/10 bg-destructive/[0.02]"
              )}>
                <div>
                  {q.correct ? (
                    <CheckCircle2 className="text-success w-5 h-5" />
                  ) : (
                    <XCircle className="text-destructive w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-muted-foreground">Question {idx + 1}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-muted-foreground truncate max-w-[200px]">{q.topic}</span>
                  </div>
                </div>
                <div className="text-sm font-bold">
                  {q.correct ? (
                    <span className="text-success">{q.userAnswer}</span>
                  ) : (
                    <span className="text-destructive">{q.userAnswer || 'Skipped'} → <span className="text-success">{q.correctAnswer}</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Readiness Score + CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-card to-primary/5"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ReadinessGauge score={readinessScore} />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-display font-bold mb-2">Your Exam Readiness</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {readinessScore >= 80
                  ? "Outstanding performance! You're well prepared to take the real exam. Consider booking your certification soon."
                  : readinessScore >= 60
                  ? "Good foundation! Focus on your weak areas and take a few more practice exams to solidify your knowledge."
                  : "Keep practicing! Review the topics where you scored below 70% and use the AI study plan to guide your learning."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerateAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                >
                  <BrainCircuit className="w-4 h-4" />
                  {analysis ? "View Study Plan" : "Get AI Study Plan"}
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                >
                  <TrendingUp className="w-4 h-4" /> Try Another Exam
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </Layout>
  );
}
