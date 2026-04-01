import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useGetExamSession, useSubmitExam } from "@workspace/api-client-react";
import { useExamState } from "@/hooks/use-exam-state";
import { cn } from "@/components/layout";
import { Flag, ChevronRight, ChevronLeft, Send, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamInterface() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [, setLocation] = useLocation();

  const { data: session, isLoading } = useGetExamSession(sessionId);
  const { answers, setAnswer, timeSpentSeconds, incrementTime, markedForReview, toggleReview, clearSession } = useExamState(sessionId);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [antiCheatWarnings, setAntiCheatWarnings] = useState(0);

  const { mutate: submit, isPending: isSubmitting } = useSubmitExam({
    mutation: {
      onSuccess: (data) => {
        clearSession();
        setLocation(`/results/${data.attemptId}`);
      }
    }
  });

  // Timer
  useEffect(() => {
    if (!session || isLoading) return;
    const interval = setInterval(() => {
      incrementTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [session, isLoading, incrementTime]);

  // Anti-cheat (tab/window switching)
  useEffect(() => {
    // Only enforce in exam mode — register once session is known
    if (!session || session.mode !== 'exam') return;

    let lastHidden = false; // debounce double-fires

    const handleVisibilityChange = () => {
      if (document.hidden && !lastHidden) {
        lastHidden = true;
        setAntiCheatWarnings(prev => {
          const next = prev + 1;
          // Auto-submit after 3 violations
          if (next >= 3) {
            submit({ sessionId, data: { answers, timeSpentSeconds, autoSubmitted: true } });
          }
          return next;
        });
      } else if (!document.hidden) {
        lastHidden = false;
      }
    };

    const handleWindowBlur = () => {
      // Catches: DevTools open, alt-tab to another app, window focus lost
      if (!document.hidden) {
        // Tab is still "visible" but window lost focus — count as suspicious
        setAntiCheatWarnings(prev => {
          const next = prev + 1;
          if (next >= 3) {
            submit({ sessionId, data: { answers, timeSpentSeconds, autoSubmitted: true } });
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [session, answers, timeSpentSeconds, sessionId, submit]);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-muted-foreground">Preparing Exam Environment...</p>
        </div>
      </div>
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  
  const totalLimitSeconds = session.timeLimitMinutes * 60;
  const remainingSeconds = Math.max(0, totalLimitSeconds - timeSpentSeconds);
  const timeCritical = remainingSeconds < 300 && session.mode === 'exam'; // less than 5 mins

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      submit({ sessionId, data: { answers, timeSpentSeconds: totalLimitSeconds } });
    }
  };

  if (remainingSeconds === 0 && session.mode === 'exam') {
    handleAutoSubmit();
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Time's Up!</h2>
          <p className="text-muted-foreground mb-6">Your exam is being automatically submitted...</p>
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleFinalSubmit = () => {
    submit({ sessionId, data: { answers, timeSpentSeconds } });
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* Anti-cheat Toast */}
      <AnimatePresence>
        {antiCheatWarnings > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3"
          >
            <AlertTriangle />
            <div>
              <p className="font-bold">Warning: Focus Lost ({antiCheatWarnings}/3)</p>
              <p className="text-sm opacity-90">
                {antiCheatWarnings >= 2
                  ? "Final warning! One more violation will auto-submit your exam."
                  : "Do not switch tabs or windows during an exam."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4">Submit Exam?</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between pb-3 border-b border-white/10">
                <span className="text-muted-foreground">Answered:</span>
                <span className="font-medium text-white">{answeredCount} of {questions.length}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-white/10">
                <span className="text-muted-foreground">Unanswered:</span>
                <span className={cn("font-medium", questions.length - answeredCount > 0 ? "text-warning text-yellow-500" : "text-success text-green-500")}>
                  {questions.length - answeredCount}
                </span>
              </div>
              <div className="flex justify-between pb-3 border-b border-white/10">
                <span className="text-muted-foreground">Marked for Review:</span>
                <span className="font-medium text-white">{markedForReview.size}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-medium"
              >
                Return to Exam
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Left Sidebar - Navigator */}
      <div className="w-72 bg-[#0d0d0d] border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-display font-bold text-lg mb-1">{session.certificationCode} Exam</h2>
          <p className="text-xs text-muted-foreground capitalize">{session.mode} Mode</p>
          
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;
              const isMarked = markedForReview.has(q.id);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "h-10 text-xs font-medium rounded-md border flex items-center justify-center relative transition-all duration-200",
                    isCurrent 
                      ? "border-primary bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,120,212,0.3)]" 
                      : isAnswered
                        ? "border-transparent bg-white/10 text-white hover:bg-white/20"
                        : "border-white/10 bg-transparent text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {idx + 1}
                  {isMarked && (
                    <div className="absolute -top-1 -right-1">
                      <Flag className="w-3 h-3 fill-orange-500 text-orange-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Exam Area */}
      <div className="flex-1 flex flex-col relative bg-background">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]">
          <div className="flex items-center gap-4 lg:hidden">
            <h2 className="font-display font-bold">{session.certificationCode}</h2>
            <span className="text-xs px-2 py-1 rounded bg-white/5 text-muted-foreground">{currentIndex + 1} / {questions.length}</span>
          </div>
          
          <div className="flex items-center ml-auto gap-6">
            <div className={cn(
              "flex items-center gap-2 font-mono text-lg font-bold px-4 py-1.5 rounded-lg border transition-colors duration-300",
              session.mode === 'exam' 
                ? timeCritical 
                  ? "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse" 
                  : "bg-white/5 border-white/10"
                : "bg-white/5 border-white/10 text-muted-foreground"
            )}>
              <Clock className="w-5 h-5" />
              {session.mode === 'exam' ? formatTime(remainingSeconds) : formatTime(timeSpentSeconds)}
            </div>
            
            <button 
              onClick={() => setShowSubmitConfirm(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              Finish <span className="hidden sm:inline">Exam</span>
            </button>
          </div>
        </header>

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto pb-24">
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-primary">Question {currentIndex + 1}</span>
              <button 
                onClick={() => toggleReview(currentQuestion.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  markedForReview.has(currentQuestion.id) 
                    ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
              >
                <Flag className={cn("w-4 h-4", markedForReview.has(currentQuestion.id) && "fill-current")} />
                Review Later
              </button>
            </div>

            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Question Text */}
              <div className="text-lg md:text-xl leading-relaxed font-medium">
                {currentQuestion.content}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.key;
                  return (
                    <label 
                      key={opt.key}
                      className={cn(
                        "flex items-start gap-4 p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-[inset_0_0_20px_rgba(0,120,212,0.05)]" 
                          : "border-white/5 bg-card hover:bg-white/[0.03] hover:border-white/10"
                      )}
                    >
                      <div className="pt-0.5">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          isSelected ? "border-primary" : "border-muted-foreground group-hover:border-white/50"
                        )}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name={`question-${currentQuestion.id}`}
                        value={opt.key}
                        checked={isSelected}
                        onChange={() => setAnswer(currentQuestion.id, opt.key)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <span className="font-bold mr-3 text-muted-foreground">{opt.key}.</span>
                        <span className={cn(isSelected ? "text-white" : "text-foreground/90")}>{opt.text}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Practice Mode immediate feedback - optional */}
              {session.mode === 'practice' && answers[currentQuestion.id] && (
                <div className="mt-8 p-6 rounded-xl border border-primary/20 bg-primary/5">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Explanation
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {currentQuestion.explanation}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-white/10">
                    Correct Answer: <span className="font-bold">{currentQuestion.correctAnswer}</span>
                  </p>
                </div>
              )}
            </motion.div>

          </div>
        </main>

        {/* Bottom Navigation Bar */}
        <footer className="h-20 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-4 md:px-8 absolute bottom-0 left-0 right-0 z-10">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-lg border border-white/10 text-white font-medium flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          
          <div className="flex items-center gap-2">
            {currentIndex === questions.length - 1 ? (
              <button 
                onClick={() => setShowSubmitConfirm(true)}
                className="px-8 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
              >
                Submit Exam <Send className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 font-bold flex items-center gap-2 transition-colors"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
