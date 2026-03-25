import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useGetAttempts } from "@workspace/api-client-react";
import HistoryPage from "./history";
import { 
  BookOpen, Target, Brain, LineChart, Cpu, Zap, Activity, FileText, ChevronRight, PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function LearningHub() {
  const { data: attempts, isLoading } = useGetAttempts();
  const [activeTab, setActiveTab] = useState("overview");

  const totalAttempts = attempts?.length ?? 0;
  const passedAttempts = attempts?.filter(a => a.passed).length ?? 0;
  const averageScore = totalAttempts > 0 
    ? Math.round(attempts!.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts) 
    : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: LineChart },
    { id: "history", label: "Exam History", icon: Activity },
    { id: "weak-topics", label: "Weak Topics", icon: Target },
    { id: "recommendations", label: "Ezzy Recommend", icon: Brain },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <BookOpen className="text-primary h-8 w-8" /> Learning Hub
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Your personalized Azure study center, powered by AI.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/10 gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap
                ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="learning-hub-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Stats Card */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-lg shadow-black/80 flex flex-col justify-between">
                 <div className="flex items-center gap-3 text-cyan-400 mb-4">
                   <div className="bg-cyan-500/10 p-2 rounded-lg"><Cpu className="h-5 w-5" /></div>
                   <span className="font-semibold text-sm tracking-wider uppercase">Assessments</span>
                 </div>
                 <div>
                   <span className="text-4xl font-display font-bold">{totalAttempts}</span>
                   <p className="text-muted-foreground text-sm mt-1">Total exams completed</p>
                 </div>
               </div>

               <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-lg shadow-black/80 flex flex-col justify-between">
                 <div className="flex items-center gap-3 text-green-400 mb-4">
                   <div className="bg-green-500/10 p-2 rounded-lg"><Activity className="h-5 w-5" /></div>
                   <span className="font-semibold text-sm tracking-wider uppercase">Pass Rate</span>
                 </div>
                 <div>
                   <span className="text-4xl font-display font-bold">{totalAttempts > 0 ? Math.round((passedAttempts/totalAttempts)*100) : 0}%</span>
                   <p className="text-muted-foreground text-sm mt-1">{passedAttempts} successful attempts</p>
                 </div>
               </div>

               <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-lg shadow-black/80 flex flex-col justify-between">
                 <div className="flex items-center gap-3 text-primary mb-4">
                   <div className="bg-primary/10 p-2 rounded-lg"><Zap className="h-5 w-5" /></div>
                   <span className="font-semibold text-sm tracking-wider uppercase">Avg Score</span>
                 </div>
                 <div>
                   <span className="text-4xl font-display font-bold">{averageScore}%</span>
                   <p className="text-muted-foreground text-sm mt-1">Overall readiness</p>
                 </div>
               </div>
            </div>

            {/* AI Readiness Card */}
            <div className="bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-2xl border border-primary/20 p-6 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute -right-4 -top-4 opacity-10">
                 <Brain className="w-32 h-32" />
               </div>
               <h3 className="text-xl font-display font-bold mb-2 z-10">Ezzy's Assessment</h3>
               <p className="text-sm text-foreground/80 mb-6 z-10 leading-relaxed">Based on your recent exam performance, you are showing strong foundational knowledge but need minor improvements in Networking.</p>
               <div className="space-y-3 z-10 w-full">
                 <div className="flex justify-between items-center text-sm font-medium">
                   <span>Overall Readiness</span>
                   <span>{averageScore > 80 ? 'High' : averageScore > 60 ? 'Moderate' : 'Needs Review'}</span>
                 </div>
                 <div className="w-full bg-black/40 rounded-full h-2">
                   <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(averageScore, 10)}%` }} />
                 </div>
               </div>
            </div>

            {/* Quick Learning Resources */}
            <div className="md:col-span-3 mt-4">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Curated Resources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {['Azure Architecture Fundamentals', 'RBAC & Identity Access', 'Networking & VNet Lab'].map((title, i) => (
                  <div key={title} className="group p-5 bg-card/80 hover:bg-card border border-white/5 hover:border-primary/30 rounded-xl transition-all cursor-pointer">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <PlayCircle className="text-primary h-5 w-5" />
                    </div>
                    <h4 className="font-bold mb-1 truncate">{title}</h4>
                    <p className="text-xs text-muted-foreground">Microsoft Learn integration</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
           <div className="animate-in slide-in-from-bottom-4 duration-500 pb-2">
             <HistoryPage noLayout={true} />
           </div>
        )}

        {/* Weak Topics Tab */}
        {activeTab === "weak-topics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-lg">
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <Target className="h-5 w-5 text-red-400" /> Focus Areas
               </h3>
               <div className="space-y-6">
                 {['Azure Virtual Networks', 'Role-Based Access Control', 'Azure Storage Tiers'].map((topic, i) => (
                   <div key={topic}>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="font-medium">{topic}</span>
                       <span className="text-muted-foreground">{40 + (i * 15)}% proficiency</span>
                     </div>
                     <div className="w-full bg-white/5 rounded-full h-2">
                       <div className="bg-red-400 h-2 rounded-full" style={{ width: `${40 + (i * 15)}%` }} />
                     </div>
                   </div>
                 ))}
               </div>
               <button className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors">
                 Generate Targeted Practice Exam
               </button>
             </div>
          </div>
        )}

        {/* Ezzy Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 duration-500">
            {[
              { title: "Review Azure Networking", desc: "You missed 4 questions on VNets in your last AZ-104 attempt. Consider reviewing Peering concepts.", action: "Study Material" },
              { title: "Retry AZ-900 Core Services", desc: "Your confidence on Compute services was low. Try a 10-question practice run focused just on Compute.", action: "Start Practice" },
              { title: "Schedule Certification", desc: "You've scored above 85% on three consecutive AZ-900 simulations! You're ready for the real thing.", action: "View Certifications" }
            ].map((rec, i) => (
              <div key={i} className="bg-card border border-white/5 hover:border-primary/30 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between transition-all group">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-full mt-1 shrink-0">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                    <p className="text-muted-foreground text-sm">{rec.desc}</p>
                  </div>
                </div>
                <button className="whitespace-nowrap px-6 py-2.5 bg-white/5 group-hover:bg-primary group-hover:text-primary-foreground text-sm font-medium rounded-xl transition-colors">
                  {rec.action}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
