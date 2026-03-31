import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { useGetAttempts } from "@workspace/api-client-react";

const COLORS = ["#0078d4", "#107c10", "#d83b01", "#5c2d91", "#008272"];

export default function Analytics() {
  const { data: history } = useGetAttempts();
  const attempts: any[] = Array.isArray(history) ? history : [];
  
  const passed = attempts.filter((a: any) => a.passed).length;
  const failed = attempts.length - passed;
  const passData = [
    { name: "Pass", value: passed },
    { name: "Fail", value: failed }
  ];

  // Mock AI Metrics
  const aiMetrics = [
    { name: "Hints Used", value: 142 },
    { name: "Ezzy Chats", value: 34 },
    { name: "AI Feedback", value: 50 }
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <BarChart3 className="text-primary h-8 w-8" /> Learning Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Deep dive into your Azure certification progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-white/5 border-t-primary/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-primary h-5 w-5" /> Pass/Fail Ratio
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex justify-center items-center">
              {attempts.length === 0 ? (
                <p className="text-muted-foreground">Complete exams to see data</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={passData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                      <Cell fill="#107c10" />
                      <Cell fill="#d83b01" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 border-t-cyan-500/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-cyan-500 h-5 w-5" /> AI Usage Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex justify-center items-center pr-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiMetrics} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: "#ffffff80", fontSize: 12 }} />
                  <YAxis stroke="#ffffff50" tick={{ fill: "#ffffff80", fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#ffffff05" }} contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }} />
                  <Bar dataKey="value" fill="#0078d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-white/5 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500 h-5 w-5" /> Weak Topics Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">Submit a practice exam to AI generate topic insights.</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm">Azure Role-Based Access Control (RBAC)</span>
                    <span className="text-red-400 font-bold text-sm">45%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: "45%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Missed in 3 recent AZ-104 attempts.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm">Azure Virtual Networks</span>
                    <span className="text-yellow-400 font-bold text-sm">60%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: "60%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Improving. Review subnet routing.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
