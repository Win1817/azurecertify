# ☁️ AzureCertify AI Pro

> Master Microsoft Azure Certifications with AI-Powered Exams, Personalized Feedback, and Ezzy — your Azure study companion.

---

## 🚀 Overview

**AzureCertify AI Pro** is a production-ready Azure certification preparation platform built as a **pnpm monorepo**. It features AI-generated exams powered by Google Gemini, real-time feedback, an intelligent chatbot (Ezzy), and a comprehensive admin dashboard — all wrapped in a stunning Azure Portal-inspired UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | pnpm workspaces |
| **Frontend** | React 19 + Vite + TailwindCSS + Framer Motion + Recharts |
| **Backend** | Express 5 (ESM) |
| **Database** | PostgreSQL + Drizzle ORM |
| **AI Engine** | Google Gemini (`gemini-2.5-flash-lite`) via `@google/genai` |
| **Auth** | JWT (bcryptjs) — Keycloak-ready architecture |
| **Validation** | Zod (v4) + drizzle-zod |
| **API Codegen** | Orval (from OpenAPI spec) |
| **Build** | esbuild (ESM bundle for server) |
| **Node.js** | v24+ |

---

## ✨ Features

### 🎓 Certification Exams
- **9 Azure Certifications**: AZ-900, AZ-104, AZ-204, AZ-500, AZ-305, AZ-400, and more
- **Exam Modes**: Practice (untimed) or Simulation (timed)
- **Difficulty Levels**: Easy, Medium, Hard, Mixed
- **AI Question Generation**: Gemini creates Azure-specific scenario questions and validates them
- **Anti-Cheat**: Tab switch detection during exams
- **Question Navigator**: Jump between questions, mark for review

### 🤖 AI-Powered Features
- **Ezzy AI Chatbot**: Context-aware study assistant with Azure expertise
- **AI Hints**: Per-question intelligent hint system
- **Post-Exam Analysis**: AI-generated study plans, weak area identification, personalized recommendations
- **AI Question Validation**: Confidence scoring and automated review

### 📚 Learning Hub
- **Progress Overview**: Certification readiness scores, pass rates, average scores
- **Exam History**: Full attempt history with filters, sorting, and detailed review
- **Weak Topics**: AI-detected focus areas with proficiency indicators
- **Ezzy Recommendations**: Personalized suggestions and learning paths
- **Curated Resources**: Links to Microsoft Learn modules

### 🔐 Authentication & RBAC
- **Internal Auth**: JWT-based with bcrypt password hashing
- **User Roles**: `student` and `admin`
- **Registration & Login**: Email-based authentication
- **Default Admin**: `admin@azurecertify.com` / `Admin` (seeded on first startup)
- **Keycloak-Ready**: Modular `AuthService` design for future migration

### 🧑‍💼 Admin Dashboard (`/admin`)
- **RBAC Protected**: Admin-only access with 403 redirect
- **User Management**: View, search, and manage all users
- **Exams Management**: Create, edit, and delete exams *(coming soon)*
- **AI Questions**: Review and approve AI-generated questions *(coming soon)*
- **Feedback Management**: Track and respond to user feedback *(coming soon)*
- **Certificates**: Issue and manage credentials *(coming soon)*
- **System Analytics**: User growth, pass rates, AI performance *(coming soon)*

### 🏠 Landing Page
- Professional branded entry page with Azure aesthetics
- Hero section with dynamic background
- Feature showcase, certification cards, and CTA buttons
- Footer with credits and social links

---

## 📁 Project Structure

```text
azurecertify/
├── artifacts/
│   ├── api-server/              # Express API server
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── auth.ts      # /api/auth (login, register, me, users)
│   │       │   ├── exams.ts     # /api/exams (configure, sessions)
│   │       │   ├── attempts.ts  # /api/attempts (history)
│   │       │   └── ai.ts        # /api/ai (generate, analyze, hints)
│   │       └── index.ts         # Server entry + admin seeding
│   └── azure-certify/           # React + Vite frontend
│       └── src/
│           ├── pages/           # landing, login, register, admin,
│           │                    # learning-hub, home, configure, exam,
│           │                    # results, analysis, history, settings
│           ├── components/      # layout, score-dial, ezzy-chat
│           └── hooks/           # use-exam-state, use-toast
├── lib/
│   ├── api-spec/                # OpenAPI spec + Orval codegen
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas
│   ├── db/                      # Drizzle ORM schema + connection
│   │   └── src/schema/
│   │       ├── users.ts         # users table (name, email, role)
│   │       ├── exams.ts         # exam_sessions + exam_attempts
│   │       ├── conversations.ts # Ezzy conversations
│   │       └── messages.ts      # Ezzy messages
│   └── integrations-gemini-ai/  # Gemini AI client + utilities
└── .env                         # Environment variables
```

---

## 🔌 API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new student account |
| POST | `/api/auth/login` | — | Login with email + password |
| GET | `/api/auth/me` | Bearer | Get current user profile |
| GET | `/api/auth/users` | Admin | List all users (admin only) |
| GET | `/api/exams/certifications` | — | List all certifications |
| POST | `/api/exams/configure` | — | Configure + create exam session |
| GET | `/api/exams/sessions/:id` | — | Get session with questions |
| POST | `/api/exams/sessions/:id/submit` | — | Submit answers, get results |
| GET | `/api/attempts` | — | Get exam history |
| GET | `/api/attempts/:id` | — | Get attempt details + AI analysis |
| POST | `/api/ai/generate-questions` | — | AI question generation + validation |
| POST | `/api/ai/analyze-attempt` | — | AI study plan generation |

---

## 🗄️ Database Schema

| Table | Key Columns |
|-------|-------------|
| `users` | id, name, email, password_hash, role (student/admin), created_at |
| `exam_sessions` | id, certification_code, mode, difficulty, questions (JSON), time_limit |
| `exam_attempts` | id, session_id, score, passed, answers, topic_breakdown, ai_analysis |
| `conversations` | id, title, context |
| `messages` | id, conversation_id, role, content |

---

## ⚡ Getting Started

### Prerequisites
- Node.js v24+
- pnpm
- PostgreSQL

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/azurecertify
AI_INTEGRATIONS_GEMINI_API_KEY=your-gemini-api-key
PORT=5000
JWT_SECRET=your-jwt-secret
```

### 3. Push Database Schema
```bash
pnpm --filter @workspace/db run push
```

### 4. Build & Start API Server
```bash
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

### 5. Start Frontend (Dev)
```bash
pnpm --filter @workspace/azure-certify run dev
```

### 6. Access the Platform
- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Admin**: http://localhost:3000/admin
- **Default Admin**: `admin@azurecertify.com` / `Admin`

---

## 📝 Key Notes

- Run codegen after OpenAPI changes: `pnpm --filter @workspace/api-spec run codegen`
- Database push: `pnpm --filter @workspace/db run push`
- Scores are 0–100 percentage (passing = 70%)
- AI analysis is stored in `exam_attempts.aiAnalysis` JSON column
- Auth system is designed for seamless Keycloak migration

---

## 🗺️ Roadmap

- [ ] Keycloak SSO integration
- [ ] Admin exam/question CRUD
- [ ] Certificate generation (PDF)
- [ ] System analytics dashboard
- [ ] Microsoft Learn deep integration
- [ ] Mobile-responsive exam interface

---

## 📄 License

This project is proprietary. All rights reserved.
