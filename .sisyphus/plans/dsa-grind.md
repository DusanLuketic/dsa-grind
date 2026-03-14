# DSA Grind — Full Build Plan

## TL;DR

> **Quick Summary**: Build a complete free NeetCode Pro alternative from scratch — a Next.js 16 web app with SQLite/Prisma backend, tracking progress through 150 DSA problems with embedded video explanations, visual roadmap, rich notes editor, Pomodoro timer, and activity statistics.
> 
> **Deliverables**:
> - Fully functional 7-page Next.js application (Dashboard, Roadmap, Topic, Problem, Resources, Stats, Session)
> - SQLite database seeded with 18 topics, 150 NeetCode problems (with YouTube video IDs), 17 resources
> - TDD test suite (Vitest unit/integration + Playwright E2E)
> - Dark-mode-only UI with shadcn/ui component library
> 
> **Estimated Effort**: XL
> **Parallel Execution**: YES — 6 waves + final verification
> **Critical Path**: Scaffold → Schema/Seed → Server Actions → Pages → Integration → E2E

---

## Context

### Original Request
Build "DSA Grind" — a free, self-hosted Next.js web application for learning data structures and algorithms. Replace NeetCode Pro with a free alternative that tracks progress through the NeetCode 150 problem set, embeds video explanations, and organizes study with a visual roadmap. Full design spec at `docs/superpowers/specs/2026-03-13-dsa-grind-design.md`.

### Interview Summary
**Key Discussions**:
- **Testing**: TDD (Red-Green-Refactor) — write failing tests first, implement to green, refactor
- **Seed Data**: Best-effort exact NeetCode video IDs — official JSON source found at `https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json`
- **Bootstrap**: Full bootstrap from empty directory (git init, create-next-app, all config)
- **Scope**: Full scope in single plan — all 7 pages, all components, all data layer

**Research Findings**:
- **Next.js 16**: Turbopack default, React 19.2, `useActionState` replaces `useFormState`, route params are `Promise<>` type
- **NeetCode JSON**: Official GitHub JSON has all 150 problems with exact YouTube VIDEO_IDs. Filter by `neetcode150: true`
- **Prisma + SQLite**: Enums enforced at ORM level. Singleton mandatory. `createMany` + `skipDuplicates` for idempotent seeding
- **Tiptap**: `immediatelyRender: false` mandatory for Next.js hydration safety
- **Zustand**: Timestamp-based elapsed tracking for timer (not tick-increment). Hydration guard for SSR
- **shadcn/ui**: Interactive components (Dialog, DropdownMenu, Tabs, Sheet, Slider, Tooltip, ScrollArea) need "use client"

### Metis Review
**Identified Gaps (addressed)**:
- **Tailwind v3 vs v4**: create-next-app may install Tailwind v4 (CSS-based `@theme` config instead of `tailwind.config.ts`). Plan includes version check + adaptive config.
- **Prisma v6+**: Uses `prisma.config.ts` for seed config, not `package.json`. Plan uses `tsx` (not `ts-node`).
- **Progress model missing timestamps**: Added `createdAt` and `updatedAt` to Progress model for stats/review tracking.
- **Empty states not defined**: Every page task includes empty state implementation.
- **YouTube CSP**: `next.config.ts` must allow YouTube iframe sources.
- **`react-activity-calendar` React 19 compat**: Plan includes compatibility check + fallback strategy.
- **NeetCode JSON stability**: Fetch once, commit snapshot to `prisma/data/neetcode150.json`. Seed reads local file.
- **Timer drift**: Timestamp-based calculation (`Date.now() - startedAt`) instead of tick-increment.

---

## Work Objectives

### Core Objective
Build a complete, functional DSA study web application from an empty directory to a fully working dark-mode Next.js app with 7 pages, SQLite persistence, 150 seeded problems, and comprehensive TDD test coverage.

### Concrete Deliverables
- 7 routable pages with full UI and interactivity
- Prisma schema with 5 models (Topic, Problem, Progress, StudySession, Resource)
- Seed data: 18 topics, 150 problems with LeetCode/YouTube URLs, 17 resources
- Server Actions for all data mutations
- Export/Import API route (`/api/data`)
- Vitest test suite for actions, hooks, and client components
- Playwright E2E test suite for all pages

### Definition of Done
- [ ] `npx tsc --noEmit` — zero type errors
- [ ] `npm run lint` — passes
- [ ] `npm run build` — production build succeeds
- [ ] `npm run test -- --run` — all Vitest tests pass
- [ ] `npx playwright test` — all E2E tests pass
- [ ] Database seeded with exactly 18 topics, 150 problems, 17 resources

### Must Have
- All 7 pages functional with real data from SQLite
- YouTube video embeds on Problem page
- Tiptap WYSIWYG notes editor with auto-save
- Pomodoro timer with audio notifications
- Roadmap DAG visualization with SVG connections
- Optimistic updates for status/confidence changes
- Export/Import JSON functionality
- Dark mode only (background #0a0a0f)
- Responsive layout (desktop sidebar, mobile sheet/drawer)
- TDD test coverage for all server actions, hooks, and interactive components

### Must NOT Have (Guardrails)
- No authentication, multi-user, or login page
- No theme toggle — dark mode ONLY
- No additional REST API routes beyond `/api/data`
- No Tiptap extensions beyond StarterKit + Placeholder (5 toolbar buttons: bold, italic, code, bullet list, heading)
- No settings page (Pomodoro config is inline on Session page)
- No PWA/service worker, no i18n, no deployment config
- No hand-typed seed data — MUST generate from official NeetCode JSON
- No `ts-node` anywhere — use `tsx` for all TypeScript execution
- No `requestAnimationFrame` for timers (throttled in background tabs)
- No code syntax highlighting in Tiptap editor
- No video playback tracking or timestamps
- No weekly/monthly goals — daily goal is single number in localStorage
- No date range pickers on Stats page
- No CSV/PDF export — JSON only
- No additional chart types beyond: line, pie/donut, activity heatmap

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (greenfield — must set up)
- **Automated tests**: YES — TDD (Red-Green-Refactor)
- **Frameworks**: Vitest + @testing-library/react (unit/integration), Playwright (E2E)
- **TDD Cycle**: Each feature task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### Test Split (from Metis)
- **Vitest**: Server Actions (mocked Prisma), hooks (useTimer, useKeyboardShortcuts), client components (render + interaction), utilities (constants, utils)
- **Playwright**: Page-level integration, Server Component rendering, cross-page navigation, empty states, interactive flows
- **NOT Vitest**: Async Server Components (RSCs) — these MUST use Playwright

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright — navigate, interact, assert DOM, screenshot
- **Server Actions**: Vitest — mock Prisma, call action, assert DB calls
- **Hooks**: Vitest — renderHook, trigger state changes, assert values
- **API Routes**: Bash (curl) — send requests, assert status + response
- **CLI/Build**: Bash — run commands, check exit codes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — all start immediately, 5 parallel):
├── Task 1: Project scaffold + git init + deps + next.config.ts [quick]
├── Task 2: Prisma schema + migration + .env [quick]
├── Task 3: shadcn/ui init + all 12 components + dark theme CSS [visual-engineering]
├── Task 4: Root layout + fonts + metadata [quick]
└── Task 5: Core lib files (constants, utils, db) + test infrastructure [quick]

Wave 2 (Data Layer + Core Components — after Wave 1, 6 parallel):
├── Task 6: NeetCode JSON snapshot + seed script + verification [deep]
├── Task 7: Server actions: progress + sessions + stats (TDD) [unspecified-high]
├── Task 8: Zustand store + useTimer hook (TDD) [unspecified-high]
├── Task 9: Sidebar component (TDD) [visual-engineering]
├── Task 10: Breadcrumbs + error toast pattern (TDD) [visual-engineering]
└── Task 11: useKeyboardShortcuts hook (TDD) [quick]

Wave 3 (All Pages — after Wave 2, 8 parallel, MAX throughput):
├── Task 12: Dashboard page + 4 widgets (TDD) [visual-engineering]
├── Task 13: Roadmap page + DAG visualization (TDD) [deep]
├── Task 14: Topic page + ProblemTable + filters (TDD) [visual-engineering]
├── Task 15: Problem page: layout + VideoPlayer + ProblemInfo (TDD) [visual-engineering]
├── Task 16: Problem page: StatusSelector + ConfidenceSlider + NotesEditor + ProblemTimer (TDD) [deep]
├── Task 17: Resources page (TDD) [quick]
├── Task 18: Stats page + charts (TDD) [visual-engineering]
└── Task 19: Session page + Pomodoro + audio (TDD) [deep]

Wave 4 (Integration — after Wave 3, 4 parallel):
├── Task 20: Export/Import API route (TDD) [quick]
├── Task 21: Optimistic updates + timer persistence + save-on-solve [unspecified-high]
├── Task 22: Keyboard shortcuts wiring across pages [quick]
└── Task 23: Empty states + edge cases audit [unspecified-high]

Wave 5 (E2E + Final Gate — after Wave 4, 2 parallel):
├── Task 24: Playwright E2E full suite (all 7 pages) [unspecified-high]
└── Task 25: Build gate verification (tsc + lint + build + test) [quick]

Wave FINAL (Verification — after ALL, 4 parallel):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Real manual QA [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: T1 → T2 → T6 → T7 → T12/T15 → T21 → T24 → F1-F4
Parallel Speedup: ~75% faster than sequential
Max Concurrent: 8 (Wave 3)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 2-5 | 1 |
| 2 | 1 | 6, 7 | 1 |
| 3 | 1 | 9, 10, 12-19 | 1 |
| 4 | 1 | 9, 10, 12-19 | 1 |
| 5 | 1 | 6-11 | 1 |
| 6 | 2, 5 | 7, 12-19 | 2 |
| 7 | 2, 5 | 12, 14-16, 18-21 | 2 |
| 8 | 5 | 16, 19, 21 | 2 |
| 9 | 3, 4 | 12-19 | 2 |
| 10 | 3, 4 | 12-19 | 2 |
| 11 | 5 | 22 | 2 |
| 12-19 | 6-10 | 20-23 | 3 |
| 20-23 | 12-19 | 24, 25 | 4 |
| 24, 25 | 20-23 | F1-F4 | 5 |
| F1-F4 | 24, 25 | — | FINAL |

### Agent Dispatch Summary

| Wave | Tasks | Categories |
|------|-------|------------|
| 1 | 5 | T1→`quick`, T2→`quick`, T3→`visual-engineering`, T4→`quick`, T5→`quick` |
| 2 | 6 | T6→`deep`, T7→`unspecified-high`, T8→`unspecified-high`, T9→`visual-engineering`, T10→`visual-engineering`, T11→`quick` |
| 3 | 8 | T12→`visual-engineering`, T13→`deep`, T14→`visual-engineering`, T15→`visual-engineering`, T16→`deep`, T17→`quick`, T18→`visual-engineering`, T19→`deep` |
| 4 | 4 | T20→`quick`, T21→`unspecified-high`, T22→`quick`, T23→`unspecified-high` |
| 5 | 2 | T24→`unspecified-high`, T25→`quick` |
| FINAL | 4 | F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep` |

---

## TODOs

### Wave 1: Foundation (5 tasks — all start immediately)

- [x] 1. Project Scaffold + Git Init + Dependencies + next.config.ts

  **What to do**:
  - Run `git init` in the project root
  - Create `.gitignore` (node_modules, .next, prisma/dev.db, .env)
  - Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (accept defaults for Turbopack)
  - Check `package.json` for exact Next.js version (expect 16.x) and Tailwind version (v3 vs v4)
  - Install production deps: `npm install prisma @prisma/client zustand recharts react-activity-calendar @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder`
  - Install dev deps: `npm install -D tsx vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react @playwright/test`
  - Configure `next.config.ts` (NOT `.js`):
    - Add YouTube iframe allowlist: `images.remotePatterns` for `youtube.com`, `youtube-nocookie.com`
    - Add `async headers()` returning `Content-Security-Policy` allowing `frame-src https://www.youtube.com https://www.youtube-nocookie.com`
    - Enable Turbopack file system caching if available
  - Verify `npm run dev` starts successfully
  - Record exact Tailwind version (v3 vs v4) and Next.js version in a comment at top of `next.config.ts`

  **Must NOT do**:
  - Do NOT install `ts-node` — use `tsx` for all TypeScript execution
  - Do NOT add auth libraries, PWA, or i18n packages
  - Do NOT create any src/ files beyond what create-next-app generates

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Scaffolding commands with no complex logic
  - **Skills**: []
    - No specialized skills needed for npm/git commands
  - **Skills Evaluated but Omitted**:
    - `git-master`: Overkill for simple `git init`

  **Parallelization**:
  - **Can Run In Parallel**: YES (start immediately)
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 2, 3, 4, 5 (all Wave 1 tasks need project to exist)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:349-363` — Dependencies section listing all production and dev packages

  **External References**:
  - Next.js 16 create-next-app: `https://nextjs.org/docs/getting-started/installation`
  - next.config.ts headers: `https://nextjs.org/docs/app/api-reference/config/next-config-js/headers`

  **WHY Each Reference Matters**:
  - The design spec dependencies list is the authoritative source for what to install — follow it exactly
  - next.config.ts headers docs show exact syntax for CSP/iframe configuration

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Project scaffolded and dev server starts
    Tool: Bash
    Preconditions: Empty directory with only .claude/, docs/, .sisyphus/
    Steps:
      1. Run `git status` — verify git repo initialized
      2. Run `cat package.json | node -e "const p=require('fs').readFileSync(0,'utf8');const j=JSON.parse(p);console.log(j.dependencies.next)"` — verify Next.js version
      3. Run `npm run dev &` then `sleep 5 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000` — expect 200
      4. Kill dev server
    Expected Result: Git initialized, Next.js 16.x installed, dev server returns 200
    Failure Indicators: npm install fails, dev server crashes, missing dependencies
    Evidence: .sisyphus/evidence/task-1-scaffold-dev-server.txt

  Scenario: next.config.ts has YouTube CSP headers
    Tool: Bash
    Preconditions: next.config.ts exists
    Steps:
      1. Run `grep -c "youtube" src/../next.config.ts || grep -c "youtube" next.config.ts` — expect match
      2. Run `grep -c "frame-src" src/../next.config.ts || grep -c "frame-src" next.config.ts` — expect match
    Expected Result: next.config.ts contains YouTube domain references and frame-src CSP
    Failure Indicators: No YouTube references in config
    Evidence: .sisyphus/evidence/task-1-youtube-csp.txt
  ```

  **Commit**: YES
  - Message: `chore: scaffold Next.js project with all dependencies`
  - Files: package.json, next.config.ts, .gitignore, tsconfig.json, all scaffold files
  - Pre-commit: `npm run dev` (verify starts)

- [x] 2. Prisma Schema + Migration + .env

  **What to do**:
  - Run `npx prisma init --datasource-provider sqlite`
  - Create `.env` with `DATABASE_URL="file:./dev.db"`
  - Write `prisma/schema.prisma` with ALL 5 models matching the design spec EXACTLY:
    - **Topic**: `id String @id`, `title String`, `slug String @unique`, `icon String`, `color String`, `order Int`, `description String?`, relations to Problem[] and Resource[] and StudySession[]
    - **Problem**: `id Int @id @default(autoincrement())`, `title String`, `slug String @unique`, `difficulty String` (EASY/MEDIUM/HARD — stored as String for SQLite), `leetcodeUrl String`, `youtubeUrl String`, `topicId String` FK, `hints String?`, `pattern String?`, `order Int`, relation to Progress?
    - **Progress**: `id Int @id @default(autoincrement())`, `problemId Int @unique` FK, `status String` (NOT_STARTED/ATTEMPTED/SOLVED/REVIEW), `solvedAt DateTime?`, `notes String?`, `timeSpent Int?`, `revisitCount Int @default(0)`, `lastRevisit DateTime?`, `confidence Int?`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
    - **StudySession**: `id Int @id @default(autoincrement())`, `date DateTime @default(now())`, `duration Int`, `problemsSolved Int`, `topicId String?` optional FK, `notes String?`
    - **Resource**: `id Int @id @default(autoincrement())`, `title String`, `url String`, `type String` (VIDEO/ARTICLE/COURSE/TOOL), `source String`, `topicId String?` optional FK, `description String?`
  - Add indexes: `@@index([topicId])` on Problem, `@@index([topicId])` on Resource, `@@index([topicId])` on StudySession, `@@index([date])` on StudySession
  - Run `npx prisma db push` to create SQLite database
  - Verify with `npx prisma studio` (opens, shows empty tables)

  **Must NOT do**:
  - Do NOT use native enums (SQLite doesn't support them — use String type)
  - Do NOT use cuid/uuid for Problem, Progress, StudySession, Resource IDs — use autoincrement per spec
  - Do NOT add fields not in the design spec (except createdAt/updatedAt on Progress per Metis)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single schema file + CLI commands, well-defined structure
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None — Prisma schema is straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 6 (seed), 7 (server actions)
  - **Blocked By**: Task 1 (needs project + Prisma installed)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:28-101` — Complete database schema with all fields, types, and relationships

  **External References**:
  - Prisma SQLite guide: `https://www.prisma.io/docs/orm/overview/databases/sqlite`
  - Prisma schema reference: `https://www.prisma.io/docs/orm/reference/prisma-schema-reference`

  **WHY Each Reference Matters**:
  - The design spec schema tables are the EXACT source of truth for field names, types, and relationships
  - Prisma SQLite docs explain String-for-enum pattern and SQLite-specific limitations

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Schema creates all 5 tables with correct columns
    Tool: Bash
    Preconditions: Prisma installed, .env configured
    Steps:
      1. Run `npx prisma db push` — expect success
      2. Run `npx prisma db execute --stdin <<< "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"` — expect Topic, Problem, Progress, StudySession, Resource (plus _prisma_migrations)
      3. Run `npx prisma db execute --stdin <<< "PRAGMA table_info(Problem);"` — verify columns: id, title, slug, difficulty, leetcodeUrl, youtubeUrl, topicId, hints, pattern, order
    Expected Result: All 5 tables created with correct columns and types
    Failure Indicators: Migration fails, missing columns, wrong types
    Evidence: .sisyphus/evidence/task-2-schema-tables.txt

  Scenario: Relationships and constraints are correct
    Tool: Bash
    Preconditions: Database pushed
    Steps:
      1. Run `npx prisma db execute --stdin <<< "PRAGMA index_list(Problem);"` — expect index on topicId and unique on slug
      2. Run `npx prisma db execute --stdin <<< "PRAGMA foreign_key_list(Problem);"` — expect FK to Topic
      3. Run `npx prisma db execute --stdin <<< "PRAGMA index_list(Progress);"` — expect unique on problemId
    Expected Result: FKs, indexes, and unique constraints present
    Failure Indicators: Missing indexes, no FK constraints
    Evidence: .sisyphus/evidence/task-2-schema-constraints.txt
  ```

  **Commit**: YES
  - Message: `feat(db): add Prisma schema with 5 models and SQLite migration`
  - Files: prisma/schema.prisma, .env, prisma/dev.db
  - Pre-commit: `npx prisma db push`

- [x] 3. shadcn/ui Init + All 12 Components + Dark Theme CSS

  **What to do**:
  - Run `npx shadcn@latest init` — select default style, slate base color, CSS variables YES
  - Check which Tailwind version is installed (from Task 1 output):
    - **If Tailwind v3**: Configure `tailwind.config.ts` with custom font families (`var(--font-inter)`, `var(--font-mono)`), dark background color `#0a0a0f`
    - **If Tailwind v4**: Configure via CSS `@theme` directive in `globals.css` instead of config file. Add custom properties for fonts and colors.
  - Run batch install: `npx shadcn@latest add button card badge progress tabs dialog dropdown-menu tooltip separator scroll-area sheet slider`
  - Configure `globals.css` for dark-mode-only:
    - Set `:root` CSS variables to dark theme values (dark background, light foreground)
    - Remove any `.light` class variables — ONLY dark values exist
    - Set `--background: 240 10% 3.9%` (approximates #0a0a0f)
    - Set complementary foreground, card, primary, muted, accent, border colors for dark theme
  - Add `class="dark"` to `<html>` element (will be done in Task 4's layout, but CSS must be ready)
  - Verify all 12 components are in `src/components/ui/`

  **Must NOT do**:
  - Do NOT add a theme toggle or theme provider — dark mode only
  - Do NOT add `next-themes` package
  - Do NOT customize component internals — use defaults from shadcn

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS theming, design system configuration, visual consistency
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Dark theme color system requires design sensibility for contrast, hierarchy, and readability
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — no browser testing for CSS config

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Tasks 9, 10, 12-19 (all component/page tasks need shadcn components)
  - **Blocked By**: Task 1 (needs npm + Tailwind installed)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:142-144` — Dark mode background #0a0a0f, no theme toggle
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:356` — List of all 12 shadcn components needed

  **External References**:
  - shadcn/ui installation: `https://ui.shadcn.com/docs/installation/next`
  - shadcn/ui theming: `https://ui.shadcn.com/docs/theming`
  - Tailwind v4 migration: `https://tailwindcss.com/docs/v4-beta` (if applicable)

  **WHY Each Reference Matters**:
  - Design spec defines exact background color and "dark mode only" constraint
  - shadcn theming docs show CSS variable approach for dark-only configuration
  - Tailwind v4 docs needed if scaffold installs v4 (different config model)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 12 shadcn components installed
    Tool: Bash
    Preconditions: shadcn init completed
    Steps:
      1. Run `ls src/components/ui/ | wc -l` — expect >= 12 files
      2. Run `ls src/components/ui/` — verify: button.tsx, card.tsx, badge.tsx, progress.tsx, tabs.tsx, dialog.tsx, dropdown-menu.tsx, tooltip.tsx, separator.tsx, scroll-area.tsx, sheet.tsx, slider.tsx
    Expected Result: All 12 component files present in src/components/ui/
    Failure Indicators: Missing component files, shadcn init failed
    Evidence: .sisyphus/evidence/task-3-shadcn-components.txt

  Scenario: Dark theme CSS has no light mode variables
    Tool: Bash
    Preconditions: globals.css configured
    Steps:
      1. Run `grep -c "\.light" src/app/globals.css` — expect 0
      2. Run `grep "background" src/app/globals.css` — verify dark values only (low lightness percentages)
      3. Run `grep "0a0a0f\|240 10% 3" src/app/globals.css` — expect match for dark background
    Expected Result: Only dark theme variables, no light mode, background approximates #0a0a0f
    Failure Indicators: Light mode variables present, wrong background color
    Evidence: .sisyphus/evidence/task-3-dark-theme.txt
  ```

  **Commit**: YES
  - Message: `style: initialize shadcn/ui with dark theme and all 12 components`
  - Files: src/components/ui/*.tsx, src/app/globals.css, components.json, lib/utils.ts, tailwind config
  - Pre-commit: `npx tsc --noEmit`

- [x] 4. Root Layout + Fonts + Metadata

  **What to do**:
  - Create `src/app/layout.tsx` as the root layout:
    - Import `Inter` and `JetBrains_Mono` from `next/font/google` with `variable` option and `display: 'swap'`
    - Set `<html lang="en" className={\`dark ${inter.variable} ${mono.variable}\`}>`
    - Set `<body className="font-sans bg-background text-foreground min-h-screen">`
    - Add flex layout: sidebar area + `<main>` content area
    - Include Breadcrumbs placeholder (component built in Task 10)
    - Export `metadata` with title "DSA Grind" and description
  - Update `globals.css` to reference font variables:
    - `body { font-family: var(--font-inter) }`, `code, pre { font-family: var(--font-mono) }`
  - Update Tailwind config (if v3) or CSS theme (if v4) to add `fontFamily.sans: ['var(--font-inter)']` and `fontFamily.mono: ['var(--font-mono)']`
  - Create `src/app/page.tsx` as placeholder Dashboard (just heading — real content in Task 12)
  - Create route directories for all pages: `src/app/roadmap/`, `src/app/topic/[slug]/`, `src/app/problem/[slug]/`, `src/app/resources/`, `src/app/stats/`, `src/app/session/`, `src/app/api/data/`

  **Must NOT do**:
  - Do NOT add theme toggle or ThemeProvider
  - Do NOT implement Sidebar component (that's Task 9) — just leave space for it in layout
  - Do NOT implement Breadcrumbs (that's Task 10) — just reserve the slot

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single layout file + route stubs, well-defined structure
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Layout structure is defined by spec, no design decisions needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Tasks 9, 10, 12-19 (layout is the shell for all pages)
  - **Blocked By**: Task 1 (needs Next.js project)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:140-157` — Root layout spec: dark mode, fonts, sidebar + main flex layout
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:274-342` — Complete folder structure showing all route directories

  **External References**:
  - next/font/google: `https://nextjs.org/docs/app/building-your-application/optimizing/fonts`

  **WHY Each Reference Matters**:
  - Layout spec defines exact font choices, color, and flex structure
  - Folder structure shows every route directory that must exist

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Root layout renders with correct fonts and dark mode
    Tool: Bash
    Preconditions: Layout file created, dev server running
    Steps:
      1. Run `grep "JetBrains_Mono" src/app/layout.tsx` — expect import
      2. Run `grep "Inter" src/app/layout.tsx` — expect import
      3. Run `grep "dark" src/app/layout.tsx` — expect class on html element
      4. Run `grep "DSA Grind" src/app/layout.tsx` — expect in metadata
    Expected Result: Both fonts imported, dark class applied, metadata set
    Failure Indicators: Missing font imports, no dark class
    Evidence: .sisyphus/evidence/task-4-layout-fonts.txt

  Scenario: All route directories exist
    Tool: Bash
    Preconditions: Directories created
    Steps:
      1. Run `ls src/app/roadmap/` — expect page.tsx (placeholder)
      2. Run `ls src/app/topic/\\[slug\\]/` — expect page.tsx
      3. Run `ls src/app/problem/\\[slug\\]/` — expect page.tsx
      4. Run `ls src/app/resources/ src/app/stats/ src/app/session/ src/app/api/data/` — expect all exist
    Expected Result: All 7 route directories with placeholder files
    Failure Indicators: Missing directories or files
    Evidence: .sisyphus/evidence/task-4-routes.txt
  ```

  **Commit**: YES
  - Message: `feat(layout): add root layout with Inter + JetBrains Mono fonts and route stubs`
  - Files: src/app/layout.tsx, src/app/page.tsx, all route directories
  - Pre-commit: `npx tsc --noEmit`

- [x] 5. Core Library Files + Test Infrastructure

  **What to do**:
  - Create `src/lib/db.ts` — Prisma client singleton:
    ```
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
    export const prisma = globalForPrisma.prisma ?? new PrismaClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
    ```
  - Create `src/lib/utils.ts` — shadcn `cn()` utility (likely already created by shadcn init, verify and extend):
    - Add `formatTime(minutes: number): string` — converts minutes to "Xh Ym" display
    - Add `slugify(text: string): string` — URL-safe slug generation
    - Add `getDifficultyColor(difficulty: string): string` — returns tailwind color class for EASY/MEDIUM/HARD
  - Create `src/lib/constants.ts` with ALL of the following:
    - `DIFFICULTY` enum-like object: `{ EASY: 'EASY', MEDIUM: 'MEDIUM', HARD: 'HARD' }`
    - `STATUS` enum-like object: `{ NOT_STARTED: 'NOT_STARTED', ATTEMPTED: 'ATTEMPTED', SOLVED: 'SOLVED', REVIEW: 'REVIEW' }`
    - `RESOURCE_TYPE` enum-like object: `{ VIDEO: 'VIDEO', ARTICLE: 'ARTICLE', COURSE: 'COURSE', TOOL: 'TOOL' }`
    - `TOPICS` metadata array: 18 entries with `{ id, title, slug, icon (emoji), color (hex), order, description }` in exact NeetCode roadmap order
    - `ROADMAP_EDGES` adjacency list: `Record<string, string[]>` mapping topic slug → dependent topic slugs. Exactly as spec describes:
      - `arrays-hashing` → `[two-pointers, stack]`
      - `two-pointers` → `[sliding-window]`
      - `stack` → `[binary-search]`
      - `sliding-window` → `[linked-list]`, `binary-search` → `[linked-list]`
      - `linked-list` → `[trees]`
      - `trees` → `[tries, heap-priority-queue, backtracking]`
      - `tries` → `[graphs]`, `heap-priority-queue` → `[graphs]`, `backtracking` → `[graphs]`
      - `graphs` → `[advanced-graphs, 1-d-dynamic-programming]`
      - `1-d-dynamic-programming` → `[2-d-dynamic-programming]`
      - `2-d-dynamic-programming` → `[greedy]`
      - `greedy` → `[intervals]`
      - `intervals` → `[math-geometry]`
      - `math-geometry` → `[bit-manipulation]`
    - `ROADMAP_LAYERS` array of arrays: topic slugs grouped by visual row for DAG rendering
    - `DIFFICULTY_COLORS`: `{ EASY: '#22c55e', MEDIUM: '#eab308', HARD: '#ef4444' }`
    - `STATUS_LABELS`: `{ NOT_STARTED: 'Not Started', ATTEMPTED: 'Attempted', SOLVED: 'Solved', REVIEW: 'Review' }`
  - Create `vitest.config.ts`:
    - Use `@vitejs/plugin-react`, `jsdom` environment
    - Path aliases matching tsconfig (`@/` → `src/`)
    - Include pattern: `src/**/*.test.{ts,tsx}`
  - Create `playwright.config.ts`:
    - Base URL: `http://localhost:3000`
    - Test directory: `tests/e2e/`
    - Use projects: chromium only (single browser for speed)
    - Web server: `npm run dev` with auto-start
  - Add scripts to `package.json`: `"test": "vitest"`, `"test:e2e": "playwright test"`
  - Create a sample test `src/lib/__tests__/utils.test.ts` verifying `cn()`, `formatTime()`, `getDifficultyColor()` work correctly

  **Must NOT do**:
  - Do NOT add constants for data that belongs in the database (problem titles, URLs)
  - Do NOT add more than the listed utility functions
  - Do NOT install additional test libraries beyond those in Task 1

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Well-defined files with clear specifications
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Setup only, no test authoring

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Tasks 6-11 (all Wave 2 tasks need lib files and test config)
  - **Blocked By**: Task 1 (needs project + deps)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:186-203` — Complete roadmap dependency graph (hardcoded in constants)
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:326-337` — lib/ file structure: db.ts, utils.ts, constants.ts

  **External References**:
  - Prisma singleton pattern: `https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices`
  - Vitest config: `https://vitest.dev/config/`
  - Playwright config: `https://playwright.dev/docs/test-configuration`

  **WHY Each Reference Matters**:
  - Roadmap dependency graph is the most critical constant — it defines the visual roadmap page topology
  - Prisma singleton prevents connection leak during Next.js hot reload

  **Acceptance Criteria**:

  - [ ] Vitest sample test passes: `npm run test -- --run`
  - [ ] `src/lib/constants.ts` exports TOPICS array with exactly 18 entries
  - [ ] ROADMAP_EDGES has correct topology (arrays-hashing → [two-pointers, stack], etc.)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Utils and constants export correctly
    Tool: Bash
    Preconditions: All lib files created
    Steps:
      1. Run `npm run test -- --run` — expect sample test passes
      2. Run `npx tsx -e "const c = require('./src/lib/constants'); console.log(c.TOPICS.length)"` — expect 18
      3. Run `npx tsx -e "const c = require('./src/lib/constants'); console.log(Object.keys(c.ROADMAP_EDGES).length)"` — expect >= 13 (topics with outgoing edges)
    Expected Result: Tests pass, 18 topics, correct roadmap edge count
    Failure Indicators: Test failures, wrong counts, import errors
    Evidence: .sisyphus/evidence/task-5-lib-tests.txt

  Scenario: Prisma singleton initializes correctly
    Tool: Bash
    Preconditions: db.ts created, schema pushed
    Steps:
      1. Run `npx tsx -e "const { prisma } = require('./src/lib/db'); prisma.topic.count().then(n => console.log('count:', n))"` — expect count: 0 (empty db)
    Expected Result: Prisma connects to SQLite and returns query result
    Failure Indicators: Connection error, module not found
    Evidence: .sisyphus/evidence/task-5-prisma-singleton.txt
  ```

  **Commit**: YES
  - Message: `feat(lib): add constants, utils, db singleton, and test infrastructure`
  - Files: src/lib/db.ts, src/lib/utils.ts, src/lib/constants.ts, vitest.config.ts, playwright.config.ts, src/lib/__tests__/utils.test.ts
  - Pre-commit: `npm run test -- --run`

### Wave 2: Data Layer + Core Components (6 tasks — after Wave 1)

- [x] 6. NeetCode JSON Snapshot + Seed Script + Verification

  **What to do**:
  - Fetch the official NeetCode problem data from `https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json`
  - Save a local snapshot to `prisma/data/neetcode150.json` (committed to repo — seed reads from local file, NOT network)
  - Create `prisma.config.ts` (Prisma v6+ style) to configure seed command: `seed: 'npx tsx prisma/seed.ts'`
  - Create `prisma/seed.ts` that:
    1. Reads `prisma/data/neetcode150.json`
    2. Filters problems where `neetcode150 === true` (IMPORTANT: field name is `neetcode150`, NOT `leetcode150`)
    3. Creates/upserts 18 Topics using the TOPICS metadata from `src/lib/constants.ts` (id, title, slug, icon, color, order, description)
    4. Creates 150 Problems from filtered JSON:
       - Map `problem` field → `title`
       - Map `link` field → construct `leetcodeUrl` as `https://leetcode.com/problems/${link}/`
       - Map `video` field → construct `youtubeUrl` as `https://www.youtube.com/watch?v=${video}` (if video exists, else `https://www.youtube.com/results?search_query=neetcode+${encodeURIComponent(title)}`)
       - Map `difficulty` field → uppercase
       - Map `pattern` field → `topicId` (match against Topic slugs)
       - Set `order` field sequentially within each topic
       - Extract `pattern` tag if available in JSON
    5. Creates 17 Resources (hardcoded in seed — YouTube channels, courses, tools, books per spec)
    6. Uses `createMany` with `skipDuplicates: true` for Problems and Resources
    7. Uses `upsert` for Topics (allows re-running)
  - Run `npx prisma db seed` — verify success
  - Run verification: count Topics (18), Problems (150), Resources (17)
  - Run idempotency check: run seed AGAIN — verify counts unchanged (no duplicates)

  **Must NOT do**:
  - Do NOT hand-type 150 problems — generate from official JSON
  - Do NOT fetch JSON at runtime — use committed local snapshot
  - Do NOT use `ts-node` — use `tsx`

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex data transformation, JSON parsing, field mapping, idempotent seeding logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not a browser task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-11)
  - **Blocks**: Tasks 7 (actions need data), 12-19 (pages need seeded data)
  - **Blocked By**: Task 2 (schema), Task 5 (constants for topic metadata)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:132-137` — Seed data description: 18 topics, 150 problems, 17 resources
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:366-381` — Seed data summary with exact resource list
  - `src/lib/constants.ts` — TOPICS array with ids, slugs, icons, colors for all 18 topics

  **External References**:
  - Official NeetCode JSON: `https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json`
  - NeetCode 150 playlist: `https://www.youtube.com/playlist?list=PLQZEzAa9dfpkv0kZkjomTj553gQyafNiB`
  - Prisma seed docs: `https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding`

  **WHY Each Reference Matters**:
  - The NeetCode JSON is the SOLE data source for 150 problems + video IDs
  - Constants file provides topic metadata that must match seed data exactly
  - Resource list in spec defines the exact 17 resources to seed

  **Acceptance Criteria**:

  - [ ] `npx prisma db seed` runs without error
  - [ ] Exactly 18 topics, 150 problems, 17 resources in database
  - [ ] Running seed twice produces same counts (idempotent)
  - [ ] Every problem has a non-empty `youtubeUrl` (either direct video or search fallback)
  - [ ] Every problem has a valid `leetcodeUrl` starting with `https://leetcode.com/problems/`

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Seed creates correct record counts
    Tool: Bash
    Preconditions: Schema pushed, seed script created
    Steps:
      1. Run `npx prisma db seed` — expect success output
      2. Run `npx tsx -e "const{PrismaClient}=require('@prisma/client');const db=new PrismaClient();Promise.all([db.topic.count(),db.problem.count(),db.resource.count()]).then(([t,p,r])=>{console.log(t,p,r);process.assert(t===18);process.assert(p===150);process.assert(r===17)})"` 
    Expected Result: 18 topics, 150 problems, 17 resources
    Failure Indicators: Wrong counts, seed errors, JSON parse failures
    Evidence: .sisyphus/evidence/task-6-seed-counts.txt

  Scenario: Seed is idempotent (run twice = same result)
    Tool: Bash
    Preconditions: First seed run completed
    Steps:
      1. Run `npx prisma db seed` AGAIN — expect success
      2. Verify counts unchanged: still 18, 150, 17
    Expected Result: No duplicates, same counts after second run
    Failure Indicators: Counts doubled, unique constraint errors
    Evidence: .sisyphus/evidence/task-6-seed-idempotent.txt

  Scenario: YouTube URLs are valid
    Tool: Bash
    Preconditions: Database seeded
    Steps:
      1. Run query for problems with empty youtubeUrl — expect 0 results
      2. Run query for problems where youtubeUrl contains "youtube.com/watch?v=" — count direct embeds
      3. Run query for problems where youtubeUrl contains "youtube.com/results" — count search fallbacks
    Expected Result: Every problem has a YouTube URL, majority are direct embeds
    Failure Indicators: Empty URLs, malformed URLs
    Evidence: .sisyphus/evidence/task-6-youtube-urls.txt
  ```

  **Commit**: YES
  - Message: `feat(seed): add NeetCode 150 seed data from official JSON with verification`
  - Files: prisma/seed.ts, prisma/data/neetcode150.json, prisma.config.ts
  - Pre-commit: `npx prisma db seed`

- [x] 7. Server Actions: progress.ts + sessions.ts + stats.ts (TDD)

  **What to do**:
  - **TDD RED**: Create test files FIRST with failing tests:
    - `src/lib/actions/__tests__/progress.test.ts` — tests for `updateProgress()` and `getProgressByTopic()`
    - `src/lib/actions/__tests__/sessions.test.ts` — tests for `createSession()` and `getSessions()`
    - `src/lib/actions/__tests__/stats.test.ts` — tests for `getStats()`, `getStreakData()`, `getActivityData()`
  - Mock Prisma client in tests using `vi.mock` — mock `prisma.progress.upsert`, `prisma.progress.findMany`, `prisma.studySession.create`, etc.
  - Run tests — verify they FAIL (RED)
  - **TDD GREEN**: Implement all 3 action files:
    - `src/lib/actions/progress.ts`:
      - `'use server'` directive
      - `updateProgress(problemId: number, data: { status?, notes?, confidence?, timeSpent? })` — upserts Progress record. If status === 'SOLVED', sets `solvedAt` to now. Calls `revalidatePath`.
      - `getProgressByTopic(topicId: string)` — returns all Progress records joined with Problem for a given topic
    - `src/lib/actions/sessions.ts`:
      - `'use server'` directive
      - `createSession(data: { duration: number, problemsSolved: number, topicId?: string, notes?: string })` — creates StudySession. Calls `revalidatePath`.
      - `getSessions(from?: Date, to?: Date)` — returns StudySession history, optionally filtered by date range
    - `src/lib/actions/stats.ts`:
      - `'use server'` directive
      - `getStats()` — returns: totalSolved, solvedByDifficulty ({easy, medium, hard}), averageTime. Uses `groupBy` and `aggregate`.
      - `getStreakData()` — calculates consecutive days with activity (union of Progress.solvedAt and StudySession.date)
      - `getActivityData()` — returns data in `{date, count, level}` format for react-activity-calendar heatmap. Covers last 365 days.
  - Run tests — verify they PASS (GREEN)
  - **TDD REFACTOR**: Clean up action code, ensure proper error handling

  **Must NOT do**:
  - Do NOT create REST API routes — these are Server Actions only
  - Do NOT add business logic beyond what's specified (no auto-scheduling, no recommendations)
  - Do NOT skip the RED phase — tests MUST fail before implementation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple files with database logic, aggregation queries, TDD workflow
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Unit tests, not E2E

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8-11)
  - **Blocks**: Tasks 12, 14-16, 18-21 (pages using these actions)
  - **Blocked By**: Task 2 (schema), Task 5 (db singleton, test config)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:113-130` — Server Actions specification: exact function signatures, return values
  - `src/lib/db.ts` — Prisma singleton import
  - `prisma/schema.prisma` — Model definitions for query structure

  **External References**:
  - Next.js Server Actions: `https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations`
  - Vitest mocking: `https://vitest.dev/guide/mocking`

  **WHY Each Reference Matters**:
  - Design spec defines exact function signatures and behavior
  - Prisma schema determines query shapes and relations
  - Vitest mocking docs for the correct `vi.mock('@/lib/db')` pattern

  **Acceptance Criteria**:

  - [ ] All action tests pass: `npm run test -- --run src/lib/actions`
  - [ ] Tests cover: happy path + error case for each action
  - [ ] TDD commits show RED → GREEN → REFACTOR progression

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Server action tests pass (TDD GREEN)
    Tool: Bash
    Preconditions: Test files and implementations created
    Steps:
      1. Run `npm run test -- --run src/lib/actions` — expect all tests pass
      2. Check test count: expect >= 6 test cases (2 per file minimum)
    Expected Result: All server action tests pass
    Failure Indicators: Test failures, import errors, mock issues
    Evidence: .sisyphus/evidence/task-7-action-tests.txt

  Scenario: updateProgress upserts correctly
    Tool: Bash
    Preconditions: Database seeded, actions implemented
    Steps:
      1. Run `npx tsx -e "const{updateProgress}=require('./src/lib/actions/progress');updateProgress(1,{status:'SOLVED',confidence:4}).then(()=>console.log('OK'))"` — expect OK
      2. Query Progress table for problemId=1 — expect status='SOLVED', confidence=4, solvedAt set
    Expected Result: Progress record created/updated with correct values
    Failure Indicators: Action throws, missing fields, wrong values
    Evidence: .sisyphus/evidence/task-7-update-progress.txt
  ```

  **Commit**: YES (3 commits for TDD cycle)
  - Message 1: `test(actions): add failing tests for progress, sessions, and stats actions`
  - Message 2: `feat(actions): implement server actions for progress, sessions, stats`
  - Message 3: `refactor(actions): clean up action code and error handling`
  - Pre-commit: `npm run test -- --run`

- [x] 8. Zustand Store + useTimer Hook (TDD)

  **What to do**:
  - **TDD RED**: Create test files first:
    - `src/store/__tests__/useAppStore.test.ts`
    - `src/hooks/__tests__/useTimer.test.ts`
  - **TDD GREEN**: Implement:
    - `src/store/useAppStore.ts`:
      - `sidebarOpen: boolean` + `toggleSidebar()` + `setSidebarOpen(open: boolean)`
      - `timerState: { isRunning: boolean, startedAt: number | null, elapsed: number, problemId: number | null }`
      - `startTimer(problemId)`, `pauseTimer()`, `resetTimer()`, `getElapsed(): number`
      - Use `persist` middleware with `createJSONStorage(() => localStorage)` for timer state
      - Custom storage wrapper: check `typeof window !== 'undefined'` before accessing localStorage
      - **Timer pattern**: Timestamp-based elapsed tracking (`Date.now() - startedAt`), NOT tick-increment
    - `src/hooks/useTimer.ts`:
      - Custom hook wrapping `useAppStore` timer selectors
      - Returns `{ isRunning, elapsed, formattedTime, start, pause, reset }`
      - Uses `useEffect` with `setInterval(1000)` for display updates ONLY (actual elapsed is timestamp-based)
      - Cleanup: clear interval on unmount
      - Export `useHydrated()` hook for SSR hydration guard
  - Run tests — verify PASS (GREEN)
  - **TDD REFACTOR**: Extract shared types, clean up

  **Must NOT do**:
  - Do NOT use `requestAnimationFrame` for timer (throttled in background tabs)
  - Do NOT store tick-based elapsed time (drift prone) — use timestamp calculation
  - Do NOT put server data in Zustand — only client UI state

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: State management patterns, timer logic, SSR hydration concerns
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Logic-only, no visual work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9-11)
  - **Blocks**: Tasks 16 (ProblemTimer), 19 (Session page), 21 (timer persistence)
  - **Blocked By**: Task 5 (test config)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:257-259` — Timer persistence: Zustand + persist middleware, survives page navigation
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:335-337` — Store file location: src/store/useAppStore.ts

  **External References**:
  - Zustand persist: `https://docs.pmnd.rs/zustand/integrations/persisting-store-data`
  - Zustand SSR: `https://docs.pmnd.rs/zustand/guides/nextjs`

  **WHY Each Reference Matters**:
  - Design spec defines timer behavior and persistence requirement
  - Zustand SSR docs explain hydration mismatch prevention

  **Acceptance Criteria**:

  - [ ] Store tests pass: `npm run test -- --run src/store`
  - [ ] Timer hook tests pass: `npm run test -- --run src/hooks`
  - [ ] Timer uses timestamp-based calculation (no tick-increment)
  - [ ] `useHydrated()` hook exported and usable

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zustand store and timer tests pass
    Tool: Bash
    Preconditions: Store and hook implemented
    Steps:
      1. Run `npm run test -- --run src/store src/hooks` — expect all pass
      2. Check test count: >= 4 tests (start/pause/reset/elapsed)
    Expected Result: All store and hook tests pass
    Failure Indicators: Import errors, timer logic bugs
    Evidence: .sisyphus/evidence/task-8-store-tests.txt

  Scenario: Timer calculates elapsed from timestamps (not ticks)
    Tool: Bash
    Preconditions: Store implemented
    Steps:
      1. Grep `useAppStore.ts` for `Date.now()` — expect at least 2 occurrences (start + elapsed calc)
      2. Grep `useAppStore.ts` for `setInterval` — expect 0 in store (interval only in hook for display)
    Expected Result: Timestamp-based timer in store, no interval-based counting
    Failure Indicators: tick-based timer, setInterval in store
    Evidence: .sisyphus/evidence/task-8-timer-pattern.txt
  ```

  **Commit**: YES
  - Message: `feat(store): add Zustand store with timer hook (TDD)`
  - Files: src/store/useAppStore.ts, src/hooks/useTimer.ts, tests
  - Pre-commit: `npm run test -- --run`

- [x] 9. Sidebar Component (TDD)

  **What to do**:
  - **TDD RED**: Create `src/components/layout/__tests__/Sidebar.test.tsx` with failing tests:
    - Renders "DSA Grind" title
    - Renders all 5 nav links (Dashboard, Roadmap, Resources, Statistics, Session)
    - Highlights active route
    - Shows progress bar with X/150 format
    - Mobile: renders as Sheet (drawer) when triggered
  - **TDD GREEN**: Implement `src/components/layout/Sidebar.tsx`:
    - `'use client'` directive (interactive: uses usePathname, sidebar toggle)
    - Fixed left 260px width on desktop (`hidden lg:flex lg:w-[260px]`)
    - Mobile: shadcn `Sheet` component with hamburger trigger
    - "DSA Grind" logo/title at top (text-based, no image)
    - Nav links: Dashboard (`/`), Roadmap (`/roadmap`), Resources (`/resources`), Statistics (`/stats`), Session (`/session`)
    - Each link: icon + label, active state highlighted with accent background
    - Use `usePathname()` from `next/navigation` for active detection
    - Mini progress bar at bottom: fetch solved count via prop (passed from layout) or lightweight client fetch
    - Format: "X / 150 solved" with shadcn `Progress` component
  - Wire into root layout: import in `src/app/layout.tsx`, render in flex layout

  **Must NOT do**:
  - Do NOT add export/import buttons to sidebar (those go on Dashboard per spec)
  - Do NOT add user profile, settings, or account sections
  - Do NOT fetch data directly in sidebar — receive solved count as prop or use a lightweight pattern

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Navigation UI, responsive layout, active state styling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Sidebar design, responsive behavior, visual hierarchy
  - **Skills Evaluated but Omitted**:
    - `playwright`: Unit test with testing-library, not E2E

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-8, 10, 11)
  - **Blocks**: Tasks 12-19 (all pages render inside sidebar layout)
  - **Blocked By**: Tasks 3 (shadcn components), 4 (root layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:148-157` — Sidebar spec: 260px, collapsible mobile, nav links, progress bar
  - `src/components/ui/sheet.tsx` — shadcn Sheet for mobile drawer
  - `src/components/ui/progress.tsx` — shadcn Progress for mini bar

  **Acceptance Criteria**:

  - [ ] Sidebar tests pass: `npm run test -- --run src/components/layout`
  - [ ] 5 nav links rendered with correct hrefs
  - [ ] Progress bar shows "X / 150 solved" format

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Sidebar renders correctly with navigation
    Tool: Playwright
    Preconditions: Dev server running, database seeded
    Steps:
      1. Navigate to `http://localhost:3000`
      2. Assert sidebar visible on desktop viewport (1280x720): `locator('.lg\\:flex').isVisible()` — expect true
      3. Assert "DSA Grind" text visible: `locator('text=DSA Grind').isVisible()`
      4. Assert 5 nav links present: `locator('nav a').count()` — expect 5
      5. Assert Dashboard link is active (has accent class)
      6. Click "Roadmap" link — URL changes to /roadmap
      7. Assert Roadmap link is now active
    Expected Result: Sidebar renders, navigation works, active state updates
    Evidence: .sisyphus/evidence/task-9-sidebar.png

  Scenario: Sidebar collapses to drawer on mobile
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to mobile (375x667)
      2. Assert sidebar NOT visible: `locator('.lg\\:flex').isHidden()`
      3. Click hamburger/menu button
      4. Assert Sheet/drawer opens with nav links
    Expected Result: Mobile drawer behavior works
    Evidence: .sisyphus/evidence/task-9-sidebar-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(layout): add Sidebar with navigation and progress bar (TDD)`
  - Files: src/components/layout/Sidebar.tsx, tests, src/app/layout.tsx update
  - Pre-commit: `npm run test -- --run`

- [x] 10. Breadcrumbs + Error Toast Pattern (TDD)

  **What to do**:
  - **TDD RED**: Create tests for Breadcrumbs component
  - **TDD GREEN**: Implement `src/components/layout/Breadcrumbs.tsx`:
    - `'use client'` directive (uses usePathname)
    - Parses URL segments into breadcrumb items
    - Maps slugs to human-readable names using:
      - Static routes: "Dashboard", "Roadmap", "Resources", "Statistics", "Session"
      - Dynamic routes: fetch topic/problem title from database (or receive via props/searchParams)
    - Format: `Dashboard > Trees > Invert Binary Tree` with `>` separator
    - Each segment is a link except the last (current page)
    - Hide on root path `/` (Dashboard doesn't need breadcrumbs)
  - Wire into root layout below the header area
  - Create error handling pattern:
    - Install shadcn `toast` / `sonner` component: `npx shadcn@latest add sonner`
    - Create `src/components/ui/toast-provider.tsx` to wrap the Toaster component
    - Add Toaster to root layout
    - Create `src/lib/toast.ts` utility with `showSuccess(msg)`, `showError(msg)` helpers
    - This will be used by all Server Action error handling across the app
  - Create `src/app/error.tsx` (global error boundary — `'use client'`) and `src/app/not-found.tsx`

  **Must NOT do**:
  - Do NOT add notification system beyond simple toasts
  - Do NOT add complex error recovery logic — just show toast + retry button

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with route-aware rendering, error UX
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Breadcrumb UX patterns, error state design
  - **Skills Evaluated but Omitted**:
    - `playwright`: Unit test scope

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-9, 11)
  - **Blocks**: Tasks 12-19 (pages use breadcrumbs and toast)
  - **Blocked By**: Tasks 3 (shadcn), 4 (root layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:158-162` — Breadcrumbs spec: format, segments, slug→title mapping
  - `src/app/layout.tsx` — Where to wire breadcrumbs and toast provider

  **Acceptance Criteria**:

  - [ ] Breadcrumb tests pass
  - [ ] Error boundary (error.tsx) and not-found page exist
  - [ ] Toast utility functions exported

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Breadcrumbs show correct path on topic page
    Tool: Playwright
    Preconditions: Dev server running, seeded database
    Steps:
      1. Navigate to `/topic/arrays-hashing`
      2. Assert breadcrumb visible with text containing "Roadmap" and "Arrays & Hashing"
      3. Click "Roadmap" segment — URL changes to /roadmap
    Expected Result: Breadcrumbs render correct path with clickable segments
    Evidence: .sisyphus/evidence/task-10-breadcrumbs.png

  Scenario: Error toast shows on action failure
    Tool: Bash
    Preconditions: Toast utility created
    Steps:
      1. Verify `src/lib/toast.ts` exports `showSuccess` and `showError`
      2. Verify `src/app/error.tsx` has 'use client' directive
      3. Verify Toaster component is in root layout
    Expected Result: Toast infrastructure ready for use across app
    Evidence: .sisyphus/evidence/task-10-toast.txt
  ```

  **Commit**: YES
  - Message: `feat(layout): add Breadcrumbs, error boundary, and toast pattern (TDD)`
  - Files: src/components/layout/Breadcrumbs.tsx, src/app/error.tsx, src/app/not-found.tsx, src/lib/toast.ts, tests
  - Pre-commit: `npm run test -- --run`

- [x] 11. useKeyboardShortcuts Hook (TDD)

  **What to do**:
  - **TDD RED**: Create `src/hooks/__tests__/useKeyboardShortcuts.test.ts`:
    - Test: pressing 'n' triggers next callback
    - Test: pressing 'p' triggers previous callback
    - Test: pressing 's' triggers status callback
    - Test: shortcuts disabled when target is input/textarea (don't fire when typing)
  - **TDD GREEN**: Implement `src/hooks/useKeyboardShortcuts.ts`:
    - Accept config object: `{ onNext?: () => void, onPrevious?: () => void, onStatusToggle?: () => void }`
    - Register global keydown listener via `useEffect`
    - Ignore events when `event.target` is input, textarea, or contentEditable (Tiptap)
    - Key mappings: `n` → onNext, `p` → onPrevious, `s` → onStatusToggle
    - Cleanup: remove listener on unmount
    - Only active when config callbacks are provided (no-op if undefined)

  **Must NOT do**:
  - Do NOT add shortcuts beyond n/p/s
  - Do NOT add a shortcuts help dialog
  - Do NOT wire to specific pages yet (wiring is Task 22)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single hook, clear logic, simple test
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-10)
  - **Blocks**: Task 22 (shortcuts wiring)
  - **Blocked By**: Task 5 (test config)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:164-168` — Keyboard shortcuts spec: n, p, s keys, context awareness

  **Acceptance Criteria**:

  - [ ] Hook tests pass: `npm run test -- --run src/hooks`
  - [ ] Shortcuts ignore input/textarea/contentEditable targets

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Keyboard shortcut tests pass
    Tool: Bash
    Preconditions: Hook implemented with tests
    Steps:
      1. Run `npm run test -- --run src/hooks/useKeyboardShortcuts` — expect all pass
      2. Verify test count: >= 4 (n, p, s, input-ignore)
    Expected Result: All keyboard shortcut tests pass
    Evidence: .sisyphus/evidence/task-11-keyboard-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(hooks): add keyboard shortcuts hook (TDD)`
  - Files: src/hooks/useKeyboardShortcuts.ts, tests
  - Pre-commit: `npm run test -- --run`

### Wave 3: All Pages (8 tasks — after Wave 2, MAX parallel throughput)

- [x] 12. Dashboard Page + QuickStats + ProgressOverview + StreakTracker + RecommendedProblems (TDD)

  **What to do**:
  - **TDD RED**: Create component tests and Playwright page test
  - **TDD GREEN**: Implement `src/app/page.tsx` (Server Component) + 4 sub-components:
    - `src/components/dashboard/QuickStats.tsx` — 4 stat cards at top:
      - Total solved (count of Progress with status SOLVED)
      - Easy/Medium/Hard solved counts (grouped)
      - Average time (mean of Progress.timeSpent where non-null)
      - Use shadcn `Card` for each stat
    - `src/components/dashboard/ProgressOverview.tsx` — 18 horizontal bars:
      - One bar per topic showing solved/total percentage
      - Topic icon + title + "X/Y" label + shadcn `Progress` bar
      - Color-coded per topic (from TOPICS constant)
    - `src/components/dashboard/StreakTracker.tsx` — streak display:
      - Calculate consecutive days with activity (Progress.solvedAt UNION StudySession.date)
      - Show current streak count prominently
      - Show "Today's solved" list below
    - `src/components/dashboard/RecommendedProblems.tsx` — next unsolved:
      - First 5 unsolved problems ordered by roadmap order (topic order → problem order)
      - Each shows title, difficulty badge, topic, link to `/problem/[slug]`
    - **Empty states**: When no problems solved, show welcome message: "Start with Arrays & Hashing!" with link to first topic
  - Page fetches all data server-side via `prisma` queries (NOT Server Actions for reads)

  **Must NOT do**:
  - Do NOT add export/import buttons here (that's a separate integration concern)
  - Do NOT add charts — charts are on Stats page

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Dashboard layout, stat cards, progress bars, visual hierarchy
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Dashboard design, card layout, data visualization hierarchy
  - **Skills Evaluated but Omitted**:
    - `playwright`: TDD uses testing-library for component tests

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13-19)
  - **Blocks**: Tasks 20-23 (integration tasks)
  - **Blocked By**: Tasks 6 (seeded data), 7 (stats actions), 9 (sidebar), 10 (breadcrumbs)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:174-181` — Dashboard page spec: quick stats, topic progress, streak, today's solved, recommended
  - `src/components/ui/card.tsx` — shadcn Card component
  - `src/components/ui/progress.tsx` — shadcn Progress bar
  - `src/components/ui/badge.tsx` — shadcn Badge for difficulty

  **Acceptance Criteria**:

  - [ ] Dashboard renders with all 4 widget sections
  - [ ] Stats show correct counts from seeded data (0 solved initially)
  - [ ] Empty state renders when no progress exists

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Dashboard renders with seeded data (empty progress)
    Tool: Playwright
    Preconditions: Dev server running, database seeded, no progress records
    Steps:
      1. Navigate to `/`
      2. Assert "0" visible in total solved stat card
      3. Assert 18 topic progress bars visible (all at 0%)
      4. Assert streak is "0 days"
      5. Assert recommended problems section shows 5 problems
      6. Assert first recommended is from "Arrays & Hashing" topic
    Expected Result: Dashboard shows all sections with correct empty/initial state
    Evidence: .sisyphus/evidence/task-12-dashboard-empty.png

  Scenario: Dashboard empty state (no seed data)
    Tool: Playwright
    Preconditions: Dev server running, empty database (no seed)
    Steps:
      1. Navigate to `/`
      2. Assert welcome/empty state message visible
    Expected Result: Graceful empty state, no crashes
    Evidence: .sisyphus/evidence/task-12-dashboard-no-data.png
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add Dashboard page with stats and widgets (TDD)`
  - Files: src/app/page.tsx, src/components/dashboard/*.tsx, tests
  - Pre-commit: `npm run test -- --run`

- [x] 13. Roadmap Page + DAG Visualization (TDD)

  **What to do**:
  - **TDD RED**: Create tests for RoadmapFlow and TopicNode components
  - **TDD GREEN**: Implement the visual dependency graph:
    - `src/app/roadmap/page.tsx` (Server Component) — fetches topics with progress counts
    - `src/components/roadmap/TopicNode.tsx` (Server or Client) — individual topic card:
      - Icon (emoji) + title + "X/Y solved" label
      - Progress bar (shadcn Progress)
      - Color changes by progress: gray (0%) → yellow (in progress) → green (100%)
      - Clickable → navigates to `/topic/[slug]`
      - Accepts `topic`, `solvedCount`, `totalCount` as props
    - `src/components/roadmap/RoadmapFlow.tsx` (Client Component for SVG interactions):
      - **Layout strategy**: CSS Grid/Flex for node positioning using ROADMAP_LAYERS from constants
      - Each layer is a row in the grid. Nodes within a row are centered horizontally.
      - **SVG overlay** (`pointer-events-none`, absolutely positioned) for connection lines:
        - Read ROADMAP_EDGES from constants
        - For each edge: draw SVG `<path>` (bezier curve) from source node bottom to target node top
        - Use `useRef` + `getBoundingClientRect()` to calculate node positions for path coordinates
        - OR use fixed grid-based positions (simpler, more predictable)
      - **Responsive**: On mobile (<768px), allow horizontal scroll (`overflow-x-auto`) for wide DAG
      - Connection line color: muted gray, slightly brighter if both nodes have progress
  - Test that all 18 nodes render, all edges are present, click navigation works

  **Must NOT do**:
  - Do NOT use a heavy graph library (react-flow, d3-force) — CSS grid + SVG paths
  - Do NOT make the DAG editable or interactive beyond clicking nodes
  - Do NOT add animations to the connection lines

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex SVG coordinate calculation, DAG rendering, responsive layout challenge
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Visual graph layout, SVG connection aesthetics, responsive DAG
  - **Skills Evaluated but Omitted**:
    - `playwright`: Testing-library for component, Playwright in QA scenario

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12, 14-19)
  - **Blocks**: Tasks 20-23
  - **Blocked By**: Tasks 5 (constants with ROADMAP_EDGES/LAYERS), 6 (seeded topics), 9-10 (layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:183-203` — Roadmap spec: vertical flowchart, branching, node colors, dependency graph
  - `src/lib/constants.ts` — ROADMAP_EDGES adjacency list and ROADMAP_LAYERS for positioning

  **Acceptance Criteria**:

  - [ ] 18 topic nodes rendered
  - [ ] SVG connection paths visible between dependent topics
  - [ ] Clicking a node navigates to `/topic/[slug]`
  - [ ] Progress colors: gray (0%), yellow (partial), green (100%)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Roadmap renders all 18 topics with connections
    Tool: Playwright
    Preconditions: Dev server running, database seeded
    Steps:
      1. Navigate to `/roadmap`
      2. Count elements matching topic node selector — expect 18
      3. Assert "Arrays & Hashing" node visible
      4. Assert SVG path elements exist — count > 0 (connection lines)
      5. Click "Arrays & Hashing" node — URL changes to `/topic/arrays-hashing`
    Expected Result: Full DAG visible with 18 nodes, clickable navigation
    Evidence: .sisyphus/evidence/task-13-roadmap.png

  Scenario: Roadmap scrollable on mobile viewport
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 375x667 (mobile)
      2. Navigate to `/roadmap`
      3. Assert roadmap container has horizontal scroll capability
      4. Assert nodes still visible (not clipped/hidden)
    Expected Result: DAG is viewable on mobile with scroll
    Evidence: .sisyphus/evidence/task-13-roadmap-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(roadmap): add Roadmap page with DAG visualization (TDD)`
  - Files: src/app/roadmap/page.tsx, src/components/roadmap/*.tsx, tests
  - Pre-commit: `npm run test -- --run`

- [x] 14. Topic Page + ProblemTable + TopicFilters (TDD)

  **What to do**:
  - **TDD RED**: Create tests for ProblemTable, TopicFilters, quick status change
  - **TDD GREEN**: Implement:
    - `src/app/topic/[slug]/page.tsx` (Server Component):
      - Await params (Next.js 16: `const { slug } = await params`)
      - Fetch topic by slug with all problems and their progress
      - Call `notFound()` if topic doesn't exist
      - `generateMetadata` for dynamic page title
    - `src/components/topic/ProblemTable.tsx` ('use client' — interactive table):
      - Columns: status indicator (icon), title (link to `/problem/[slug]`), difficulty badge, LeetCode link (external, new tab), YouTube link (external, new tab), quick status change button
      - Status indicator icons: ⭕ NOT_STARTED, 🔄 ATTEMPTED, ✅ SOLVED, 🔁 REVIEW
      - Difficulty badges: green EASY, yellow MEDIUM, red HARD
      - Quick status change: dropdown or cycle button that calls `updateProgress` Server Action
    - `src/components/topic/TopicFilters.tsx` ('use client'):
      - Filter by status: All, Not Started, Attempted, Solved, Review
      - Filter by difficulty: All, Easy, Medium, Hard
      - Sorting: by difficulty (Easy→Hard), status, order (default), solved date
      - Filters update client-side (no page reload)
    - **Header section**: topic icon + title + description + overall progress bar
    - **Empty state**: "No problems in this topic" (shouldn't happen with seed data, but defensive)

  **Must NOT do**:
  - Do NOT add drag-and-drop reordering
  - Do NOT add bulk actions (mark all solved, etc.)
  - Do NOT fetch data client-side — initial data is server-rendered, filters are client-side

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Data table, filters, badges, interactive status changes
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Table design, filter UX, status indicator icons
  - **Skills Evaluated but Omitted**:
    - `playwright`: Component tests via testing-library

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12, 13, 15-19)
  - **Blocks**: Tasks 20-23
  - **Blocked By**: Tasks 6 (seeded problems), 7 (progress action for status change), 9-10 (layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:205-211` — Topic page spec: header, problem table, filters, sorting
  - `src/lib/actions/progress.ts` — `updateProgress` action for quick status change
  - `src/lib/constants.ts` — DIFFICULTY_COLORS, STATUS_LABELS for display

  **Acceptance Criteria**:

  - [ ] Topic page renders with correct header and problem table
  - [ ] All problems for the topic shown with correct difficulty badges
  - [ ] Quick status change works (calls server action, updates UI)
  - [ ] Filters narrow visible problems correctly

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Topic page renders problems correctly
    Tool: Playwright
    Preconditions: Dev server running, seeded data
    Steps:
      1. Navigate to `/topic/arrays-hashing`
      2. Assert page title contains "Arrays & Hashing"
      3. Assert problem table shows 9 rows (Arrays & Hashing has 9 problems)
      4. Assert "Two Sum" appears in the table
      5. Assert difficulty badges visible (Easy badge for Two Sum)
      6. Assert LeetCode link opens in new tab (target="_blank")
    Expected Result: Topic page shows all problems with correct metadata
    Evidence: .sisyphus/evidence/task-14-topic-page.png

  Scenario: Filters narrow problem list
    Tool: Playwright
    Preconditions: Topic page loaded
    Steps:
      1. Click "Easy" difficulty filter
      2. Assert visible problems are only Easy difficulty
      3. Click "All" to reset
      4. Assert all 9 problems visible again
    Expected Result: Filters correctly narrow and reset the problem list
    Evidence: .sisyphus/evidence/task-14-topic-filters.png
  ```

  **Commit**: YES
  - Message: `feat(topic): add Topic page with problem table and filters (TDD)`
  - Files: src/app/topic/[slug]/page.tsx, src/components/topic/*.tsx, tests
  - Pre-commit: `npm run test -- --run`

- [x] 15. Problem Page: Layout + VideoPlayer + ProblemInfo + Prev/Next (TDD)

  **What to do**:
  - **TDD RED**: Create tests for VideoPlayer, ProblemInfo, prev/next navigation
  - **TDD GREEN**: Implement:
    - `src/app/problem/[slug]/page.tsx` (Server Component):
      - Await params, fetch problem by slug with topic and progress
      - Fetch prev/next problems in same topic (by `order` field)
      - Call `notFound()` if problem doesn't exist
      - `generateMetadata` for dynamic title: "Problem Name — DSA Grind"
      - Two-panel layout: left (video) + right (info/controls) on desktop, stacked on mobile
    - `src/components/problem/VideoPlayer.tsx` (Server or Client):
      - If `youtubeUrl` contains `youtube.com/watch?v=`: render responsive `<iframe>` embed
        - 16:9 aspect ratio container (`aspect-video`)
        - `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`
        - `allowFullScreen`
      - If `youtubeUrl` contains `youtube.com/results`: render "Search on YouTube" button (link to search URL, opens new tab)
      - Handle invalid/removed videos: `onError` fallback showing "Video unavailable" message
    - `src/components/problem/ProblemInfo.tsx` (Server Component):
      - Problem title (heading)
      - Difficulty badge (color-coded)
      - Pattern tag (if available)
      - External links: "Open on LeetCode" (new tab), "NeetCode" (link to search)
      - Hints section: collapsible/expandable (shadcn Collapsible or disclosure pattern)
    - Prev/Next navigation: Previous/Next buttons at bottom linking to adjacent problems in topic
      - Show problem title in button label
      - Disable if at first/last problem in topic

  **Must NOT do**:
  - Do NOT implement StatusSelector, ConfidenceSlider, NotesEditor, or ProblemTimer (that's Task 16)
  - Do NOT add video playback tracking or timestamps
  - Do NOT embed videos from non-YouTube sources

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Two-panel layout, responsive design, video embed, navigation UX
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Panel layout, responsive stacking, video embed aesthetics

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12-14, 16-19)
  - **Blocks**: Task 16 (client controls mount in this layout)
  - **Blocked By**: Tasks 6 (seeded problems with video URLs), 9-10 (layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:212-227` — Problem page spec: two panels, video, info, controls, notes, timer, prev/next
  - `src/lib/constants.ts` — DIFFICULTY_COLORS for badge colors

  **Acceptance Criteria**:

  - [ ] Problem page renders with video embed and problem info
  - [ ] YouTube iframe embeds for problems with direct video URLs
  - [ ] "Search on YouTube" button for fallback URLs
  - [ ] Prev/Next navigation works within topic

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Problem page renders with embedded YouTube video
    Tool: Playwright
    Preconditions: Dev server running, seeded data
    Steps:
      1. Navigate to `/problem/two-sum` (known to have direct video URL)
      2. Assert iframe element visible: `locator('iframe[src*="youtube"]').isVisible()`
      3. Assert problem title "Two Sum" visible
      4. Assert difficulty badge shows "Easy"
      5. Assert LeetCode link present with correct href
      6. Assert Prev/Next buttons visible
    Expected Result: Video embeds, info displays, navigation present
    Evidence: .sisyphus/evidence/task-15-problem-video.png

  Scenario: Problem with search fallback shows button instead of iframe
    Tool: Playwright
    Preconditions: Dev server, find a problem with search fallback URL
    Steps:
      1. Navigate to a problem with search-type youtubeUrl
      2. Assert NO iframe visible
      3. Assert "Search on YouTube" button/link visible
    Expected Result: Graceful fallback for non-embeddable videos
    Evidence: .sisyphus/evidence/task-15-problem-fallback.png
  ```

  **Commit**: YES
  - Message: `feat(problem): add Problem page layout with video and info (TDD)`
  - Files: src/app/problem/[slug]/page.tsx, src/components/problem/VideoPlayer.tsx, ProblemInfo.tsx, tests
  - Pre-commit: `npm run test -- --run`

- [x] 16. Problem Page: StatusSelector + ConfidenceSlider + NotesEditor + ProblemTimer (TDD)

  **What to do**:
  - **TDD RED**: Create tests for each interactive component
  - **TDD GREEN**: Implement all 4 client components, mount them in the Problem page layout from Task 15:
    - `src/components/problem/StatusSelector.tsx` ('use client'):
      - shadcn `DropdownMenu` with 4 status options: Not Started, Attempted, Solved, Review
      - Each option shows status icon and label
      - On select: call `updateProgress(problemId, { status })` via `useTransition`
      - Optimistic: update UI immediately, revert on error
    - `src/components/problem/ConfidenceSlider.tsx` ('use client'):
      - shadcn `Slider` component, range 1-5
      - Labels: 1="No idea", 3="Getting it", 5="Confident"
      - On change: debounce 500ms, then call `updateProgress(problemId, { confidence })`
    - `src/components/problem/NotesEditor.tsx` ('use client'):
      - Tiptap editor with `@tiptap/starter-kit` and `@tiptap/extension-placeholder`
      - Set `immediatelyRender: false` (CRITICAL for Next.js)
      - Show loading skeleton while `editor` is null
      - Toolbar: 5 buttons — Bold, Italic, Code, Bullet List, Heading (H2)
      - Each button uses `editor.chain().focus().toggle[X]().run()` pattern
      - Active state highlighting on toolbar buttons
      - Auto-save: `onUpdate` callback with 1.5s debounce calling `updateProgress(problemId, { notes: editor.getHTML() })`
      - Load initial content from `progress.notes` via `editor.commands.setContent(html)`
      - Placeholder text: "Write your notes here..."
    - `src/components/problem/ProblemTimer.tsx` ('use client'):
      - Uses `useTimer` hook from Task 8
      - Start/Pause button + Reset button
      - Displays elapsed time in "MM:SS" format
      - Uses `useHydrated()` for SSR guard
      - When problem status changes to SOLVED: show prompt "Save X minutes as time spent?" via dialog
      - On confirm: call `updateProgress(problemId, { timeSpent: elapsedMinutes })`

  **Must NOT do**:
  - Do NOT add code syntax highlighting to Tiptap
  - Do NOT add image upload, links, tables, or colors to Tiptap toolbar
  - Do NOT use `requestAnimationFrame` for timer display — use `setInterval(1000)`
  - Do NOT add countdown timer on Problem page (countdown is Session page only)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 4 complex interactive components with Tiptap integration, optimistic updates, timer logic, debouncing
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Editor toolbar design, slider UX, status dropdown aesthetics

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12-15, 17-19)
  - **Blocks**: Tasks 21 (optimistic update integration), 22 (keyboard shortcuts wiring)
  - **Blocked By**: Tasks 7 (updateProgress action), 8 (useTimer hook), 15 (Problem page layout to mount into)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:219-226` — Problem page controls: status dropdown, confidence slider, timer, Tiptap editor
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:252-255` — Optimistic updates: useTransition, revert on failure
  - `src/lib/actions/progress.ts` — `updateProgress` Server Action
  - `src/hooks/useTimer.ts` — Timer hook for ProblemTimer
  - `src/components/ui/dropdown-menu.tsx` — shadcn DropdownMenu
  - `src/components/ui/slider.tsx` — shadcn Slider

  **External References**:
  - Tiptap Next.js: `https://tiptap.dev/docs/editor/getting-started/install/nextjs`
  - Tiptap commands: `https://tiptap.dev/docs/editor/api/commands`

  **WHY Each Reference Matters**:
  - Design spec defines exact controls and their behavior
  - Tiptap docs explain `immediatelyRender: false` requirement and command chaining
  - updateProgress is the shared action all controls call

  **Acceptance Criteria**:

  - [ ] All 4 component tests pass
  - [ ] Tiptap editor renders with 5 toolbar buttons
  - [ ] Auto-save fires after 1.5s debounce
  - [ ] Status change is optimistic (immediate UI update)
  - [ ] Timer shows elapsed time in MM:SS format

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Tiptap editor renders and auto-saves
    Tool: Playwright
    Preconditions: Dev server, problem page loaded
    Steps:
      1. Navigate to `/problem/two-sum`
      2. Assert Tiptap editor visible (contenteditable element)
      3. Assert 5 toolbar buttons visible (Bold, Italic, Code, List, Heading)
      4. Click into editor, type "My solution approach"
      5. Wait 2 seconds (1.5s debounce + buffer)
      6. Refresh page
      7. Assert "My solution approach" still present (auto-saved)
    Expected Result: Editor renders, typing works, auto-save persists
    Evidence: .sisyphus/evidence/task-16-tiptap-editor.png

  Scenario: Status change updates optimistically
    Tool: Playwright
    Preconditions: Dev server, problem page loaded
    Steps:
      1. Navigate to `/problem/two-sum`
      2. Open status dropdown
      3. Select "Solved"
      4. Assert status immediately shows "Solved" (no loading spinner wait)
      5. Refresh page — assert status still shows "Solved" (persisted)
    Expected Result: Optimistic UI update + server persistence
    Evidence: .sisyphus/evidence/task-16-status-change.png
  ```

  **Commit**: YES
  - Message: `feat(problem): add interactive controls and notes editor (TDD)`
  - Files: src/components/problem/StatusSelector.tsx, ConfidenceSlider.tsx, NotesEditor.tsx, ProblemTimer.tsx, tests
  - Pre-commit: `npm run test -- --run`

- [x] 17. Resources Page (TDD)

  **What to do**:
  - **TDD RED**: Create test for Resources page rendering
  - **TDD GREEN**: Implement `src/app/resources/page.tsx` (Server Component):
    - Fetch all resources from database, grouped by type
    - 4 sections: YouTube Channels, Courses, Tools, Books (matching ResourceType enum)
    - Each section has a heading and grid of resource cards
    - Each card: title, description, source badge, "Visit" link (opens new tab)
    - Use shadcn `Card` for each resource, `Badge` for source label
    - **Empty state**: "No resources available" (defensive, shouldn't happen with seed)
  - This is the SIMPLEST page — static display of seeded data, no interactivity

  **Must NOT do**:
  - Do NOT add search or filtering for resources
  - Do NOT add user-submitted resources
  - Do NOT add favorites or bookmarks

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple static page, card grid, no interactivity
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12-16, 18, 19)
  - **Blocks**: Tasks 20-23
  - **Blocked By**: Tasks 6 (seeded resources), 9-10 (layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:228-232` — Resources page spec
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:376-381` — Resource list: channels, courses, tools, books

  **Acceptance Criteria**:

  - [ ] Resources page renders 4 sections
  - [ ] 17 resources displayed with correct metadata
  - [ ] All links open in new tab

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Resources page shows all 17 resources grouped by type
    Tool: Playwright
    Preconditions: Dev server running, seeded data
    Steps:
      1. Navigate to `/resources`
      2. Assert 4 section headings visible (YouTube Channels, Courses, Tools, Books)
      3. Count resource cards — expect 17 total
      4. Assert "NeetCode" appears in YouTube Channels section
      5. Click a resource link — verify opens in new tab (target="_blank")
    Expected Result: All resources displayed in correct categories
    Evidence: .sisyphus/evidence/task-17-resources.png
  ```

  **Commit**: YES
  - Message: `feat(resources): add Resources page (TDD)`
  - Files: src/app/resources/page.tsx, tests
  - Pre-commit: `npm run test -- --run`

- [x] 18. Stats Page + All Chart Components (TDD)

  **What to do**:
  - **TDD RED**: Create tests for chart components and review list
  - **TDD GREEN**: Implement `src/app/stats/page.tsx` (Server Component fetching data) + 4 client sub-components:
    - `src/components/stats/ProgressChart.tsx` ('use client'):
      - Recharts `LineChart` inside `ResponsiveContainer` (width="100%", height=300)
      - X-axis: dates, Y-axis: cumulative solved count
      - Data: aggregate Progress.solvedAt by day → cumulative sum
      - Dark theme: `stroke="#3b82f6"`, grid `stroke="#374151"`, tooltip dark bg
    - `src/components/stats/ActivityHeatmap.tsx` ('use client'):
      - `react-activity-calendar` component
      - Data format: `{ date: 'YYYY-MM-DD', count: number, level: 0-4 }`
      - Level calculation: 0=0, 1=1, 2=2-3, 3=4-5, 4=6+ activities per day
      - `colorScheme="dark"` with GitHub-green color scheme
      - `showWeekdayLabels`, `blockSize={12}`
      - **Compatibility check**: If `react-activity-calendar` fails with React 19, implement custom SVG grid heatmap (~50 lines) as fallback
    - `src/components/stats/DifficultyPie.tsx` ('use client'):
      - Recharts `PieChart` with `Pie` component
      - Donut style: `innerRadius={60}` `outerRadius={80}`
      - 3 slices: Easy (green #22c55e), Medium (yellow #eab308), Hard (red #ef4444)
      - Dark tooltip styling
    - `src/components/stats/ReviewList.tsx` (Server or Client):
      - Problems needing review: `confidence < 3 OR lastRevisit > 7 days ago OR status === 'ATTEMPTED'`
      - Table: problem title, topic, difficulty, confidence, last activity date
      - Link to problem page
      - Average time by difficulty section below
    - **Empty states**: "No stats yet — solve your first problem!" with link to roadmap
    - Page fetches data server-side using `getStats()`, `getStreakData()`, `getActivityData()` from stats actions

  **Must NOT do**:
  - Do NOT add date range pickers — charts show all-time data
  - Do NOT add additional chart types beyond line, donut, heatmap
  - Do NOT make review criteria configurable — fixed at confidence<3 / 7+ days

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 4 chart/visualization components, dark theme styling, data display
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Chart aesthetics, data visualization, color consistency

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12-17, 19)
  - **Blocks**: Tasks 20-23
  - **Blocked By**: Tasks 7 (stats actions), 6 (seeded data), 9-10 (layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:234-240` — Stats page spec: line chart, heatmap, pie, review list
  - `src/lib/actions/stats.ts` — `getStats()`, `getActivityData()` for chart data
  - `src/lib/constants.ts` — DIFFICULTY_COLORS for pie chart

  **External References**:
  - Recharts API: `https://recharts.org/en-US/api`
  - react-activity-calendar: `https://grubersjoe.github.io/react-activity-calendar/`

  **Acceptance Criteria**:

  - [ ] Stats page renders all 4 visualization sections
  - [ ] Charts use dark theme styling (dark backgrounds, light text)
  - [ ] Review list shows correct problems based on criteria
  - [ ] Empty state when no progress data exists

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Stats page renders with chart components
    Tool: Playwright
    Preconditions: Dev server running, seeded data, some progress records created
    Steps:
      1. Navigate to `/stats`
      2. Assert page heading "Statistics" or similar visible
      3. Assert Recharts line chart container visible (SVG element within .recharts-wrapper)
      4. Assert activity heatmap visible
      5. Assert pie/donut chart visible
      6. Assert review list section visible
    Expected Result: All 4 visualization sections render
    Evidence: .sisyphus/evidence/task-18-stats-page.png

  Scenario: Stats empty state (no progress)
    Tool: Playwright
    Preconditions: Dev server, seeded data, NO progress records
    Steps:
      1. Navigate to `/stats`
      2. Assert empty state message visible
    Expected Result: Graceful empty state, no chart errors
    Evidence: .sisyphus/evidence/task-18-stats-empty.png
  ```

  **Commit**: YES
  - Message: `feat(stats): add Stats page with charts and review list (TDD)`
  - Files: src/app/stats/page.tsx, src/components/stats/*.tsx, tests
  - Pre-commit: `npm run test -- --run`

- [x] 19. Session Page + Pomodoro Timer + Audio Notifications (TDD)

  **What to do**:
  - **TDD RED**: Create tests for PomodoroTimer, SessionLog, DailyGoal
  - **TDD GREEN**: Implement `src/app/session/page.tsx` ('use client' — heavily interactive) + 3 sub-components:
    - `src/components/session/PomodoroTimer.tsx` ('use client'):
      - Countdown timer with 3 modes: Work (25min default), Break (5min), Long Break (15min every 4th)
      - Configurable durations via inline number inputs (NOT a settings page)
      - Display: large circular or prominent countdown display "MM:SS"
      - Controls: Start, Pause, Reset, Skip (advance to next phase)
      - State machine: Work → Break → Work → Break → Work → Break → Work → Long Break → repeat
      - Track completed work sessions count
      - Use `setInterval(1000)` (NOT `requestAnimationFrame`)
      - Calculate remaining from `endTime - Date.now()` for drift resistance
    - Audio notification (`src/components/session/useAudioNotification.ts` hook):
      - Web Audio API: create `OscillatorNode` + `GainNode`
      - Play a short beep/chime when timer expires (work→break or break→work)
      - Check `typeof window !== 'undefined' && window.AudioContext`
      - Graceful degradation: if Web Audio unavailable, visual flash only
      - Browser Notification: `Notification.requestPermission()` on first Start
      - On timer complete: `new Notification('DSA Grind', { body: 'Break time!' })` or similar
    - `src/components/session/SessionLog.tsx` ('use client'):
      - Records completed work sessions (pomodoro rounds) with timestamp
      - "Save Session" button: calls `createSession` Server Action with total duration and problems count
      - Display recent sessions in a list
    - `src/components/session/DailyGoal.tsx` ('use client'):
      - Input for daily problem target (number)
      - Stored in `localStorage` (NOT database — ephemeral per spec)
      - Shows progress: "X / Y problems today" with progress bar
      - Resets daily (check date stored alongside goal)

  **Must NOT do**:
  - Do NOT create a settings page — Pomodoro config is inline on this page
  - Do NOT add weekly/monthly goals
  - Do NOT persist Pomodoro state to database — it's session-only
  - Do NOT use `requestAnimationFrame` for countdown

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Pomodoro state machine, Web Audio API, timer drift resistance, browser notifications
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Timer display design, session UX

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12-18)
  - **Blocks**: Tasks 20-23
  - **Blocked By**: Tasks 7 (createSession action), 9-10 (layout)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:242-248` — Session page spec: Pomodoro, audio, session log, daily goal

  **External References**:
  - Web Audio API: `https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API`
  - Notification API: `https://developer.mozilla.org/en-US/docs/Web/API/Notification`

  **Acceptance Criteria**:

  - [ ] Pomodoro timer counts down from 25:00
  - [ ] Audio plays when timer expires (if AudioContext available)
  - [ ] Session log records completed work periods
  - [ ] Daily goal stored in localStorage, shows progress

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Pomodoro timer starts and counts down
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `/session`
      2. Assert timer displays "25:00" (default work duration)
      3. Click "Start" button
      4. Wait 2 seconds
      5. Assert timer shows "24:5" pattern (counting down)
      6. Click "Pause" — timer stops
      7. Click "Reset" — timer shows "25:00" again
    Expected Result: Timer counts down, pauses, resets correctly
    Evidence: .sisyphus/evidence/task-19-pomodoro.png

  Scenario: Daily goal persists in localStorage
    Tool: Playwright
    Preconditions: Session page loaded
    Steps:
      1. Set daily goal to 5 problems
      2. Assert "0 / 5" or similar progress shown
      3. Reload page
      4. Assert goal still shows 5 (persisted in localStorage)
    Expected Result: Daily goal survives page reload
    Evidence: .sisyphus/evidence/task-19-daily-goal.png
  ```

  **Commit**: YES
  - Message: `feat(session): add Session page with Pomodoro and audio notifications (TDD)`
  - Files: src/app/session/page.tsx, src/components/session/*.tsx, tests
  - Pre-commit: `npm run test -- --run`

### Wave 4: Integration (4 tasks — after Wave 3)

- [x] 20. Export/Import API Route (TDD)

  **What to do**:
  - **TDD RED**: Create `src/app/api/data/__tests__/route.test.ts` with failing tests
  - **TDD GREEN**: Implement `src/app/api/data/route.ts`:
    - `GET` handler: exports all Progress and StudySession records as JSON
      - Query all Progress records with problem slug/title for context
      - Query all StudySession records
      - Return `NextResponse.json({ progress: [...], sessions: [...] })`
      - Set `Content-Disposition: attachment; filename="dsa-grind-export.json"` header
    - `POST` handler: imports/upserts from same JSON format
      - Parse request body
      - Validate structure (progress array, sessions array)
      - Use `$transaction` for atomic upsert:
        - For each progress entry: upsert by problemId
        - For each session: create (sessions don't have unique key for upsert, so skip duplicates by date+duration match)
      - Return `{ imported: { progress: N, sessions: N } }`
      - Call `revalidatePath('/')` to refresh dashboard
  - Add export/import buttons to Dashboard page (small UI addition to Task 12's page)

  **Must NOT do**:
  - Do NOT support CSV, PDF, or any format besides JSON
  - Do NOT add authentication to the API route
  - Do NOT create additional API routes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single route file with GET/POST, straightforward JSON logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 23)
  - **Blocks**: Tasks 24 (E2E tests will verify export/import)
  - **Blocked By**: Tasks 7 (server actions pattern), 12 (Dashboard for UI buttons)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:261-268` — Export/Import spec: GET/POST, JSON format, Dashboard buttons
  - `src/lib/db.ts` — Prisma client for queries

  **External References**:
  - Next.js Route Handlers: `https://nextjs.org/docs/app/building-your-application/routing/route-handlers`

  **Acceptance Criteria**:

  - [ ] `GET /api/data` returns JSON with progress and sessions arrays
  - [ ] `POST /api/data` with exported JSON successfully imports/upserts
  - [ ] Round-trip: export → import → export produces identical data

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Export and import round-trips correctly
    Tool: Bash (curl)
    Preconditions: Dev server running, some progress data exists
    Steps:
      1. Run `curl -s http://localhost:3000/api/data -o export.json` — expect 200
      2. Verify JSON structure: `node -e "const d=require('./export.json');console.log(d.progress.length, d.sessions.length)"`
      3. Run `curl -s -X POST http://localhost:3000/api/data -H 'Content-Type: application/json' -d @export.json` — expect success response
      4. Run `curl -s http://localhost:3000/api/data -o export2.json`
      5. Compare: `diff export.json export2.json` — expect identical
    Expected Result: Data round-trips without loss
    Failure Indicators: Different counts, missing fields, parse errors
    Evidence: .sisyphus/evidence/task-20-export-import.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add export/import JSON route (TDD)`
  - Files: src/app/api/data/route.ts, tests, Dashboard page update
  - Pre-commit: `npm run test -- --run`

- [x] 21. Optimistic Updates + Timer Persistence + Save-on-Solve

  **What to do**:
  - **Optimistic Updates**: Audit and enhance all status/confidence changes across the app:
    - `StatusSelector`: Verify `useTransition` wraps the Server Action call. Add `useOptimistic` (React 19.2) for immediate UI update with rollback on error.
    - `ConfidenceSlider`: Verify debounced save with optimistic state.
    - `NotesEditor`: Verify debounced auto-save with visual "Saving..." / "Saved" indicator.
    - `ProblemTable` quick status change: Same optimistic pattern.
    - Error handling: On Server Action failure, revert optimistic state + show error toast.
  - **Timer Persistence**:
    - Verify Zustand persist middleware saves timer state to localStorage.
    - Test: start timer on Problem A, navigate to Problem B, navigate back — timer still running with correct elapsed time.
    - Handle edge case: timer was running when browser closed — on page load, calculate elapsed since `startedAt`.
    - Show "Timer was running for X minutes" notice if returning to a problem with active timer.
  - **Save-on-Solve**:
    - When user marks a problem as SOLVED and timer has elapsed time:
      - Show shadcn `Dialog` prompt: "You spent X minutes on this problem. Save time?"
      - "Save" button: calls `updateProgress(problemId, { status: 'SOLVED', timeSpent: elapsed })`
      - "Skip" button: calls `updateProgress(problemId, { status: 'SOLVED' })` without time
      - Reset timer after saving

  **Must NOT do**:
  - Do NOT make optimistic updates optional — they're required for good UX
  - Do NOT persist Pomodoro timer state (Session page timer is session-only)
  - Do NOT add undo functionality beyond revert-on-error

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Cross-component integration, state management coordination, error handling flows
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 22, 23)
  - **Blocks**: Tasks 24, 25
  - **Blocked By**: Tasks 8 (store), 16 (controls), 14 (ProblemTable)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:252-260` — Optimistic updates + timer persistence specs
  - `src/store/useAppStore.ts` — Timer state in Zustand store
  - `src/components/problem/StatusSelector.tsx` — Status change component
  - `src/components/problem/ProblemTimer.tsx` — Timer component
  - `src/lib/toast.ts` — Error toast utility

  **External References**:
  - React 19 useOptimistic: `https://react.dev/reference/react/useOptimistic`

  **Acceptance Criteria**:

  - [ ] Status changes update UI immediately (no loading wait)
  - [ ] Status changes revert on server error + show error toast
  - [ ] Timer survives page navigation (navigate away and back)
  - [ ] Solving a problem with running timer shows save prompt

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Timer persists across page navigation
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `/problem/two-sum`
      2. Start timer — note elapsed time
      3. Navigate to `/roadmap`
      4. Navigate back to `/problem/two-sum`
      5. Assert timer still running with approximately correct elapsed time
    Expected Result: Timer continues across navigation
    Evidence: .sisyphus/evidence/task-21-timer-persist.png

  Scenario: Save-on-solve dialog appears
    Tool: Playwright
    Preconditions: Dev server, timer has been running
    Steps:
      1. Navigate to `/problem/two-sum`
      2. Start timer, wait 3 seconds
      3. Change status to "Solved"
      4. Assert dialog appears with "Save X minutes?" prompt
      5. Click "Save"
      6. Assert timer resets
    Expected Result: Dialog prompts to save time, saves correctly
    Evidence: .sisyphus/evidence/task-21-save-on-solve.png
  ```

  **Commit**: YES
  - Message: `feat: integrate optimistic updates, timer persistence, and save-on-solve`
  - Files: Multiple component updates
  - Pre-commit: `npm run test -- --run`

- [x] 22. Keyboard Shortcuts Wiring Across Pages

  **What to do**:
  - Wire `useKeyboardShortcuts` hook into Problem page:
    - `n` key → navigate to next problem in topic (if exists)
    - `p` key → navigate to previous problem in topic (if exists)
    - `s` key → open StatusSelector dropdown
    - Use `useRouter` for navigation
  - Ensure shortcuts are ONLY active on `/problem/[slug]` pages:
    - Hook conditionally enabled based on current route
    - OR: only mount the hook component on Problem pages
  - Verify shortcuts don't fire when:
    - User is typing in Tiptap editor (contentEditable)
    - User is typing in any input field
    - User is typing in DailyGoal input on Session page

  **Must NOT do**:
  - Do NOT add shortcuts to other pages
  - Do NOT add a shortcuts help overlay or modal

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Hook wiring, simple integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 23)
  - **Blocks**: Tasks 24
  - **Blocked By**: Tasks 11 (hook), 15-16 (Problem page)

  **References**:

  **Pattern References**:
  - `docs/superpowers/specs/2026-03-13-dsa-grind-design.md:164-168` — Shortcuts spec: n, p, s, only on /problem/[slug]
  - `src/hooks/useKeyboardShortcuts.ts` — Hook to wire
  - `src/app/problem/[slug]/page.tsx` — Page to wire into

  **Acceptance Criteria**:

  - [ ] Pressing 'n' navigates to next problem on Problem page
  - [ ] Pressing 'p' navigates to previous problem
  - [ ] Pressing 's' opens status dropdown
  - [ ] Shortcuts inactive when typing in Tiptap editor

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Keyboard shortcuts work on Problem page
    Tool: Playwright
    Preconditions: Dev server running, on a problem page with next/prev available
    Steps:
      1. Navigate to `/problem/valid-anagram` (second problem in Arrays, has prev AND next)
      2. Press 'n' key
      3. Assert URL changed to next problem in topic
      4. Press 'p' key
      5. Assert URL changed back to valid-anagram
    Expected Result: n/p navigate between problems
    Evidence: .sisyphus/evidence/task-22-keyboard-nav.txt

  Scenario: Shortcuts don't fire when typing in editor
    Tool: Playwright
    Preconditions: On problem page with Tiptap editor
    Steps:
      1. Click into Tiptap editor
      2. Type 'n' — should appear as text in editor
      3. Assert URL did NOT change (shortcut not triggered)
    Expected Result: Typing in editor doesn't trigger navigation
    Evidence: .sisyphus/evidence/task-22-editor-ignore.txt
  ```

  **Commit**: YES
  - Message: `feat: wire keyboard shortcuts across Problem pages`
  - Files: src/app/problem/[slug]/page.tsx update
  - Pre-commit: `npm run test -- --run`

- [x] 23. Empty States + Edge Cases Audit

  **What to do**:
  - Systematically audit every page for empty states and edge cases:
    - **Dashboard**: 0 solved → welcome message, link to first topic
    - **Roadmap**: All gray nodes → "Start your journey!" nudge on first topic
    - **Topic page**: All NOT_STARTED → "Begin solving!" message
    - **Problem page**: No progress record → all controls at default (NOT_STARTED, no notes, confidence null)
    - **Stats page**: No progress → "Solve problems to see stats!" message, empty chart containers
    - **Session page**: First visit → explain Pomodoro concept briefly
    - **Resources page**: (always has data from seed, but defensive empty state)
  - Edge cases to handle:
    - Invalid topic slug → `notFound()` (verify 404 page renders)
    - Invalid problem slug → `notFound()`
    - Timezone handling for "today's solved" — use client-side date comparison
    - YouTube video iframe onError → show fallback message
    - Browser without Web Audio → visual-only timer notification (no crash)
    - Browser denies Notification permission → graceful degradation (audio only)
  - Add `loading.tsx` files for each route:
    - `src/app/loading.tsx` — global loading skeleton
    - `src/app/topic/[slug]/loading.tsx`
    - `src/app/problem/[slug]/loading.tsx`
    - `src/app/stats/loading.tsx`
    - Loading states should show skeleton UI (pulsing placeholders)
  - Add `not-found.tsx` if not already created (Task 10)

  **Must NOT do**:
  - Do NOT add complex error recovery (retry queues, offline mode)
  - Do NOT add loading spinners — use skeleton UI patterns

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Cross-page audit, many small changes, edge case handling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Empty state design, skeleton UI, error UX

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 22)
  - **Blocks**: Tasks 24, 25
  - **Blocked By**: Tasks 12-19 (all pages must exist)

  **References**:

  **Pattern References**:
  - All page components from Tasks 12-19
  - `src/app/error.tsx` — Error boundary from Task 10
  - `src/app/not-found.tsx` — 404 page from Task 10

  **Acceptance Criteria**:

  - [ ] Every page has an empty state that doesn't crash
  - [ ] `loading.tsx` exists for major routes
  - [ ] Invalid slugs return 404 page
  - [ ] Browser without Web Audio doesn't crash Session page

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Invalid topic slug returns 404
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `/topic/nonexistent-topic`
      2. Assert 404 page renders (not a crash/error boundary)
      3. Assert "not found" text visible
    Expected Result: Clean 404 page for invalid slugs
    Evidence: .sisyphus/evidence/task-23-not-found.png

  Scenario: All pages handle empty database gracefully
    Tool: Playwright
    Preconditions: Dev server running, database reset (no seed)
    Steps:
      1. Navigate to `/` — assert no crash, empty state shown
      2. Navigate to `/roadmap` — assert no crash
      3. Navigate to `/stats` — assert no crash, empty state
      4. Navigate to `/session` — assert no crash
      5. Navigate to `/resources` — assert no crash
    Expected Result: All pages render gracefully with empty database
    Evidence: .sisyphus/evidence/task-23-empty-states.png
  ```

  **Commit**: YES
  - Message: `feat: add empty states, loading skeletons, and edge case handling`
  - Files: Multiple loading.tsx files, component updates
  - Pre-commit: `npm run test -- --run`

### Wave 5: E2E Testing + Final Build Gate (2 tasks — after Wave 4)

- [x] 24. Playwright E2E Full Suite

  **What to do**:
  - Create comprehensive Playwright E2E test suite in `tests/e2e/`:
    - `tests/e2e/dashboard.spec.ts`:
      - Loads `/`, verifies stat cards, progress bars, recommended problems
      - Export button works (downloads JSON)
    - `tests/e2e/roadmap.spec.ts`:
      - Loads `/roadmap`, verifies 18 topic nodes
      - Clicks a node → navigates to topic page
    - `tests/e2e/topic.spec.ts`:
      - Loads `/topic/arrays-hashing`, verifies problem table
      - Filters by difficulty
      - Quick status change works
    - `tests/e2e/problem.spec.ts`:
      - Loads `/problem/two-sum`, verifies video + info + controls
      - Changes status (optimistic update)
      - Types in Tiptap editor, verifies auto-save
      - Starts timer, verifies countdown
      - Tests keyboard shortcuts (n, p, s)
      - Tests prev/next navigation
    - `tests/e2e/resources.spec.ts`:
      - Loads `/resources`, verifies 17 resource cards in 4 sections
    - `tests/e2e/stats.spec.ts`:
      - Loads `/stats`, verifies chart containers render
      - Tests empty state and populated state
    - `tests/e2e/session.spec.ts`:
      - Loads `/session`, starts Pomodoro
      - Verifies countdown, pause, reset
      - Sets daily goal, verifies persistence
    - `tests/e2e/navigation.spec.ts`:
      - Sidebar navigation between all pages
      - Breadcrumb navigation
      - Browser back/forward
  - Configure `playwright.config.ts` to run against dev server
  - Ensure all tests pass: `npx playwright test`

  **Must NOT do**:
  - Do NOT test external sites (LeetCode, YouTube) — only test internal UI
  - Do NOT add visual regression tests (screenshot comparison) — just functional assertions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Comprehensive E2E suite across 7 pages
  - **Skills**: [`playwright`]
    - `playwright`: Primary tool for all E2E test authoring

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 25)
  - **Blocks**: Wave FINAL
  - **Blocked By**: Tasks 20-23 (all integration complete)

  **References**:

  **Pattern References**:
  - All QA Scenarios from Tasks 12-23 — E2E tests should cover these scenarios
  - `playwright.config.ts` — Config from Task 5

  **External References**:
  - Playwright docs: `https://playwright.dev/docs/writing-tests`

  **Acceptance Criteria**:

  - [ ] `npx playwright test` — all tests pass
  - [ ] At least 1 test per page (8+ spec files)
  - [ ] Problem page E2E covers: video, editor, status, timer, keyboard shortcuts

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full E2E suite passes
    Tool: Bash
    Preconditions: Dev server running, seeded database
    Steps:
      1. Run `npx playwright test --reporter=list` — capture output
      2. Assert exit code 0
      3. Assert all spec files listed as passed
    Expected Result: All E2E tests pass
    Evidence: .sisyphus/evidence/task-24-e2e-results.txt
  ```

  **Commit**: YES
  - Message: `test(e2e): add Playwright E2E suite for all 7 pages`
  - Files: tests/e2e/*.spec.ts
  - Pre-commit: `npx playwright test`

- [x] 25. Final Build Gate Verification

  **What to do**:
  - Run ALL verification commands and capture results:
    - `npx tsc --noEmit` — zero type errors
    - `npm run lint` — zero lint errors
    - `npm run build` — production build succeeds
    - `npm run test -- --run` — all Vitest tests pass
    - `npx playwright test` — all E2E tests pass
    - `npx prisma db seed` (on fresh db) — seed succeeds
    - Seed verification: 18 topics, 150 problems, 17 resources
  - Fix ANY failures found
  - Verify `npm run start` (production mode) works
  - Capture final counts:
    - Total Vitest tests
    - Total Playwright tests
    - Total TypeScript files
    - Total lines of code (rough)
  - Create `.sisyphus/evidence/build-gate-final.txt` with all results

  **Must NOT do**:
  - Do NOT skip any verification step
  - Do NOT suppress warnings/errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Running commands and capturing output
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 24)
  - **Blocks**: Wave FINAL
  - **Blocked By**: Tasks 20-24

  **References**:
  - All project files (comprehensive verification)

  **Acceptance Criteria**:

  - [ ] Every verification command exits with code 0
  - [ ] Production build succeeds and starts
  - [ ] Evidence file captures all results

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All build gates pass
    Tool: Bash
    Preconditions: All tasks complete
    Steps:
      1. Run `npx tsc --noEmit && echo "TSC_OK"` — expect TSC_OK
      2. Run `npm run lint && echo "LINT_OK"` — expect LINT_OK
      3. Run `npm run build && echo "BUILD_OK"` — expect BUILD_OK
      4. Run `npm run test -- --run && echo "TEST_OK"` — expect TEST_OK
      5. Run `npx playwright test && echo "E2E_OK"` — expect E2E_OK
    Expected Result: All 5 gates pass
    Evidence: .sisyphus/evidence/task-25-build-gate.txt
  ```

  **Commit**: YES
  - Message: `chore: final build gate — all verification passing`
  - Files: — (no file changes unless fixes needed)
  - Pre-commit: all verification commands

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + linter + `npm run test -- --run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify dark theme consistency (#0a0a0f background, proper text contrast).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state (`prisma migrate reset && prisma db seed`). Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration: solve a problem → check dashboard updates → check stats page → check roadmap progress colors. Test edge cases: empty state, invalid inputs, timer across page navigation. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual code. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT Have" compliance: search for auth code, theme toggles, extra API routes, extra Tiptap extensions, settings pages. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Phase | Message | Files | Pre-commit |
|-------|---------|-------|------------|
| T1 | `chore: scaffold Next.js project with all dependencies` | package.json, next.config.ts, .gitignore, tsconfig.json | — |
| T2 | `feat(db): add Prisma schema with 5 models and SQLite migration` | prisma/schema.prisma, .env, prisma/migrations/ | `npx tsc --noEmit` |
| T3 | `style: initialize shadcn/ui with dark theme and all components` | components/ui/*, globals.css, components.json, tailwind config | `npx tsc --noEmit` |
| T4 | `feat(layout): add root layout with Inter + JetBrains Mono fonts` | src/app/layout.tsx, src/app/globals.css | `npx tsc --noEmit` |
| T5 | `feat(lib): add constants, utils, db singleton, and test config` | src/lib/*.ts, vitest.config.ts, playwright.config.ts | `npx tsc --noEmit` |
| T6 | `feat(seed): add NeetCode 150 seed data with verification` | prisma/seed.ts, prisma/data/neetcode150.json, prisma.config.ts | `npx prisma db seed` |
| T7 | `feat(actions): add server actions for progress, sessions, stats (TDD)` | src/lib/actions/*.ts, src/lib/actions/__tests__/*.test.ts | `npm run test -- --run` |
| T8 | `feat(store): add Zustand store with timer hook (TDD)` | src/store/*.ts, src/hooks/useTimer.ts, tests | `npm run test -- --run` |
| T9 | `feat(layout): add Sidebar with navigation and progress bar (TDD)` | src/components/layout/Sidebar.tsx, tests | `npm run test -- --run` |
| T10 | `feat(layout): add Breadcrumbs and error toast pattern (TDD)` | src/components/layout/Breadcrumbs.tsx, tests | `npm run test -- --run` |
| T11 | `feat(hooks): add keyboard shortcuts hook (TDD)` | src/hooks/useKeyboardShortcuts.ts, tests | `npm run test -- --run` |
| T12 | `feat(dashboard): add Dashboard page with stats and widgets (TDD)` | src/app/page.tsx, src/components/dashboard/*.tsx, tests | `npm run test -- --run` |
| T13 | `feat(roadmap): add Roadmap page with DAG visualization (TDD)` | src/app/roadmap/page.tsx, src/components/roadmap/*.tsx, tests | `npm run test -- --run` |
| T14 | `feat(topic): add Topic page with problem table and filters (TDD)` | src/app/topic/[slug]/page.tsx, src/components/topic/*.tsx, tests | `npm run test -- --run` |
| T15 | `feat(problem): add Problem page layout with video and info (TDD)` | src/app/problem/[slug]/page.tsx, VideoPlayer, ProblemInfo, tests | `npm run test -- --run` |
| T16 | `feat(problem): add interactive controls and notes editor (TDD)` | StatusSelector, ConfidenceSlider, NotesEditor, ProblemTimer, tests | `npm run test -- --run` |
| T17 | `feat(resources): add Resources page (TDD)` | src/app/resources/page.tsx, tests | `npm run test -- --run` |
| T18 | `feat(stats): add Stats page with charts and review list (TDD)` | src/app/stats/page.tsx, src/components/stats/*.tsx, tests | `npm run test -- --run` |
| T19 | `feat(session): add Session page with Pomodoro and audio (TDD)` | src/app/session/page.tsx, src/components/session/*.tsx, tests | `npm run test -- --run` |
| T20 | `feat(api): add export/import JSON route (TDD)` | src/app/api/data/route.ts, tests | `npm run test -- --run` |
| T21 | `feat: integrate optimistic updates, timer persistence, save-on-solve` | multiple components | `npm run test -- --run` |
| T22 | `feat: wire keyboard shortcuts across Problem pages` | hooks, page components | `npm run test -- --run` |
| T23 | `feat: add empty states and edge case handling across all pages` | multiple components | `npm run test -- --run` |
| T24 | `test(e2e): add Playwright E2E suite for all 7 pages` | tests/e2e/*.spec.ts | `npx playwright test` |
| T25 | `chore: final build gate — tsc, lint, build, all tests pass` | — | all commands |

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit                    # Expected: zero errors
npm run lint                         # Expected: passes
npm run build                        # Expected: builds successfully
npm run test -- --run                # Expected: all tests pass
npx playwright test                  # Expected: all E2E pass
npx prisma db seed                   # Expected: seeds without error
# Seed verification:
node -e "const{PrismaClient}=require('@prisma/client');const db=new PrismaClient();Promise.all([db.topic.count(),db.problem.count(),db.resource.count()]).then(([t,p,r])=>{console.assert(t===18);console.assert(p===150);console.assert(r===17);console.log('OK')})"
```

### Final Checklist
- [ ] All 7 pages load without errors
- [ ] All 150 problems seeded with correct LeetCode URLs and YouTube video IDs
- [ ] Roadmap displays 18 topic nodes with SVG connections matching NeetCode DAG
- [ ] Problem page embeds YouTube video, shows Tiptap editor, timer, status controls
- [ ] Dashboard shows correct stats, streak, and recommended problems
- [ ] Stats page shows all 4 charts with real data
- [ ] Session page Pomodoro timer works with audio notifications
- [ ] Export/Import round-trips data correctly
- [ ] Dark mode only (#0a0a0f background) — no light theme artifacts
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All Vitest tests pass
- [ ] All Playwright E2E tests pass
