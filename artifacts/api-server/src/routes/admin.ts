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

// OIDC Configuration - GET current config (values redacted for security)
router.get("/oidc", requireAdmin, async (req, res) => {
  return res.json({
    kanidmUrl: process.env.KANIDM_URL || "",
    clientId: process.env.KANIDM_CLIENT_ID || "",
    clientSecret: process.env.KANIDM_CLIENT_SECRET ? "********" : "",
    redirectUri: process.env.REDIRECT_URI || "",
    scopes: process.env.KANIDM_SCOPES || "openid email profile",
    frontendUrl: process.env.FRONTEND_URL || "",
    enabled: !!process.env.KANIDM_URL && !!process.env.KANIDM_CLIENT_ID && !!process.env.KANIDM_CLIENT_SECRET,
    tlsSkipVerify: process.env.KANIDM_TLS_SKIP_VERIFY === "true",
  });
});

// OIDC Configuration - Test connection
router.post("/oidc/test", requireAdmin, async (req, res) => {
  const kanidmUrl = process.env.KANIDM_URL;
  if (!kanidmUrl) {
    return res.status(400).json({ success: false, message: "KANIDM_URL is not configured" });
  }
  try {
    // Support self-signed TLS for internal Kanidm instances
    let fetchOptions: any = { signal: AbortSignal.timeout(5000) };
    if (process.env.KANIDM_TLS_SKIP_VERIFY === "true") {
      try {
        const { Agent } = await import("undici");
        fetchOptions.dispatcher = new Agent({ connect: { rejectUnauthorized: false } });
      } catch {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      }
    }
    const response = await fetch(
      `${kanidmUrl}/oauth2/openid/${process.env.KANIDM_CLIENT_ID || "azure-certify-pro"}/.well-known/openid-configuration`,
      fetchOptions
    );
    if (!response.ok) throw new Error(`OIDC discovery returned ${response.status}`);
    const discovery = await response.json() as Record<string, unknown>;
    return res.json({
      success: true,
      message: "OIDC provider reachable",
      issuer: discovery.issuer,
      authEndpoint: discovery.authorization_endpoint,
    });
  } catch (err: any) {
    return res.json({ success: false, message: err.message || "Connection failed" });
  }
});
