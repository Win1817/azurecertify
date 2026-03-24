# AzureCertify AI Pro

## Overview

A production-ready Azure certification exam platform built as a pnpm monorepo with a React/Vite frontend, Express backend, and Gemini AI integration.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React + Vite + TailwindCSS + framer-motion + recharts
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Google Gemini (via Replit AI Integrations) - `gemini-2.5-flash`
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle for server)

## Features

- **3 Certifications**: AZ-900, AZ-104, AZ-305
- **Exam modes**: Practice (no timer) or Exam (timed)
- **Difficulty levels**: Easy, Medium, Hard, Mixed
- **AI question generation**: Gemini generates Azure-specific scenario questions + validates them
- **AI analysis**: Post-exam study plan, weak areas, recommendations
- **Anti-cheat**: Tab switch detection during exams
- **Question navigator**: Jump between questions, mark for review
- **Results**: Score dial, topic breakdown chart, per-question review

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/routes/
│   │       ├── certifications.ts  # GET /api/exams/certifications
│   │       ├── exams.ts           # POST /api/exams/configure, GET/POST sessions
│   │       ├── attempts.ts        # GET /api/attempts, GET /api/attempts/:id
│   │       └── ai.ts              # POST /api/ai/generate-questions, /api/ai/analyze-attempt
│   └── azure-certify/      # React + Vite frontend (previewPath: /)
│       └── src/
│           ├── pages/      # home, configure, exam, results, analysis
│           ├── components/ # layout, score-dial
│           └── hooks/      # use-exam-state (localStorage persistence)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   │   └── src/schema/
│   │       ├── exams.ts    # exam_sessions + exam_attempts tables
│   │       ├── conversations.ts
│   │       └── messages.ts
│   └── integrations-gemini-ai/  # Gemini AI client + batch utilities
└── scripts/                # Utility scripts
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/exams/certifications | List AZ-900, AZ-104, AZ-305 |
| POST | /api/exams/configure | Configure + create exam session |
| GET | /api/exams/sessions/:id | Get session with questions |
| POST | /api/exams/sessions/:id/submit | Submit answers, get results |
| GET | /api/attempts | Exam history |
| GET | /api/attempts/:id | Attempt details + AI analysis |
| POST | /api/ai/generate-questions | AI question generation + validation |
| POST | /api/ai/analyze-attempt | AI study plan generation |

## Database Schema

- `exam_sessions`: sessionId, certificationCode, mode, difficulty, questions (JSON), timeLimitMinutes
- `exam_attempts`: id, sessionId, score, passed, answers, questionResults, topicBreakdown, aiAnalysis

## Key Notes

- Run codegen after OpenAPI changes: `pnpm --filter @workspace/api-spec run codegen`
- Database push: `pnpm --filter @workspace/db run push`
- The `@google/genai` package is bundled in esbuild (removed from external list)
- Scores are 0-100 percentage (not 0-1000 scale)
- Passing score is 70% for all certifications
- AI analysis is stored in exam_attempts.aiAnalysis JSON column
