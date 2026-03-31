import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, examSessionsTable, examAttemptsTable } from "@workspace/db/schema";
import { count } from "drizzle-orm";
import { requireAdmin } from "./auth";
import os from "os";

const router = Router();

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(usersTable);
    const [sessionCount] = await db.select({ count: count() }).from(examSessionsTable);
    const [attemptCount] = await db.select({ count: count() }).from(examAttemptsTable);

    const systemInfo = {
      platform: os.platform(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100,
        free: Math.round(os.freemem() / 1024 / 1024 / 1024 * 100) / 100,
      },
      uptime: os.uptime(),
    };

    const aiConfig = {
      model: "gemini-2.5-flash-lite",
      provider: "Google Gemini",
      baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com",
    };

    const authConfig = {
      sso: process.env.KANIDM_URL ? "Kanidm (OIDC)" : "Internal JWT",
      kanidmUrl: process.env.KANIDM_URL || "N/A",
    };

    return res.json({
      counts: {
        users: Number(userCount.count),
        sessions: Number(sessionCount.count),
        attempts: Number(attemptCount.count),
      },
      system: systemInfo,
      ai: aiConfig,
      auth: authConfig,
      status: "Healthy",
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

export default router;
