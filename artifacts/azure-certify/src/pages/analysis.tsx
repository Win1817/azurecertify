import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetAttempt } from "@workspace/api-client-react";
import { Layout, cn } from "@/components/layout";
import {
  BrainCircuit, ArrowLeft, TrendingUp, AlertOctagon, Target,
  BookOpen, ExternalLink, Sparkles, CheckSquare, Square,
  Gauge, ShieldCheck, ArrowRight, MessageCircle, Zap
} from "lucide-react";
import { motion } from "framer-motion";

function ReadinessGaugeLarge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "#107C10";
    if (s >= 60) return "#0078D4";
    if (s >= 40) return "#FCE100";
    return "#E81123";
  };
  const color = getColor(score);
  const circumference = 2 * Math.PI * 70;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative w-44 h-44">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <motion.circle
          cx="80" cy="80" r="70" fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold font-display"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          {score}%
        </motion.span>
        <span className="text-xs text-muted-foreground mt-1">Readiness</span>
      </div>
    </div>
  );
}

export default function Analysis() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const { data, isLoading } = useGetAttempt(attemptId);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <BrainCircuit className="w-12 h-12 text-primary animate-pulse mx-auto" />
            <p className="text-muted-foreground">Loading AI Analysis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { analysis, attempt } = data;

  if (!analysis) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Analysis Not Found</h2>
          <p className="text-muted-foreground mb-6">AI analysis has not been generated for this attempt yet.</p>
          <Link href={`/results/${attemptId}`} className="text-primary hover:underline">
            Go back to results to generate it.
          </Link>
        </div>
      </Layout>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const readinessScore = analysis.readinessScore ?? 50;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
        
        <Link href={`/results/${attemptId}`} className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Results
        </Link>

        {/* AI Header with Readiness Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden glass-panel p-8 mb-8 border-primary/30"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="flex flex-col items-center shrink-0">
              <ReadinessGaugeLarge score={readinessScore} />
              <div className="mt-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-wider text-primary">
                {analysis.estimatedReadiness}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-3">
                <BrainCircuit className="w-3.5 h-3.5" /> AI Diagnostic Report
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">
                {attempt.certificationCode} Assessment
              </h1>
              <p className="text-lg text-foreground/90 leading-relaxed mb-4">
                {analysis.overallAssessment}
              </p>

              {/* Mentor Message */}
              {analysis.mentorMessage && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">Ezzy's Message</span>
                      <p className="text-sm text-foreground/90 italic leading-relaxed">"{analysis.mentorMessage}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-2xl border-destructive/20 bg-destructive/[0.02]"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-destructive">
              <AlertOctagon className="w-5 h-5" /> Areas to Improve
            </h3>
            <ul className="space-y-3">
              {analysis.weakAreas.map((area: string, idx: number) => (
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  key={idx}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                  <span className="text-foreground/90">{area}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-2xl border-success/20 bg-success/[0.02]"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-success">
              <TrendingUp className="w-5 h-5" /> Verified Strengths
            </h3>
            <ul className="space-y-3">
              {analysis.strongAreas.map((area: string, idx: number) => (
                <motion.li
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  key={idx}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0"></div>
                  <span className="text-foreground/90">{area}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Study Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Target className="text-primary" /> Personalized Study Plan
          </h2>
          
          <div className="space-y-4">
            {analysis.studyPlan.map((item: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.15 }}
                key={idx} 
                className="glass-panel p-6 rounded-2xl border-white/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className={cn(
                      "w-5 h-5",
                      item.priority === 'high' ? "text-destructive" : item.priority === 'medium' ? "text-yellow-500" : "text-success"
                    )} />
                    <h4 className="text-lg font-semibold">{item.topic}</h4>
                  </div>
                  <span className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shrink-0", getPriorityColor(item.priority))}>
                    {item.priority} Priority
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                  {item.recommendation}
                </p>
                
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Suggested Resources
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.resources.map((res: string, rIdx: number) => (
                      <a key={rIdx} href="#" className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors border border-primary/20">
                        {res} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Steps (Interactive Checklist) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-card to-primary/5 mb-8"
        >
          <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Your Action Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ul className="space-y-3">
                {analysis.nextSteps.map((step: string, idx: number) => {
                  const isChecked = checkedSteps.has(idx);
                  return (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="flex items-start gap-3 cursor-pointer group"
                      onClick={() => toggleStep(idx)}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                      )}
                      <span className={cn(
                        "text-sm leading-relaxed transition-all",
                        isChecked ? "line-through text-muted-foreground" : "text-foreground/90"
                      )}>
                        {step}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${(checkedSteps.size / (analysis.nextSteps?.length || 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="whitespace-nowrap">{checkedSteps.size}/{analysis.nextSteps?.length || 0}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Estimated Readiness</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                  {analysis.estimatedReadiness}
                </span>
              </div>
              {analysis.recommendedNextExam && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Recommended Next Exam</span>
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-md font-mono text-sm border border-white/20">
                    {analysis.recommendedNextExam}
                  </span>
                </div>
              )}
              <div className="pt-4">
                <Link
                  href={`/configure/${analysis.recommendedNextExam?.split(' ')[0] || attempt.certificationCode}`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all"
                >
                  Practice Again <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </Layout>
  );
}
