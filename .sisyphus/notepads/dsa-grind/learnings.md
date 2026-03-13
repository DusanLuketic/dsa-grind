# DSA Grind — Learnings

## Project Context
- Greenfield Next.js 16 project — empty directory (only .claude/, docs/, .sisyphus/)
- Platform: Windows (win32) — use Windows-compatible commands
- Design spec: docs/superpowers/specs/2026-03-13-dsa-grind-design.md

## Key Technical Constraints
- Next.js 16: route params are `Promise<>` type — `const { slug } = await params`
- React 19.2: `useActionState` replaces `useFormState`
- Prisma + SQLite: NO native enums — use String type
- Prisma v6+: uses `prisma.config.ts` for seed config (NOT package.json)
- Tiptap: `immediatelyRender: false` MANDATORY for Next.js SSR
- Zustand: Timestamp-based elapsed tracking — NOT tick-increment
- No `ts-node` — use `tsx` for all TypeScript execution
- No `requestAnimationFrame` for timers — use `setInterval(1000)`
- Dark mode ONLY — background #0a0a0f — NO theme toggle

## Wave Execution Order
- Task 1 FIRST (project scaffold) — then Tasks 2, 3, 4, 5 in parallel
- Wave 2 (Tasks 6-11) after Wave 1 complete
- Wave 3 (Tasks 12-19) — 8 parallel after Wave 2
- Wave 4 (Tasks 20-23) — 4 parallel after Wave 3
- Wave 5 (Tasks 24-25) — 2 parallel after Wave 4
- Final Wave (F1-F4) — 4 parallel after Wave 5

## TDD Pattern
- RED: Write failing tests FIRST
- GREEN: Implement minimal code to pass
- REFACTOR: Clean up
- Never skip RED phase

## NeetCode Data
- Official JSON: https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json
- Filter by `neetcode150: true` (field name is `neetcode150` NOT `leetcode150`)
- Save snapshot to prisma/data/neetcode150.json (committed)
- Seed reads local file only — NOT network at runtime

## Roadmap Edges (from constants.ts)
- arrays-hashing → [two-pointers, stack]
- two-pointers → [sliding-window]
- stack → [binary-search]
- sliding-window → [linked-list], binary-search → [linked-list]
- linked-list → [trees]
- trees → [tries, heap-priority-queue, backtracking]
- tries → [graphs], heap-priority-queue → [graphs], backtracking → [graphs]
- graphs → [advanced-graphs, 1-d-dynamic-programming]
- 1-d-dynamic-programming → [2-d-dynamic-programming]
- 2-d-dynamic-programming → [greedy]
- greedy → [intervals]
- intervals → [math-geometry]
- math-geometry → [bit-manipulation]

## [2026-03-13] Task 1: Scaffold Complete
- Next.js version: 16.1.6
- Tailwind version: v4 (4.2.1)
- Turbopack: enabled (default)
- Create-next-app src-dir: yes
- React version: 19.2.3
- TypeScript version: 5.9.3
- Notes: 
  - create-next-app rejects non-empty directories with existing .claude/, .sisyphus/, .superpowers/ folders
  - Solution: Create in temp directory, copy files to project directory
  - Git initialized successfully with custom .gitignore
  - All production and dev dependencies installed
  - next.config.ts configured with YouTube CSP headers and image remotePatterns
  - npm run dev starts successfully in 7 seconds
  - Dev server ready at http://localhost:3000
  - Prisma installed: v7.5.0 (note: plan says v6+, this is v7 — check prisma.config.ts API)
  - Tiptap installed: v3.20.1 (plan references v2 docs — check for API changes)
  - Tailwind v4: Task 3 MUST use CSS @theme directive in globals.css (NOT tailwind.config.ts)
  - Zustand: 5.0.11
  - Recharts: 3.8.0
  - react-activity-calendar: 3.1.1

## [2026-03-13] Task 2: Prisma Schema Complete

### Completion Summary
- All 5 models created: Topic, Problem, Progress, StudySession, Resource
- SQLite database created via `npx prisma db push`
- Prisma v7.5.0 requires config in prisma.config.ts (not in schema.prisma)
- Database file created at root level (./dev.db) per DATABASE_URL

### Key Learnings
- **Prisma v7 Configuration**: URL must be in prisma.config.ts datasource config, NOT in schema.prisma
- **SQLite Limitations**: No native enum support - use String types with comments
- **ID Strategy**: Topic uses String @id (slug-based), all others use Int @id with autoincrement
- **Relationships**: Proper @relation fields with foreign keys and indexes for performance
- **Timestamps**: Progress model includes createdAt/updatedAt for stats tracking

### Design Decisions
- Topic @id is String (slug-based like "arrays-hashing")
- Problem, Progress, StudySession, Resource all use autoincrement Int @id
- All enum-like fields (difficulty, status, type) use String with comment documentation
- Optional topicId on StudySession and Resource for flexibility
- Indexes on topicId and date fields for query optimization

### Files Created/Modified
- prisma/schema.prisma: Complete 5-model schema
- .env: DATABASE_URL="file:./dev.db"
- prisma.config.ts: Already configured correctly
- dev.db: SQLite database file (created at root)
- .sisyphus/evidence/task-2-schema.txt: Complete evidence

### Next Steps
- Task 3: Seed database with initial data
- Task 4: Create API routes
- Task 5: Build frontend components
