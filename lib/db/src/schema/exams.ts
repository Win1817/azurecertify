import { pgTable, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const examSessionsTable = pgTable("exam_sessions", {
  id: text("id").primaryKey(),
  certificationCode: text("certification_code").notNull(),
  mode: text("mode").notNull(),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  timeLimitMinutes: integer("time_limit_minutes").notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examAttemptsTable = pgTable("exam_attempts", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  certificationCode: text("certification_code").notNull(),
  mode: text("mode").notNull(),
  score: real("score").notNull(),
  passed: boolean("passed").notNull(),
  correctCount: integer("correct_count").notNull(),
  totalCount: integer("total_count").notNull(),
  timeSpentSeconds: integer("time_spent_seconds").notNull(),
  answers: jsonb("answers").notNull(),
  questionResults: jsonb("question_results").notNull(),
  topicBreakdown: jsonb("topic_breakdown").notNull(),
  aiAnalysis: jsonb("ai_analysis"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertExamSessionSchema = createInsertSchema(examSessionsTable);
export const insertExamAttemptSchema = createInsertSchema(examAttemptsTable);

export type ExamSession = typeof examSessionsTable.$inferSelect;
export type InsertExamSession = z.infer<typeof insertExamSessionSchema>;
export type ExamAttempt = typeof examAttemptsTable.$inferSelect;
export type InsertExamAttempt = z.infer<typeof insertExamAttemptSchema>;
