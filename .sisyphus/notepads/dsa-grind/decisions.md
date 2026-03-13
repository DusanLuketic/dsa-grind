# DSA Grind — Architectural Decisions

## [2026-03-13] Initial Architecture
- Next.js 16 + App Router
- SQLite via Prisma
- shadcn/ui (slate base, dark mode only)
- Zustand for client state (sidebar, timer)
- Vitest + Testing Library for unit tests
- Playwright for E2E tests

## Route Structure
- / → Dashboard
- /roadmap → Visual DAG
- /topic/[slug] → Problem list
- /problem/[slug] → Video + controls
- /resources → External resources
- /stats → Charts
- /session → Pomodoro
- /api/data → Export/Import

## Data Flow
- Server Components fetch data directly via Prisma
- Server Actions for mutations (updateProgress, createSession, etc.)
- Zustand for client UI state only (sidebar, timer)
- localStorage for DailyGoal (ephemeral, not in DB)
