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
import { useGetAttempt, useGetExamSession } from "@workspace/api-client-react";

function EzzyWrapper() {
  const [location] = useLocation();
  const isExamRoute = location.startsWith("/exam/");
  const isConfigureRoute = location.startsWith("/configure/");
  const isResultsRoute = location.startsWith("/results/") || location.startsWith("/analysis/");
  const certCode = isConfigureRoute ? location.split("/")[2] : undefined;

  // Extract attemptId and sessionId
  const attemptId = isResultsRoute ? location.split("/")[2] : undefined;
  const sessionId = isExamRoute ? location.split("/")[2] : undefined;

  const { data: attemptData } = useGetAttempt(attemptId ?? "");
  const { data: sessionData } = useGetExamSession(sessionId ?? "");

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

  // Only disable Ezzy in 'exam' mode, allow in 'practice' mode
  const isPracticeMode = sessionData?.mode === "practice";
  const effectivelyDisabled = isExamRoute && !isPracticeMode;

  return (
    <EzzyChat
      examMode={effectivelyDisabled}
      certificationCode={certCode || resultsContext?.certificationCode || sessionData?.certificationCode}
      resultsContext={resultsContext}
    />
  );
}

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import LearningHub from "@/pages/learning-hub";
import AdminDashboard from "@/pages/admin";
import Feedback from "@/pages/feedback";
import Analytics from "@/pages/analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/analytics" component={Analytics} />
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
