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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function EzzyWrapper() {
  const [location] = useLocation();
  const isExamRoute = location.startsWith("/exam/");
  const isConfigureRoute = location.startsWith("/configure/");
  const certCode = isConfigureRoute ? location.split("/")[2] : undefined;
  return <EzzyChat examMode={isExamRoute} certificationCode={certCode} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
