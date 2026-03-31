import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { useGetAttempts } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  BookOpen, Target, Brain, LineChart, Activity, Zap, Cpu,
  ChevronRight, PlayCircle, Trophy, Flame, Star, TrendingUp,
  TrendingDown, CheckCircle2, Clock, AlertTriangle, Sparkles,
  BarChart3, ExternalLink, RefreshCw, X, Map, FileText, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem("azure_token");
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-lg flex flex-col justify-between">
      <div className={`flex items-center gap-3 ${color} mb-4`}>
        <div className="bg-current/10 p-2 rounded-lg opacity-80"><Icon className="h-5 w-5" /></div>
        <span className="font-semibold text-sm tracking-wider uppercase opacity-80">{label}</span>
      </div>
      <div>
        <span className="text-4xl font-display font-bold text-white">{value}</span>
        {sub && <p className="text-muted-foreground text-sm mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function MasteryBar({ topic, score, priorityScore, linkedModuleTitle, onStudy }: any) {
  const color = score >= 70 ? "bg-green-400" : score >= 50 ? "bg-yellow-400" : "bg-red-400";
  const textColor = score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="group p-4 rounded-xl border border-white/5 hover:border-white/10 bg-black/20 hover:bg-black/30 transition-all">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{topic}</span>
          {score < 60 && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
        </div>
        <div className="flex items-center gap-3">
          {priorityScore && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Priority {priorityScore}</span>}
          <span className={`text-sm font-bold ${textColor}`}>{Math.round(score)}%</span>
        </div>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
        <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${Math.max(score, 2)}%` }} />
      </div>
      {linkedModuleTitle && score < 70 && (
        <button onClick={() => onStudy?.()} className="mt-2 text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors">
          <BookOpen className="h-3 w-3" /> Study: {linkedModuleTitle} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function RecommendationCard({ rec, onDismiss, onAction }: any) {
  const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
    study_module:    { icon: BookOpen,   color: "text-blue-400",   bg: "bg-blue-500/10" },
    retake_quiz:     { icon: RefreshCw,  color: "text-yellow-400", bg: "bg-yellow-500/10" },
    practice_exam:   { icon: FileText,   color: "text-purple-400", bg: "bg-purple-500/10" },
    external_resource:{ icon: ExternalLink, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  };
  const cfg = typeConfig[rec.type] ?? typeConfig.study_module;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      className="bg-card border border-white/5 hover:border-primary/20 p-5 rounded-2xl flex gap-4 items-start group transition-all"
    >
      <div className={`${cfg.bg} p-3 rounded-xl shrink-0`}><Icon className={`h-5 w-5 ${cfg.color}`} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm">{rec.title}</h4>
          <button onClick={() => onDismiss(rec.id)} className="shrink-0 p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
        <button onClick={() => onAction(rec)} className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}>
          {rec.type === "study_module" ? "Start Module" : rec.type === "retake_quiz" ? "Take Quiz" : rec.type === "practice_exam" ? "Practice Exam" : "Open Resource"}
        </button>
      </div>
    </motion.div>
  );
}

function LearningPathView({ path, progress, onModuleClick }: any) {
  if (!path) return <div className="text-center p-12 text-muted-foreground">Select a certification to view its learning path.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-bold">{path.title}</h3>
          <p className="text-sm text-muted-foreground">{path.modules?.length} modules · {path.certificationCode}</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
          {path.modules?.filter((m: any) => progress?.find((p: any) => p.moduleId === m.id && p.completed)).length ?? 0}/{path.modules?.length ?? 0} done
        </span>
      </div>
      <div className="space-y-3">
        {path.modules?.map((mod: any, idx: number) => {
          const prog = progress?.find((p: any) => p.moduleId === mod.id);
          const isCompleted = prog?.completed;
          const diffColor = mod.difficulty === "easy" ? "text-green-400" : mod.difficulty === "medium" ? "text-yellow-400" : "text-red-400";
          return (
            <div key={mod.id}
              onClick={() => onModuleClick(mod)}
              className="group flex items-center gap-4 p-4 bg-card/80 hover:bg-card border border-white/5 hover:border-primary/20 rounded-xl cursor-pointer transition-all"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${isCompleted ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{mod.title}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${diffColor}`}>{mod.difficulty}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{mod.lessons?.length ?? 0} lessons · Pass at {mod.passingScore}%</p>
              </div>
              {prog?.score != null && (
                <span className={`text-sm font-bold shrink-0 ${prog.score >= mod.passingScore ? "text-green-400" : "text-yellow-400"}`}>{Math.round(prog.score)}%</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModuleDetail({ module: mod, onClose, onLogLesson }: any) {
  if (!mod) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0d0d0d] border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-y-auto"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0d0d0d] z-10">
        <div>
          <h3 className="font-display font-bold text-lg">{mod.title}</h3>
          <p className="text-xs text-muted-foreground">{mod.topic} · {mod.difficulty}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-6 space-y-4 flex-1">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lessons</h4>
        {mod.lessons?.map((lesson: any, i: number) => (
          <a key={lesson.id} href={lesson.resourceUrl || "#"} target="_blank" rel="noopener noreferrer"
            onClick={() => onLogLesson(lesson.id)}
            className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group cursor-pointer"
          >
            <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-0.5">
              <PlayCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{lesson.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">{lesson.resourceType}</span>
                {(lesson.tags as string[])?.map((tag: string) => (
                  <span key={tag} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground/70">{tag}</span>
                ))}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary shrink-0 mt-1 transition-colors" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}

function GamificationPanel({ gamification }: any) {
  const { streak, badges } = gamification ?? { streak: null, badges: [] };
  const BADGE_COLORS = ["text-yellow-400", "text-blue-400", "text-green-400", "text-purple-400", "text-pink-400", "text-cyan-400"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 flex items-center gap-4">
          <Flame className="h-8 w-8 text-orange-400 shrink-0" />
          <div>
            <p className="text-3xl font-display font-bold text-white">{streak?.currentStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
            <p className="text-xs text-orange-400 mt-1">Best: {streak?.longestStreak ?? 0} days</p>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-center gap-4">
          <Trophy className="h-8 w-8 text-yellow-400 shrink-0" />
          <div>
            <p className="text-3xl font-display font-bold text-white">{badges?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Badges earned</p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Earned Badges</h4>
        {badges?.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground text-sm bg-card rounded-2xl border border-white/5">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-20" />
            Complete modules and quizzes to earn badges!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {badges?.map((badge: any, i: number) => (
              <div key={badge.id} className="bg-card border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <Star className={`h-6 w-6 shrink-0 ${BADGE_COLORS[i % BADGE_COLORS.length]}`} />
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate">{badge.title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(badge.earnedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTimeline({ activity }: any) {
  const eventConfig: Record<string, { icon: any; color: string; label: string }> = {
    exam_taken:        { icon: FileText,    color: "text-blue-400",   label: "Took exam" },
    topic_failed:      { icon: AlertTriangle, color: "text-red-400",  label: "Topic needs work" },
    module_completed:  { icon: CheckCircle2, color: "text-green-400", label: "Completed module" },
    lesson_opened:     { icon: BookOpen,    color: "text-cyan-400",   label: "Opened lesson" },
    quiz_taken:        { icon: Brain,       color: "text-purple-400", label: "Took quiz" },
    streak_updated:    { icon: Flame,       color: "text-orange-400", label: "Streak updated" },
  };

  if (!activity?.length) return (
    <div className="text-center p-12 text-muted-foreground text-sm bg-card rounded-2xl border border-white/5">
      <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
      No activity yet. Start studying to build your history!
    </div>
  );

  return (
    <div className="space-y-1">
      {activity.map((event: any, i: number) => {
        const cfg = eventConfig[event.eventType] ?? { icon: Activity, color: "text-white", label: event.eventType };
        const Icon = cfg.icon;
        return (
          <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
            <div className={`mt-0.5 shrink-0 ${cfg.color}`}><Icon className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{cfg.label}</p>
              {event.metadata?.topic && <p className="text-xs text-muted-foreground">{event.metadata.topic}</p>}
            </div>
            <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">
              {new Date(event.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function LearningHub() {
  const { data: attempts } = useGetAttempts();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCert, setSelectedCert] = useState("AZ-900");
  const [selectedModule, setSelectedModule] = useState<any>(null);

  const [paths, setPaths] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [mastery, setMastery] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [gamification, setGamification] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const totalAttempts = attempts?.length ?? 0;
  const passedAttempts = attempts?.filter((a: any) => a.passed).length ?? 0;
  const averageScore = totalAttempts > 0 ? Math.round((attempts as any[]).reduce((a, b) => a + b.score, 0) / totalAttempts) : 0;

  const fetchAll = useCallback(async () => {
    try {
      const [p, prog, m, wt, recs, act, gam] = await Promise.all([
        API("/learning/paths"),
        API("/learning/progress"),
        API("/learning/mastery"),
        API("/learning/weak-topics"),
        API("/learning/recommendations"),
        API("/learning/activity"),
        API("/learning/gamification"),
      ]);
      setPaths(p);
      setProgress(prog);
      setMastery(m);
      setWeakTopics(wt);
      setRecommendations(recs);
      setActivity(act);
      setGamification(gam);
    } catch {}
  }, []);

  const syncMastery = async () => {
    setSyncing(true);
    try {
      await API("/learning/mastery/sync", { method: "POST", body: JSON.stringify({}) });
      await fetchAll();
    } catch {} finally { setSyncing(false); }
  };

  const dismissRec = async (id: string) => {
    await API(`/learning/recommendations/${id}/dismiss`, { method: "POST" });
    setRecommendations(r => r.filter(x => x.id !== id));
  };

  const handleRecAction = (rec: any) => {
    if (rec.type === "practice_exam") setLocation("/certifications");
    else if (rec.type === "study_module") { setActiveTab("learning-path"); }
    else if (rec.type === "retake_quiz") setActiveTab("weak-topics");
  };

  const logLesson = async (lessonId: string) => {
    await API("/learning/activity", { method: "POST", body: JSON.stringify({ eventType: "lesson_opened", entityId: lessonId, entityType: "lesson" }) });
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const currentPath = paths.find(p => p.certificationCode === selectedCert);
  const currentMastery = mastery.filter(m => m.certificationCode === selectedCert);
  const allMastery = mastery;

  const tabs = [
    { id: "overview",      label: "Overview",       icon: LineChart },
    { id: "learning-path", label: "Learning Path",  icon: Map },
    { id: "mastery",       label: "Topic Mastery",  icon: BarChart3 },
    { id: "weak-topics",   label: "Weak Topics",    icon: Target },
    { id: "recommendations", label: "Recommendations", icon: Sparkles },
    { id: "activity",      label: "Activity",       icon: Activity },
    { id: "gamification",  label: "Achievements",   icon: Trophy },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <BookOpen className="text-primary h-8 w-8" /> Learning Hub
            </h1>
            <p className="text-muted-foreground mt-1">AI-powered study center with adaptive learning paths.</p>
          </div>
          <button onClick={syncMastery} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-all text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Progress"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/10 gap-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "weak-topics" && weakTopics.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{weakTopics.length}</span>
              )}
              {tab.id === "recommendations" && recommendations.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{recommendations.length}</span>
              )}
              {activeTab === tab.id && <motion.div layoutId="hub-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Assessments" value={totalAttempts} sub="Total exams" icon={Cpu} color="text-cyan-400" />
              <StatCard label="Pass Rate" value={`${totalAttempts > 0 ? Math.round(passedAttempts/totalAttempts*100) : 0}%`} sub={`${passedAttempts} passed`} icon={Activity} color="text-green-400" />
              <StatCard label="Avg Score" value={`${averageScore}%`} sub="Overall readiness" icon={Zap} color="text-primary" />
            </div>

            {/* Readiness + Quick Mastery */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-2xl border border-primary/20 p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10"><Brain className="w-32 h-32" /></div>
                <h3 className="text-xl font-display font-bold mb-2">Ezzy's Assessment</h3>
                <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                  {weakTopics.length > 0
                    ? `You have ${weakTopics.length} weak topic${weakTopics.length > 1 ? "s" : ""}. Focus on ${weakTopics[0]?.topic} first (priority ${weakTopics[0]?.priorityScore}).`
                    : averageScore > 80 ? "Excellent progress! You're ready for a practice exam."
                    : "Keep studying! Complete more modules to improve your readiness."}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Readiness</span><span>{averageScore > 80 ? "High" : averageScore > 60 ? "Moderate" : "Needs Work"}</span></div>
                  <div className="w-full bg-black/40 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.max(averageScore, 5)}%` }} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-card rounded-2xl border border-white/5 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-primary" /> Topic Mastery Snapshot</h3>
                {allMastery.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No mastery data yet. Take an exam and click Sync Progress.</p>
                ) : (
                  <div className="space-y-3">
                    {allMastery.slice(0, 5).map((m: any) => (
                      <div key={m.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{m.topic}</span>
                          <span className={m.masteryScore >= 70 ? "text-green-400" : m.masteryScore >= 50 ? "text-yellow-400" : "text-red-400"}>{Math.round(m.masteryScore)}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${m.masteryScore >= 70 ? "bg-green-400" : m.masteryScore >= 50 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${Math.max(m.masteryScore, 2)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations preview */}
            {recommendations.length > 0 && (
              <div className="bg-card rounded-2xl border border-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Top Recommendations</h3>
                  <button onClick={() => setActiveTab("recommendations")} className="text-xs text-primary hover:underline">See all</button>
                </div>
                <div className="space-y-3">
                  {recommendations.slice(0, 2).map((rec: any) => (
                    <RecommendationCard key={rec.id} rec={rec} onDismiss={dismissRec} onAction={handleRecAction} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Learning Path ── */}
        {activeTab === "learning-path" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 relative">
            <div className="flex gap-2 flex-wrap">
              {["AZ-900", "AZ-104"].map(cert => (
                <button key={cert} onClick={() => setSelectedCert(cert)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCert === cert ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                >{cert}</button>
              ))}
            </div>
            <LearningPathView path={currentPath} progress={progress} onModuleClick={setSelectedModule} />
            <AnimatePresence>
              {selectedModule && <ModuleDetail module={selectedModule} onClose={() => setSelectedModule(null)} onLogLesson={logLesson} />}
            </AnimatePresence>
          </div>
        )}

        {/* ── Topic Mastery ── */}
        {activeTab === "mastery" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl">Topic Mastery</h3>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />≥70%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />50–70%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />&lt;50%</span>
              </div>
            </div>
            {allMastery.length === 0 ? (
              <div className="text-center p-12 bg-card rounded-2xl border border-white/5 text-muted-foreground text-sm">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                Take an exam then click <strong>Sync Progress</strong> to compute mastery scores.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allMastery.map((m: any) => {
                  const wt = weakTopics.find(w => w.topic === m.topic);
                  return <MasteryBar key={m.id} topic={m.topic} score={m.masteryScore} priorityScore={wt?.priorityScore} linkedModuleTitle={wt?.linkedModuleTitle}
                    onStudy={() => { setSelectedCert(m.certificationCode); setActiveTab("learning-path"); }} />;
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Weak Topics ── */}
        {activeTab === "weak-topics" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl flex items-center gap-2"><Target className="h-6 w-6 text-red-400" /> Weak Topic Queue</h3>
              <span className="text-xs text-muted-foreground">{weakTopics.length} topics need attention</span>
            </div>
            {weakTopics.length === 0 ? (
              <div className="text-center p-12 bg-card rounded-2xl border border-white/5">
                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="font-bold">No weak topics!</p>
                <p className="text-sm text-muted-foreground mt-1">All your topics are above 70% mastery. Keep it up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((wt: any) => (
                  <div key={wt.topic} className="bg-card border border-white/5 hover:border-red-500/20 rounded-2xl p-5 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{wt.topic}</h4>
                          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">Priority {wt.priorityScore}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{Math.round(wt.masteryScore)}% mastery</span>
                          <span>{wt.correctAnswers}/{wt.totalAttempts} correct</span>
                          {wt.daysSinceLastAttempt > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{wt.daysSinceLastAttempt}d ago</span>}
                        </div>
                        <div className="mt-2 w-full bg-white/5 rounded-full h-1.5">
                          <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${Math.max(wt.masteryScore, 2)}%` }} />
                        </div>
                      </div>
                      {wt.linkedModuleId && (
                        <button onClick={() => { setSelectedCert(wt.certificationCode); setActiveTab("learning-path"); }}
                          className="shrink-0 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4" /> Study
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Recommendations ── */}
        {activeTab === "recommendations" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Ezzy Recommendations</h3>
              <button onClick={syncMastery} disabled={syncing} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} /> Regenerate
              </button>
            </div>
            {recommendations.length === 0 ? (
              <div className="text-center p-12 bg-card rounded-2xl border border-white/5 text-muted-foreground text-sm">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                No recommendations yet. Take an exam and sync your progress to get personalized suggestions.
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-3">
                  {recommendations.map((rec: any) => (
                    <RecommendationCard key={rec.id} rec={rec} onDismiss={dismissRec} onAction={handleRecAction} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        )}

        {/* ── Activity Timeline ── */}
        {activeTab === "activity" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-display font-bold text-xl flex items-center gap-2"><Activity className="h-6 w-6 text-cyan-400" /> Learning History</h3>
            <div className="bg-card rounded-2xl border border-white/5 p-4">
              <ActivityTimeline activity={activity} />
            </div>
          </div>
        )}

        {/* ── Gamification ── */}
        {activeTab === "gamification" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-display font-bold text-xl flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-400" /> Achievements</h3>
            <GamificationPanel gamification={gamification} />
          </div>
        )}
      </div>
    </Layout>
  );
}
