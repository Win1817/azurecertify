import { pgTable, text, integer, real, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

// ─── Learning Path Hierarchy ───────────────────────────────────────────────

export const learningPathsTable = pgTable("learning_paths", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  certificationCode: varchar("certification_code", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  totalModules: integer("total_modules").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningModulesTable = pgTable("learning_modules", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  pathId: text("path_id").notNull().references(() => learningPathsTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  topic: varchar("topic", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"), // easy|medium|hard
  orderIndex: integer("order_index").notNull().default(0),
  passingScore: integer("passing_score").notNull().default(80),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningLessonsTable = pgTable("learning_lessons", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: text("module_id").notNull().references(() => learningModulesTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  resourceUrl: text("resource_url"),
  resourceType: varchar("resource_type", { length: 30 }).default("article"), // article|video|lab|quiz
  tags: jsonb("tags").default([]),               // ["Networking","RBAC"]
  difficulty: varchar("difficulty", { length: 20 }).default("medium"),
  examRelevance: jsonb("exam_relevance").default([]), // ["AZ-900","AZ-104"]
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── User Progress ─────────────────────────────────────────────────────────

export const userLearningProgressTable = pgTable("user_learning_progress", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  moduleId: text("module_id").notNull().references(() => learningModulesTable.id),
  completed: boolean("completed").notNull().default(false),
  score: real("score"),                          // last quiz score for this module
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Topic Mastery ─────────────────────────────────────────────────────────

export const topicMasteryTable = pgTable("topic_mastery", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  topic: varchar("topic", { length: 100 }).notNull(),
  certificationCode: varchar("certification_code", { length: 20 }).notNull(),
  masteryScore: real("mastery_score").notNull().default(0),   // 0-100
  correctAnswers: integer("correct_answers").notNull().default(0),
  totalAttempts: integer("total_attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Topic-level Quizzes ────────────────────────────────────────────────────

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  moduleId: text("module_id").notNull().references(() => learningModulesTable.id),
  topic: varchar("topic", { length: 100 }).notNull(),
  certificationCode: varchar("certification_code", { length: 20 }).notNull(),
  score: real("score").notNull(),
  correctCount: integer("correct_count").notNull(),
  totalCount: integer("total_count").notNull(),
  passed: boolean("passed").notNull(),
  questionResults: jsonb("question_results").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// ─── Learning Activity Log (History Timeline) ─────────────────────────────

export const learningActivityTable = pgTable("learning_activity", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  // event_type: exam_taken|topic_failed|module_completed|lesson_opened|quiz_taken|streak_updated
  entityId: text("entity_id"),                  // moduleId, attemptId, lessonId etc.
  entityType: varchar("entity_type", { length: 30 }),
  metadata: jsonb("metadata").default({}),       // flexible payload
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Recommendations ───────────────────────────────────────────────────────

export const recommendationsTable = pgTable("recommendations", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  type: varchar("type", { length: 30 }).notNull(),
  // type: study_module|retake_quiz|practice_exam|external_resource
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  entityId: text("entity_id"),
  priority: integer("priority").notNull().default(0),  // higher = more urgent
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Gamification ─────────────────────────────────────────────────────────

export const userStreaksTable = pgTable("user_streaks", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: text("last_activity_date"),  // YYYY-MM-DD
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userBadgesTable = pgTable("user_badges", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  badgeId: varchar("badge_id", { length: 50 }).notNull(),
  // badge_id: first_exam|networking_master|streak_7|az900_ready etc.
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// ─── Types ─────────────────────────────────────────────────────────────────

export type LearningPath = typeof learningPathsTable.$inferSelect;
export type LearningModule = typeof learningModulesTable.$inferSelect;
export type LearningLesson = typeof learningLessonsTable.$inferSelect;
export type UserLearningProgress = typeof userLearningProgressTable.$inferSelect;
export type TopicMastery = typeof topicMasteryTable.$inferSelect;
export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;
export type LearningActivity = typeof learningActivityTable.$inferSelect;
export type Recommendation = typeof recommendationsTable.$inferSelect;
export type UserStreak = typeof userStreaksTable.$inferSelect;
export type UserBadge = typeof userBadgesTable.$inferSelect;
