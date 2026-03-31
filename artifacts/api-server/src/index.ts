import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

import { db } from "@workspace/db";
import { seedLearningPaths } from "./routes/learning";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

app.listen(port, "0.0.0.0", async (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  // Seed default admin
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";
    const existingAdmins = await db.select().from(usersTable).where(eq(usersTable.username, "admin")).limit(1);
    if (existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await db.insert(usersTable).values({
        name: "Default Admin",
        username: "admin",
        email: "admin@azurecertify.com",
        passwordHash,
        role: "admin"
      });
      logger.info(`Default Admin (admin/${adminPassword === 'admin' ? 'admin' : '********'}) user seeded successfully`);
    // Seed learning paths
    try { await seedLearningPaths(); logger.info("Learning paths seeded"); } catch (e) { logger.warn("Learning paths seed skipped"); }
    }
  } catch (seedErr) {
    logger.error({ err: seedErr }, "Failed to seed admin user");
  }

  logger.info({ port }, "Server listening");
});
