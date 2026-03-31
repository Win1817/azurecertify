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
    return next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden: Admins only" });
      return;
    }
    return next();
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

    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials or account must sign in via SSO" });
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

// Kanidm SSO Routes
const KANIDM_URL = process.env.KANIDM_URL || "https://idm.example.com";
const KANIDM_CLIENT_ID = process.env.KANIDM_CLIENT_ID || "azure-certify-pro";
const KANIDM_CLIENT_SECRET = process.env.KANIDM_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/api/auth/kanidm/callback";

router.get("/kanidm/login", (req, res) => {
  const authUrl = `${KANIDM_URL}/ui/oauth2/authorize?client_id=${KANIDM_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid+email+profile`;
  res.redirect(authUrl);
});

router.get("/kanidm/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error("No authorization code provided");

    // Exchange code for token
    const tokenRes = await fetch(`${KANIDM_URL}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: REDIRECT_URI,
        client_id: KANIDM_CLIENT_ID,
        client_secret: KANIDM_CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) throw new Error("Failed to exchange token");
    const tokens = (await tokenRes.json()) as { access_token: string };

    // Get user info
    const userRes = await fetch(`${KANIDM_URL}/oauth2/openid/${KANIDM_CLIENT_ID}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) throw new Error("Failed to fetch userinfo");
    const profile = (await userRes.json()) as { 
      sub: string; 
      email: string; 
      name?: string; 
      preferred_username?: string 
    };

    // Find or create user
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, profile.email)).limit(1);
    let user = existing;

    if (!user) {
      const [newUser] = await db.insert(usersTable).values({
        name: profile.name || profile.preferred_username || "SSO User",
        email: profile.email,
        kanidmId: profile.sub,
        role: "student",
      }).returning();
      user = newUser;
    } else if (!user.kanidmId) {
      const [updated] = await db.update(usersTable)
        .set({ kanidmId: profile.sub })
        .where(eq(usersTable.id, user.id))
        .returning();
      user = updated;
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: "7d"
    });

    // Handle redirect back to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.send(`
      <script>
        localStorage.setItem("azure_token", "${token}");
        localStorage.setItem("azure_user", JSON.stringify(${JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role })}));
        window.location.href = "${user.role === 'admin' ? '/admin' : '/dashboard'}";
      </script>
    `);
  } catch (err: any) {
    req.log.error(err);
    res.status(500).send("SSO Login failed: " + err.message);
  }
});

export default router;
