import { useGetCertifications, useGetAttempts } from "@workspace/api-client-react";
import { Layout, cn } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, ArrowRight, Award, Clock, Activity, CheckCircle2, XCircle, Cloud, History } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const { data: certifications, isLoading: certsLoading } = useGetCertifications();
  const { data: attempts, isLoading: attemptsLoading } = useGetAttempts();

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'fundamentals': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'associate': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'expert': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'specialty': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12">
          <div className="absolute inset-0 z-0">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
              alt="Azure background" 
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Gemini AI Powered
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4">
              Master your Azure <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                Certifications
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Practice with AI-generated exams tailored to your weak points. 
              Get deep analytics, study plans, and realistic exam scenarios.
            </p>
          </div>
        </div>

        {/* Certifications Grid */}
        <div>
          <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
            <Award className="text-primary" /> Available Paths
          </h2>
          
          {certsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-card border border-white/5 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications?.map((cert, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={cert.code}
                >
                  <Link 
                    href={`/configure/${cert.code}`}
                    className="block group h-full bg-card rounded-2xl p-6 border border-white/5 hover:border-primary/50 hover:bg-white/[0.03] transition-all duration-300 shadow-lg hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Cloud className="w-24 h-24" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${cert.iconColor || 'bg-primary/20 text-primary'}`}>
                          <Award size={24} />
                        </div>
                        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", getLevelColor(cert.level))}>
                          {cert.level}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors">
                        {cert.code}
                      </h3>
                      <h4 className="font-medium text-foreground/90 mb-3">{cert.name}</h4>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-grow">
                        {cert.description}
                      </p>
                      
                      <div className="flex items-center text-primary font-medium text-sm mt-auto">
                        Configure Exam <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div>
          <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
            <History className="text-primary" /> Recent History
          </h2>
          
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            {attemptsLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Loading history...</div>
            ) : !attempts || attempts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No exam attempts yet. Start practicing!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="p-4 font-medium text-muted-foreground">Exam</th>
                      <th className="p-4 font-medium text-muted-foreground">Mode</th>
                      <th className="p-4 font-medium text-muted-foreground">Score</th>
                      <th className="p-4 font-medium text-muted-foreground">Result</th>
                      <th className="p-4 font-medium text-muted-foreground">Time</th>
                      <th className="p-4 font-medium text-muted-foreground">Date</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attempts.slice(0, 5).map(attempt => (
                      <tr key={attempt.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-semibold">{attempt.certificationCode}</td>
                        <td className="p-4 text-muted-foreground capitalize">{attempt.mode}</td>
                        <td className="p-4 font-display font-medium">
                          {attempt.score}%
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            attempt.passed 
                              ? "text-success bg-success/10 border-success/20" 
                              : "text-destructive bg-destructive/10 border-destructive/20"
                          )}>
                            {attempt.passed ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                            {attempt.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {format(new Date(attempt.completedAt), 'MMM d, yyyy')}
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            href={`/results/${attempt.id}`}
                            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
