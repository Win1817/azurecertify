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
    const existingAdmins = await db.select().from(usersTable).where(eq(usersTable.email, "admin@azurecertify.com")).limit(1);
    if (existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash("Admin", 10);
      await db.insert(usersTable).values({
        name: "Admin",
        email: "admin@azurecertify.com",
        passwordHash,
        role: "admin"
      });
      logger.info("Default Admin user seeded successfully");
    }
  } catch (seedErr) {
    logger.error({ err: seedErr }, "Failed to seed admin user");
  }

  logger.info({ port }, "Server listening");
});
