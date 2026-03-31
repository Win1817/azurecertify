import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Sparkles, TrendingUp, Clock, FileText } from "lucide-react";
import { useGetAttempts } from "@workspace/api-client-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const { data: history } = useGetAttempts();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("azure_user");
      if (stored) setUser(JSON.parse(stored));
      else setLocation("/login");
    } catch {
      setLocation("/login");
    }
  }, [setLocation]);

  const attempts: any[] = Array.isArray(history) ? history : [];
  const passedCount = attempts.filter((a: any) => a.passed).length;
  const recentExams = attempts.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Welcome back, {user?.name || "Student"}! 🚀
            </h1>
            <p className="text-muted-foreground mt-1">Here is your Azure certification progress overview.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/learning-hub">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <BookOpen className="w-4 h-4 mr-2" /> Learning Hub
              </Button>
            </Link>
            <Link href="/certifications">
              <Button>
                <Target className="w-4 h-4 mr-2" /> Take Exam
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </span>
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-white">{attempts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Exams taken so far</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24 text-green-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <Target className="w-4 h-4" />
                </span>
                Exams Passed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-white">{passedCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Certifications ready</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-24 h-24 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-white">
                {attempts.length ? Math.round(attempts.reduce((a: any, b: any) => a + Number(b.score), 0) / attempts.length) : 0}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Across all attempts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* AI Suggestions Panel */}
          <Card className="bg-card border-white/5 border-t-primary/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <h4 className="font-semibold text-primary mb-1">Focus on Security</h4>
                <p className="text-sm text-muted-foreground">Based on your recent AZ-104 attempts, you should review Azure RBAC and Network Security Groups.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h4 className="font-semibold text-purple-400 mb-1">Ready for AZ-900</h4>
                <p className="text-sm text-muted-foreground">Your average score is above 85%. You're ready to take the official exam!</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Exams */}
          <Card className="bg-card border-white/5 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" /> Recent Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentExams.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground text-sm">No exams taken yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentExams.map((exam: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setLocation(`/results/${exam.id}`)}>
                      <div>
                        <span className="font-bold">{exam.session.certificationCode}</span>
                        <span className="text-xs text-muted-foreground ml-3">{new Date(exam.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${exam.passed ? 'text-green-400' : 'text-red-400'}`}>{exam.score}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <Link href="/learning-hub">
                      <Button variant="link" className="text-primary text-sm p-0 h-auto">View All History &rarr;</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
