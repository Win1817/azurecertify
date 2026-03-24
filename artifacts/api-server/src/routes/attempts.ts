import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { examAttemptsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/attempts", async (_req, res) => {
  const attempts = await db
    .select()
    .from(examAttemptsTable)
    .orderBy(desc(examAttemptsTable.completedAt))
    .limit(50);

  res.json(
    attempts.map((a) => ({
      id: a.id,
      certificationCode: a.certificationCode,
      mode: a.mode,
      score: a.score,
      passed: a.passed,
      questionCount: a.totalCount,
      timeSpentSeconds: a.timeSpentSeconds,
      completedAt: a.completedAt?.toISOString(),
    }))
  );
});

router.get("/attempts/:attemptId", async (req, res) => {
  const { attemptId } = req.params;
  const attempts = await db
    .select()
    .from(examAttemptsTable)
    .where(eq(examAttemptsTable.id, attemptId));

  if (attempts.length === 0) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  const a = attempts[0];

  res.json({
    attempt: {
      id: a.id,
      certificationCode: a.certificationCode,
      mode: a.mode,
      score: a.score,
      passed: a.passed,
      questionCount: a.totalCount,
      timeSpentSeconds: a.timeSpentSeconds,
      completedAt: a.completedAt?.toISOString(),
    },
    result: {
      attemptId: a.id,
      score: a.score,
      passed: a.passed,
      correctCount: a.correctCount,
      totalCount: a.totalCount,
      timeSpentSeconds: a.timeSpentSeconds,
      questionResults: a.questionResults,
      topicBreakdown: a.topicBreakdown,
    },
    analysis: a.aiAnalysis ?? null,
  });
});

export default router;
