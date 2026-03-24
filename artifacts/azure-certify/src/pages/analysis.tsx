import { useParams, Link } from "wouter";
import { useGetAttempt } from "@workspace/api-client-react";
import { Layout, cn } from "@/components/layout";
import { BrainCircuit, ArrowLeft, TrendingUp, AlertOctagon, Target, BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function Analysis() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const { data, isLoading } = useGetAttempt(attemptId);

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
      case 'medium': return 'text-warning text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
        
        <Link href={`/results/${attemptId}`} className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Results
        </Link>

        {/* AI Header */}
        <div className="relative rounded-3xl overflow-hidden glass-panel p-8 mb-8 border-primary/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <img src={`${import.meta.env.BASE_URL}images/ai-sparkle.png`} alt="AI" className="w-10 h-10 object-contain mix-blend-screen" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-3">
                <BrainCircuit className="w-3.5 h-3.5" /> AI Diagnostic Report
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">
                {attempt.certificationCode} Assessment
              </h1>
              <p className="text-lg text-foreground/90 leading-relaxed">
                {analysis.overallAssessment}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Weak Areas */}
          <div className="glass-panel p-6 rounded-2xl border-destructive/20 bg-destructive/[0.02]">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-destructive">
              <AlertOctagon className="w-5 h-5" /> Areas to Improve
            </h3>
            <ul className="space-y-3">
              {analysis.weakAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                  <span className="text-foreground/90">{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strong Areas */}
          <div className="glass-panel p-6 rounded-2xl border-success/20 bg-success/[0.02]">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-success">
              <TrendingUp className="w-5 h-5" /> Verified Strengths
            </h3>
            <ul className="space-y-3">
              {analysis.strongAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0"></div>
                  <span className="text-foreground/90">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Study Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Target className="text-primary" /> Personalized Study Plan
          </h2>
          
          <div className="space-y-4">
            {analysis.studyPlan.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                key={idx} 
                className="glass-panel p-6 rounded-2xl border-white/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h4 className="text-lg font-semibold">{item.topic}</h4>
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
                    {item.resources.map((res, rIdx) => (
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

        {/* Next Steps */}
        <div className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-card to-primary/5">
          <h3 className="text-xl font-display font-bold mb-6">Readiness & Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
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
            </div>
            <div>
              <ul className="space-y-3">
                {analysis.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-foreground/90 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
