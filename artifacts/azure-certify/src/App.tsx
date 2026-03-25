import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EzzyChat } from "@/components/ezzy-chat";

import Home from "@/pages/home";
import ConfigureExam from "@/pages/configure";
import ExamInterface from "@/pages/exam";
import Results from "@/pages/results";
import Analysis from "@/pages/analysis";
import NotFound from "@/pages/not-found";
import History from "@/pages/history";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
import { useGetAttempt } from "@workspace/api-client-react";

function EzzyWrapper() {
  const [location] = useLocation();
  const isExamRoute = location.startsWith("/exam/");
  const isConfigureRoute = location.startsWith("/configure/");
  const isResultsRoute = location.startsWith("/results/") || location.startsWith("/analysis/");
  const certCode = isConfigureRoute ? location.split("/")[2] : undefined;

  // Extract attemptId from results/analysis routes
  const attemptId = isResultsRoute ? location.split("/")[2] : undefined;
  const { data: attemptData } = useGetAttempt(attemptId ?? "");

  // Build results context for Ezzy when on results/analysis pages
  const resultsContext = attemptData ? {
    certificationCode: attemptData.attempt.certificationCode,
    score: attemptData.result.score,
    passed: attemptData.result.passed,
    correctCount: attemptData.result.correctCount,
    totalCount: attemptData.result.totalCount,
    topicBreakdown: (attemptData.result.topicBreakdown as any[]).map((t: any) => ({
      topic: t.topic,
      percentage: t.percentage,
    })),
    weakTopics: (attemptData.result.topicBreakdown as any[])
      .filter((t: any) => t.percentage < 70)
      .map((t: any) => t.topic),
  } : undefined;

  return (
    <EzzyChat
      examMode={isExamRoute}
      certificationCode={certCode || resultsContext?.certificationCode}
      resultsContext={resultsContext}
    />
  );
}

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import LearningHub from "@/pages/learning-hub";
import AdminDashboard from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/dashboard" component={LearningHub} /> {/* Temporarily point dashboard to Learning Hub overview */}
      <Route path="/learning-hub" component={LearningHub} />
      <Route path="/exam-portal" component={Home} />
      <Route path="/certifications" component={Home} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route path="/configure/:code" component={ConfigureExam} />
      <Route path="/exam/:sessionId" component={ExamInterface} />
      <Route path="/results/:attemptId" component={Results} />
      <Route path="/analysis/:attemptId" component={Analysis} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <EzzyWrapper />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
