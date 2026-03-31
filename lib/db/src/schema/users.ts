import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(), // Optional
  passwordHash: text("password_hash"), // Nullable for SSO users
  kanidmId: text("kanidm_id").unique(),
  role: varchar("role", { length: 50 }).notNull().default("student"), // "student" or "admin"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
