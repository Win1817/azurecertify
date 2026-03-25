import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const router = Router();
export const JWT_SECRET = process.env.JWT_SECRET || "azurecertify-super-secret-key-12345";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
  });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }

    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      role: "student"
    }).returning();

    const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, {
      expiresIn: "7d"
    });

    return res.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, token });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to register" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: "7d"
    });

    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to login" });
  }
});

// Me (Get current user)
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load user profile" });
  }
});

// Basic user management placeholders for admin dashboard
router.get("/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allUsers = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt
    }).from(usersTable);
    return res.json({ users: allUsers });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
