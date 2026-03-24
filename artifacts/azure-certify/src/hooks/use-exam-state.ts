import { useState, useEffect, useCallback } from 'react';

export function useExamState(sessionId: string) {
  // Try to load from localStorage first to prevent data loss on refresh
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`exam-${sessionId}-answers`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`exam-${sessionId}-time`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [markedForReview, setMarkedForReview] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`exam-${sessionId}-review`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Sync to local storage whenever state changes
  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(`exam-${sessionId}-answers`, JSON.stringify(answers));
    localStorage.setItem(`exam-${sessionId}-time`, timeSpentSeconds.toString());
    localStorage.setItem(`exam-${sessionId}-review`, JSON.stringify(Array.from(markedForReview)));
  }, [answers, timeSpentSeconds, markedForReview, sessionId]);

  const setAnswer = useCallback((questionId: string, answerKey: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerKey }));
  }, []);

  const toggleReview = useCallback((questionId: string) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const incrementTime = useCallback(() => {
    setTimeSpentSeconds(prev => prev + 1);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(`exam-${sessionId}-answers`);
    localStorage.removeItem(`exam-${sessionId}-time`);
    localStorage.removeItem(`exam-${sessionId}-review`);
  }, [sessionId]);

  return {
    answers,
    setAnswer,
    timeSpentSeconds,
    incrementTime,
    markedForReview,
    toggleReview,
    clearSession
  };
}
