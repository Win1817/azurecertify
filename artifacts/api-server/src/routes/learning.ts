import { Router } from "express";
import { db } from "@workspace/db";
import {
  learningPathsTable, learningModulesTable, learningLessonsTable,
  userLearningProgressTable, topicMasteryTable, quizAttemptsTable,
  learningActivityTable, recommendationsTable, userStreaksTable, userBadgesTable,
  examAttemptsTable,
} from "@workspace/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "./auth";
import { randomUUID } from "crypto";

const router = Router();

// ─── SEED LEARNING PATHS (called at startup) ──────────────────────────────

export const LEARNING_PATHS_SEED = [
  {
    certificationCode: "AZ-900",
    title: "Azure Fundamentals Path",
    modules: [
      {
        title: "Cloud Concepts", topic: "Cloud Concepts", difficulty: "easy", orderIndex: 0,
        lessons: [
          { title: "What is Cloud Computing?", resourceType: "article", tags: ["Cloud"], examRelevance: ["AZ-900"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/", orderIndex: 0 },
          { title: "Cloud Service Models: IaaS, PaaS, SaaS", resourceType: "article", tags: ["Cloud"], examRelevance: ["AZ-900"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/", orderIndex: 1 },
          { title: "Shared Responsibility Model", resourceType: "article", tags: ["Cloud", "Security"], examRelevance: ["AZ-900"], resourceUrl: "https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility", orderIndex: 2 },
        ]
      },
      {
        title: "Azure Architecture & Services", topic: "Azure Architecture", difficulty: "easy", orderIndex: 1,
        lessons: [
          { title: "Azure Regions & Availability Zones", resourceType: "article", tags: ["Architecture"], examRelevance: ["AZ-900"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-azure-architecture-services/", orderIndex: 0 },
          { title: "Azure Resource Manager", resourceType: "article", tags: ["Architecture"], examRelevance: ["AZ-900", "AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview", orderIndex: 1 },
        ]
      },
      {
        title: "Azure Compute", topic: "Azure Services", difficulty: "medium", orderIndex: 2,
        lessons: [
          { title: "Azure Virtual Machines", resourceType: "article", tags: ["Compute"], examRelevance: ["AZ-900", "AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/", orderIndex: 0 },
          { title: "Azure App Service & Containers", resourceType: "article", tags: ["Compute"], examRelevance: ["AZ-900", "AZ-204"], resourceUrl: "https://learn.microsoft.com/en-us/azure/app-service/overview", orderIndex: 1 },
        ]
      },
      {
        title: "Azure Storage", topic: "Azure Services", difficulty: "medium", orderIndex: 3,
        lessons: [
          { title: "Blob, Queue, Table, File Storage", resourceType: "article", tags: ["Storage"], examRelevance: ["AZ-900", "AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/", orderIndex: 0 },
        ]
      },
      {
        title: "Azure Networking", topic: "Azure Services", difficulty: "medium", orderIndex: 4,
        lessons: [
          { title: "Virtual Networks & Subnets", resourceType: "article", tags: ["Networking"], examRelevance: ["AZ-900", "AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview", orderIndex: 0 },
          { title: "VNet Peering & VPN Gateway", resourceType: "article", tags: ["Networking"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways", orderIndex: 1 },
        ]
      },
      {
        title: "Security & Identity", topic: "Azure Security", difficulty: "medium", orderIndex: 5,
        lessons: [
          { title: "Azure Active Directory & Entra ID", resourceType: "article", tags: ["Identity", "Security"], examRelevance: ["AZ-900", "AZ-104", "AZ-500"], resourceUrl: "https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-whatis", orderIndex: 0 },
          { title: "RBAC & Permissions", resourceType: "article", tags: ["RBAC", "Security"], examRelevance: ["AZ-900", "AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/role-based-access-control/overview", orderIndex: 1 },
          { title: "Azure Security Center & Defender", resourceType: "article", tags: ["Security"], examRelevance: ["AZ-500"], resourceUrl: "https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction", orderIndex: 2 },
        ]
      },
      {
        title: "Pricing & Support", topic: "Pricing & Support", difficulty: "easy", orderIndex: 6,
        lessons: [
          { title: "Azure Pricing Models & TCO Calculator", resourceType: "article", tags: ["Pricing"], examRelevance: ["AZ-900"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/", orderIndex: 0 },
          { title: "Azure SLAs & Service Lifecycle", resourceType: "article", tags: ["Support"], examRelevance: ["AZ-900"], resourceUrl: "https://azure.microsoft.com/en-us/support/legal/sla/", orderIndex: 1 },
        ]
      },
    ]
  },
  {
    certificationCode: "AZ-104",
    title: "Azure Administrator Path",
    modules: [
      { title: "Identity & Governance", topic: "Identity & Governance", difficulty: "medium", orderIndex: 0,
        lessons: [
          { title: "Manage Azure AD Users & Groups", resourceType: "article", tags: ["Identity", "RBAC"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/manage-users-and-groups-in-aad/", orderIndex: 0 },
          { title: "Azure Policies & Blueprints", resourceType: "article", tags: ["Governance"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/governance/policy/overview", orderIndex: 1 },
        ]
      },
      { title: "Storage Management", topic: "Storage", difficulty: "medium", orderIndex: 1,
        lessons: [
          { title: "Storage Accounts & Access Keys", resourceType: "article", tags: ["Storage"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview", orderIndex: 0 },
          { title: "Azure Files & Azure Backup", resourceType: "article", tags: ["Storage", "Backup"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction", orderIndex: 1 },
        ]
      },
      { title: "Compute Resources", topic: "Compute Resources", difficulty: "hard", orderIndex: 2,
        lessons: [
          { title: "VM Sizes, Scaling & Availability Sets", resourceType: "article", tags: ["Compute"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/configure-virtual-machine-availability/", orderIndex: 0 },
          { title: "Azure Kubernetes Service (AKS)", resourceType: "article", tags: ["Compute", "Containers"], examRelevance: ["AZ-104", "AZ-204"], resourceUrl: "https://learn.microsoft.com/en-us/azure/aks/intro-kubernetes", orderIndex: 1 },
        ]
      },
      { title: "Virtual Networking", topic: "Virtual Networking", difficulty: "hard", orderIndex: 3,
        lessons: [
          { title: "NSG, ASG & Firewall Rules", resourceType: "article", tags: ["Networking", "Security"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/training/modules/configure-network-security-groups/", orderIndex: 0 },
          { title: "Azure Load Balancer & Traffic Manager", resourceType: "article", tags: ["Networking"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview", orderIndex: 1 },
        ]
      },
      { title: "Monitoring & Backup", topic: "Monitoring & Backup", difficulty: "medium", orderIndex: 4,
        lessons: [
          { title: "Azure Monitor & Log Analytics", resourceType: "article", tags: ["Monitoring"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/azure-monitor/overview", orderIndex: 0 },
          { title: "Azure Backup & Site Recovery", resourceType: "article", tags: ["Backup"], examRelevance: ["AZ-104"], resourceUrl: "https://learn.microsoft.com/en-us/azure/backup/backup-overview", orderIndex: 1 },
        ]
      },
    ]
  },
];

export async function seedLearningPaths() {
  for (const pathData of LEARNING_PATHS_SEED) {
    const existing = await db.select().from(learningPathsTable)
      .where(eq(learningPathsTable.certificationCode, pathData.certificationCode)).limit(1);
    if (existing.length > 0) continue;

    const [path] = await db.insert(learningPathsTable).values({
      certificationCode: pathData.certificationCode,
      title: pathData.title,
      totalModules: pathData.modules.length,
    }).returning();

    for (const modData of pathData.modules) {
      const [mod] = await db.insert(learningModulesTable).values({
        pathId: path.id,
        title: modData.title,
        topic: modData.topic,
        difficulty: modData.difficulty,
        orderIndex: modData.orderIndex,
      }).returning();

      for (const lessonData of modData.lessons) {
        await db.insert(learningLessonsTable).values({
          moduleId: mod.id,
          title: lessonData.title,
          resourceType: lessonData.resourceType,
          tags: lessonData.tags,
          examRelevance: lessonData.examRelevance,
          resourceUrl: lessonData.resourceUrl,
          orderIndex: lessonData.orderIndex,
        });
      }
    }
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

async function logActivity(userId: string, eventType: string, entityId?: string, entityType?: string, metadata?: any) {
  await db.insert(learningActivityTable).values({ userId, eventType, entityId, entityType, metadata: metadata ?? {} });
}

async function updateStreak(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [streak] = await db.select().from(userStreaksTable).where(eq(userStreaksTable.userId, userId)).limit(1);
  if (!streak) {
    await db.insert(userStreaksTable).values({ userId, currentStreak: 1, longestStreak: 1, lastActivityDate: today });
    return;
  }
  if (streak.lastActivityDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = streak.lastActivityDate === yesterday ? streak.currentStreak + 1 : 1;
  const longest = Math.max(newStreak, streak.longestStreak);
  await db.update(userStreaksTable).set({ currentStreak: newStreak, longestStreak: longest, lastActivityDate: today }).where(eq(userStreaksTable.userId, userId));
}

async function awardBadgeIfNeeded(userId: string, badgeId: string, title: string, description: string) {
  const existing = await db.select().from(userBadgesTable)
    .where(and(eq(userBadgesTable.userId, userId), eq(userBadgesTable.badgeId, badgeId))).limit(1);
  if (existing.length === 0) {
    await db.insert(userBadgesTable).values({ userId, badgeId, title, description });
  }
}

async function recomputeTopicMastery(userId: string, topic: string, certificationCode: string) {
  // Weighted: 70% exam results, 30% quiz results
  const exams = await db.select().from(examAttemptsTable)
    .where(eq(examAttemptsTable.certificationCode, certificationCode))
    .orderBy(desc(examAttemptsTable.completedAt)).limit(20);

  let correct = 0, total = 0;
  for (const exam of exams) {
    const breakdown = exam.topicBreakdown as any;
    if (breakdown && breakdown[topic]) {
      correct += breakdown[topic].correct ?? 0;
      total += breakdown[topic].total ?? 0;
    }
  }
  const examScore = total > 0 ? (correct / total) * 100 : 0;

  const quizzes = await db.select().from(quizAttemptsTable)
    .where(and(eq(quizAttemptsTable.userId, userId), eq(quizAttemptsTable.topic, topic))).limit(10);
  const quizScore = quizzes.length > 0
    ? quizzes.reduce((a, q) => a + q.score, 0) / quizzes.length : 0;

  const mastery = total > 0 ? examScore * 0.7 + quizScore * 0.3 : quizScore;
  const lastAttempt = exams[0]?.completedAt ?? quizzes[0]?.completedAt;

  const existing = await db.select().from(topicMasteryTable)
    .where(and(eq(topicMasteryTable.userId, userId), eq(topicMasteryTable.topic, topic), eq(topicMasteryTable.certificationCode, certificationCode))).limit(1);

  if (existing.length > 0) {
    await db.update(topicMasteryTable).set({
      masteryScore: Math.round(mastery * 10) / 10,
      correctAnswers: correct,
      totalAttempts: total,
      lastAttemptAt: lastAttempt,
      updatedAt: new Date(),
    }).where(eq(topicMasteryTable.id, existing[0].id));
  } else {
    await db.insert(topicMasteryTable).values({
      userId, topic, certificationCode,
      masteryScore: Math.round(mastery * 10) / 10,
      correctAnswers: correct,
      totalAttempts: total,
      lastAttemptAt: lastAttempt,
    });
  }
}

async function generateRecommendations(userId: string) {
  // Clear old non-dismissed recommendations
  await db.delete(recommendationsTable)
    .where(and(eq(recommendationsTable.userId, userId), eq(recommendationsTable.dismissed, false)));

  const masteries = await db.select().from(topicMasteryTable)
    .where(eq(topicMasteryTable.userId, userId))
    .orderBy(topicMasteryTable.masteryScore);

  const recs: any[] = [];

  // Weak topic recommendations
  const weakTopics = masteries.filter(m => m.masteryScore < 60);
  for (const wt of weakTopics.slice(0, 3)) {
    const modules = await db.select().from(learningModulesTable)
      .where(eq(learningModulesTable.topic, wt.topic)).limit(1);
    if (modules.length > 0) {
      const recency = wt.lastAttemptAt
        ? Math.max(0, (Date.now() - new Date(wt.lastAttemptAt).getTime()) / (1000 * 3600 * 24))
        : 30;
      const weakScore = (1 - wt.masteryScore / 100) + Math.min(recency / 30, 1) * 0.3;
      recs.push({
        userId, type: "study_module",
        title: `Study: ${wt.topic}`,
        description: `Your mastery score for ${wt.topic} is ${Math.round(wt.masteryScore)}%. Review this module to improve.`,
        entityId: modules[0].id,
        priority: Math.round(weakScore * 100),
        dismissed: false,
      });
    }
  }

  // Retake quiz recommendations for topics with < 70% mastery
  for (const wt of masteries.filter(m => m.masteryScore >= 60 && m.masteryScore < 70).slice(0, 2)) {
    recs.push({
      userId, type: "retake_quiz",
      title: `Retake Quiz: ${wt.topic}`,
      description: `You're close! A quick quiz on ${wt.topic} (currently ${Math.round(wt.masteryScore)}%) could push you over 70%.`,
      entityId: null,
      priority: 60,
      dismissed: false,
    });
  }

  // Practice exam if average mastery is > 75%
  const avgMastery = masteries.length > 0 ? masteries.reduce((a, m) => a + m.masteryScore, 0) / masteries.length : 0;
  if (avgMastery > 75 && masteries.length >= 3) {
    recs.push({
      userId, type: "practice_exam",
      title: "Take a Practice Exam",
      description: `Your overall readiness is ${Math.round(avgMastery)}%. A full practice exam will validate your progress.`,
      priority: 80,
      dismissed: false,
    });
  }

  if (recs.length > 0) {
    await db.insert(recommendationsTable).values(recs);
  }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────

// GET /api/learning/paths — list all learning paths with modules
router.get("/paths", async (_req, res) => {
  const paths = await db.select().from(learningPathsTable);
  const result = await Promise.all(paths.map(async (path) => {
    const modules = await db.select().from(learningModulesTable)
      .where(eq(learningModulesTable.pathId, path.id))
      .orderBy(learningModulesTable.orderIndex);
    return { ...path, modules };
  }));
  return res.json(result);
});

// GET /api/learning/paths/:certCode — path for specific cert
router.get("/paths/:certCode", async (req, res) => {
  const { certCode } = req.params;
  const [path] = await db.select().from(learningPathsTable)
    .where(eq(learningPathsTable.certificationCode, certCode.toUpperCase())).limit(1);
  if (!path) return res.status(404).json({ error: "Path not found" });

  const modules = await db.select().from(learningModulesTable)
    .where(eq(learningModulesTable.pathId, path.id))
    .orderBy(learningModulesTable.orderIndex);

  const modulesWithLessons = await Promise.all(modules.map(async (mod) => {
    const lessons = await db.select().from(learningLessonsTable)
      .where(eq(learningLessonsTable.moduleId, mod.id))
      .orderBy(learningLessonsTable.orderIndex);
    return { ...mod, lessons };
  }));

  return res.json({ ...path, modules: modulesWithLessons });
});

// GET /api/learning/progress — user's module progress
router.get("/progress", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const progress = await db.select().from(userLearningProgressTable)
    .where(eq(userLearningProgressTable.userId, userId));
  return res.json(progress);
});

// POST /api/learning/progress/:moduleId — mark module started/completed
router.post("/progress/:moduleId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { moduleId } = req.params;
  const { completed, score, timeSpentSeconds } = req.body;

  const [mod] = await db.select().from(learningModulesTable).where(eq(learningModulesTable.id, moduleId)).limit(1);
  if (!mod) return res.status(404).json({ error: "Module not found" });

  const existing = await db.select().from(userLearningProgressTable)
    .where(and(eq(userLearningProgressTable.userId, userId), eq(userLearningProgressTable.moduleId, moduleId))).limit(1);

  const passed = completed && score != null && score >= mod.passingScore;

  if (existing.length > 0) {
    await db.update(userLearningProgressTable).set({
      completed: completed ?? existing[0].completed,
      score: score ?? existing[0].score,
      timeSpentSeconds: (existing[0].timeSpentSeconds || 0) + (timeSpentSeconds || 0),
      completedAt: passed ? new Date() : existing[0].completedAt,
      updatedAt: new Date(),
    }).where(eq(userLearningProgressTable.id, existing[0].id));
  } else {
    await db.insert(userLearningProgressTable).values({
      userId, moduleId,
      completed: completed ?? false,
      score,
      timeSpentSeconds: timeSpentSeconds ?? 0,
      completedAt: passed ? new Date() : undefined,
    });
  }

  if (passed) {
    await logActivity(userId, "module_completed", moduleId, "module", { topic: mod.topic });
    await updateStreak(userId);
    await awardBadgeIfNeeded(userId, `module_${moduleId}`, `${mod.title} Complete`, `Completed the ${mod.title} module`);
  }

  return res.json({ success: true, passed });
});

// GET /api/learning/mastery — topic mastery scores
router.get("/mastery", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const mastery = await db.select().from(topicMasteryTable)
    .where(eq(topicMasteryTable.userId, userId))
    .orderBy(topicMasteryTable.masteryScore);
  return res.json(mastery);
});

// POST /api/learning/mastery/sync — recompute mastery from exam history
router.post("/mastery/sync", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { certificationCode } = req.body;

  const exams = await db.select().from(examAttemptsTable)
    .where(certificationCode ? eq(examAttemptsTable.certificationCode, certificationCode) : sql`1=1`);

  const topics = new Set<string>();
  for (const exam of exams) {
    const breakdown = exam.topicBreakdown as any;
    if (breakdown) Object.keys(breakdown).forEach(t => topics.add(t));
  }

  for (const topic of topics) {
    const certCode = certificationCode || exams.find(e => {
      const b = e.topicBreakdown as any;
      return b && b[topic];
    })?.certificationCode || "AZ-900";
    await recomputeTopicMastery(userId, topic, certCode);
  }

  await generateRecommendations(userId);
  return res.json({ synced: topics.size });
});

// POST /api/learning/quiz — submit a topic quiz
router.post("/quiz", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { moduleId, topic, certificationCode, score, correctCount, totalCount, questionResults } = req.body;

  const passed = score >= 80;
  const [attempt] = await db.insert(quizAttemptsTable).values({
    userId, moduleId, topic, certificationCode,
    score, correctCount, totalCount, passed,
    questionResults: questionResults ?? [],
  }).returning();

  await logActivity(userId, "quiz_taken", attempt.id, "quiz", { topic, score, passed });
  await recomputeTopicMastery(userId, topic, certificationCode);
  await generateRecommendations(userId);
  await updateStreak(userId);

  if (passed) {
    await awardBadgeIfNeeded(userId, `quiz_pass_${topic.toLowerCase().replace(/\s/g, "_")}`,
      `${topic} Quiz Passed`, `Passed the ${topic} topic quiz`);
  }

  return res.json({ attempt, passed });
});

// GET /api/learning/recommendations — get user recommendations
router.get("/recommendations", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const recs = await db.select().from(recommendationsTable)
    .where(and(eq(recommendationsTable.userId, userId), eq(recommendationsTable.dismissed, false)))
    .orderBy(desc(recommendationsTable.priority));
  return res.json(recs);
});

// POST /api/learning/recommendations/:id/dismiss
router.post("/recommendations/:id/dismiss", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  await db.update(recommendationsTable).set({ dismissed: true })
    .where(and(eq(recommendationsTable.id, req.params.id), eq(recommendationsTable.userId, userId)));
  return res.json({ success: true });
});

// GET /api/learning/activity — learning history timeline
router.get("/activity", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const activity = await db.select().from(learningActivityTable)
    .where(eq(learningActivityTable.userId, userId))
    .orderBy(desc(learningActivityTable.createdAt))
    .limit(50);
  return res.json(activity);
});

// GET /api/learning/gamification — streaks & badges
router.get("/gamification", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const [streak] = await db.select().from(userStreaksTable).where(eq(userStreaksTable.userId, userId)).limit(1);
  const badges = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, userId)).orderBy(desc(userBadgesTable.earnedAt));
  return res.json({ streak: streak ?? null, badges });
});

// POST /api/learning/activity — log an event (lesson_opened etc.)
router.post("/activity", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { eventType, entityId, entityType, metadata } = req.body;
  await logActivity(userId, eventType, entityId, entityType, metadata);
  await updateStreak(userId);
  return res.json({ success: true });
});

// GET /api/learning/weak-topics — weak topics with action queue
router.get("/weak-topics", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const mastery = await db.select().from(topicMasteryTable)
    .where(eq(topicMasteryTable.userId, userId))
    .orderBy(topicMasteryTable.masteryScore);

  const weak = await Promise.all(
    mastery.filter(m => m.masteryScore < 70).map(async (m) => {
      const now = Date.now();
      const lastAttempt = m.lastAttemptAt ? new Date(m.lastAttemptAt).getTime() : 0;
      const daysSince = (now - lastAttempt) / (1000 * 3600 * 24);
      const recencyWeight = Math.min(daysSince / 30, 1) * 0.3;
      const weakScore = (1 - m.masteryScore / 100) + recencyWeight;

      const [linkedModule] = await db.select().from(learningModulesTable)
        .where(eq(learningModulesTable.topic, m.topic)).limit(1);

      return {
        topic: m.topic,
        certificationCode: m.certificationCode,
        masteryScore: m.masteryScore,
        correctAnswers: m.correctAnswers,
        totalAttempts: m.totalAttempts,
        priorityScore: Math.round(weakScore * 100),
        daysSinceLastAttempt: Math.round(daysSince),
        linkedModuleId: linkedModule?.id ?? null,
        linkedModuleTitle: linkedModule?.title ?? null,
      };
    })
  );

  return res.json(weak.sort((a, b) => b.priorityScore - a.priorityScore));
});

export default router;
