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

## [2026-03-13] Task 3: shadcn/ui Complete
- shadcn version: 4.0.6 (base-nova style, uses Base UI not Radix)
- All 12 components installed: button, card, badge, progress, tabs, dialog, dropdown-menu, tooltip, separator, scroll-area, sheet, slider
- Tailwind v4 path: CSS @theme directive used (no tailwind.config.ts)
- Dark theme configured in :root with hsl() values
- No light mode variables — single dark theme only
- Background: hsl(240 10% 3.9%) ≈ #0a0a0f
- Primary: hsl(217.2 91.2% 59.8%) — vivid blue
- Any gotchas:
  - `--defaults` flag works for non-interactive init, `--yes` does NOT
  - shadcn v4 generates oklch colors; replaced with hsl() for spec compliance
  - Components use `dark:` variants — Task 4 must add `className="dark"` to <html> for full fidelity
  - TooltipProvider needed in layout (Task 4 responsibility)
   - CSS LSP errors on Tailwind syntax are false positives — build passes clean

## [2026-03-13] Task 4: Root Layout Complete
- Inter and JetBrains_Mono imported via next/font/google
- Font variables: --font-inter, --font-jetbrains
- Dark class on html element
- Route structure: 7 routes created with placeholder pages
- Next.js 16 pattern: params as Promise<> used in dynamic routes
- globals.css updated: --font-sans → --font-inter, --font-mono → --font-jetbrains
- code/pre styling added to @layer base for monospace font
- Layout structure: flex with sidebar placeholder (Task 9) and breadcrumbs placeholder (Task 10)
- All TypeScript checks pass (npx tsc --noEmit clean)

## [2026-03-13] Task 5: Core Library Files + Test Infrastructure Complete
- db.ts: Prisma singleton using globalThis pattern for dev mode
- utils.ts: Enhanced with formatTime, slugify, getDifficultyColor (cn already existed)
- constants.ts: 18 topics with exact NeetCode order, 16 roadmap edges, 13 roadmap layers
- vitest.config.ts: jsdom environment + react plugin + @/ alias resolution
- playwright.config.ts: chromium only, dev server auto-start, baseURL http://localhost:3000
- Test infrastructure: npm run test passes all 11 tests in 14.25s
- All 18 topics verified: arrays-hashing through bit-manipulation
- ROADMAP_EDGES: 16 edges connecting topics in DAG order
- ROADMAP_LAYERS: 13 layers for visualization (1 topic per layer except layer 2, 3, 6)

## [2026-03-13] Task 6: Seed Complete
- 18 topics seeded from TOPICS constant
- 150 problems from neetcode150.json
- 17 resources hardcoded in seed
- Seed is idempotent (transaction + deterministic delete/insert)
- Pattern-to-topicId mapping: all 18 NeetCode patterns mapped cleanly, no fallback mismatches observed
- YouTube URL: 150 direct, 0 search fallbacks

 ## [2026-03-13] Task 7: Server Actions Complete
 - progress.ts: updateProgress (upserts), getProgressByTopic
 - sessions.ts: createSession, getSessions with optional date range
 - stats.ts: getStats (uses $queryRaw for cross-model groupBy), getStreakData, getActivityData
 - Test pattern: vi.mock('@/lib/db') + vi.mock('next/cache')
 - TDD: All tests pass

## [2026-03-13] Task 8: Zustand Store + Timer Complete
- Store uses persist middleware with localStorage hydration guard
- Timer: timestamp-based (Date.now()) not tick-based
- useTimer hook: setInterval(1000) for DISPLAY only, store holds timestamps
- useHydrated(): returns false on SSR, true after mount
- Tests: renderHook + act for state changes

## [2026-03-14] Task 11: Keyboard Shortcuts Hook Complete
- Hook: useKeyboardShortcuts listens for n/p/s key presses globally
- Ignores INPUT, TEXTAREA, contentEditable targets (prevents shortcuts while typing)
- Gracefully handles missing callbacks (no-op when undefined)
- TDD approach: 7 tests all passing
- Implementation: useEffect with event listener cleanup
- Dependencies: [onNext, onPrevious, onStatusToggle] for proper re-registration
- Test pattern: fireKeydown helper + renderHook + vi.fn() mocks
- No new packages required

## [2026-03-14] Task 9: Sidebar Complete
- Fixed 260px desktop, Sheet drawer mobile
- Icons: lucide-react (already installed v0.577.0)
- NavContent shared between desktop and mobile
- solvedCount prop for progress bar (currently static 0/150)
- layout.tsx: added lg:pl-[260px] to main for desktop offset
- Sheet uses base-ui Dialog (render prop, NOT Radix asChild)
- lucide-react Map icon shadows global — import as MapIcon
- base-ui Progress track is h-1 by default, className goes on root not track
- Mock pattern for component tests: mock next/link, next/navigation, zustand store

## [2026-03-14] Task 10: Breadcrumbs + Toast Complete
- Breadcrumbs: route-aware, hidden on /, links for segments except last
- Toast: sonner library, showSuccess/showError helpers in src/lib/toast.ts
- Error boundary: src/app/error.tsx with 'use client' and reset button
- Not-found: src/app/not-found.tsx
- Layout updated: Breadcrumbs + Toaster added
- shadcn sonner uses next-themes — replaced with hardcoded "dark" since app is dark-mode-only
- base-ui Button has NO asChild prop — use buttonVariants() with Link directly
- Next.js error.tsx: renamed export from Error to ErrorPage to avoid shadowing global Error

## [2026-03-14] Task 17: Resources Page Complete
- Server component fetching resources directly via prisma
- 4 sections: YouTube Channels, Courses, Tools, Books (ARTICLE type)
- ResourceCard exported for testing (5 tests all passing)
- Links open in new tab (target="_blank", rel="noopener noreferrer")
- Responsive grid: 2 columns on sm+ screens
- TYPE_LABELS mapping for display names, TYPE_ORDER for consistent ordering
- Each resource: title, description, source badge, external link
- Dark theme: bg-card, text-foreground, text-muted-foreground
- Hover effects on cards and links
- TDD: Test file created first (RED), then implementation (GREEN)

## [2026-03-14] Task 12: Dashboard Complete
- Server component with Promise.all for parallel data fetching
- QuickStats: 4 stat cards (total solved, difficulty breakdown, avg time, completion %)
- ProgressOverview: 18 topic progress bars linked to /topic/[slug]
- StreakTracker: current streak + today's solved
- RecommendedProblems: next 5 unsolved by topic order
- Tests: 18 tests across 4 test files, mock next/link and next/navigation
- Prisma v7 one-to-one relation: use `NOT: { progress: { status: 'SOLVED' } }` instead of `none`
- Manual topic aggregation instead of groupBy (safer for SQLite adapter)
- base-ui Progress and Badge components work correctly in test environment

## [2026-03-14] Task 14: Topic Page Complete
- Server component with await params
- ProblemTable: client component with useTransition optimistic status cycle
- TopicFilters: client-side filter by status/difficulty + sort
- Status cycle: NOT_STARTED → ATTEMPTED → SOLVED → REVIEW → NOT_STARTED
- Tests: mock next/link + mock updateProgress action
- All buttons need explicit type="button" (lint rule)
- STATUS_LABELS from constants.ts used with keyof typeof cast for type safety

## [2026-03-14] Task 15: Problem Page Layout Complete
- Two-panel: left video (55-60%), right info
- VideoPlayer: iframe for direct URLs, search button fallback, onError handler
- ProblemInfo: title, difficulty badge, pattern badge, external links, collapsible hints
- Prev/Next: findFirst with order < / > current, orderBy desc/asc
- Task 16 slot: div#problem-controls-slot placeholder
- base-ui Button has no asChild → use buttonVariants({ variant: 'ghost' }) + Link
- YouTube embeds use youtube-nocookie.com for privacy
- Badge uses useRender from @base-ui/react — works with className prop
- 12 tests (4 VideoPlayer, 8 ProblemInfo) all passing

## [2026-03-14] Task 16: Problem Controls Complete
- StatusSelector: optimistic update with revert, custom dropdown (not shadcn DropdownMenu)
- ConfidenceSlider: HTML range input, 500ms debounce
- NotesEditor: Tiptap v3, immediatelyRender: false critical!, 5-button toolbar
- ProblemTimer: useTimer + useHydrated SSR guard
- ProblemControls: wrapper for all 4, mounted in Problem page
- Tiptap v3 API: chain().focus().toggleBold()/toggleItalic()/toggleCode()/toggleBulletList()/toggleHeading() works the same as v2 for this use-case


## [2026-03-14] Task 13: Roadmap Page Complete
- Server component: parallel queries for progress and topic counts
- RoadmapFlow: simplified approach with arrows (no SVG bezier)
- TopicNode: color by progress (gray=0, yellow=partial, green=100%)
- 18 nodes rendered using ROADMAP_LAYERS constant
- Tests: 5 TopicNode + 3 RoadmapFlow

### Task 13 implementation note
- Final RoadmapFlow uses CSS Grid plus SVG dependency paths/arrows (not down-arrow placeholders).
- Test scope currently covers 11 assertions total across TopicNode and RoadmapFlow test files.

## [2026-03-14] Task 18: Stats Page Complete
- ProgressChart: Recharts LineChart, cumulative data, HSL colors from CSS vars
- DifficultyPie: Recharts PieChart donut, uses DIFFICULTY_COLORS from constants
- ActivityHeatmap: Custom SVG grid (react-activity-calendar compatible but used custom SVG for full control)
- ReviewList: problems with confidence<3, ATTEMPTED, REVIEW status
- Empty state: link to roadmap when no data
- react-activity-calendar@3.1.1: supports React 19 (^18 || ^19)
- recharts@3.8.0: all needed exports available (LineChart, PieChart, etc.)
- Recharts v3 API: same imports as v2 for basic chart types
- SVG heatmap: flatten data into cells array with stable keys to avoid lint array-index-as-key errors
- Prisma $queryRaw with template literal: works for SQLite cross-join aggregation
- 14 tests across 4 test files, all passing

## [2026-03-14] Task 19: Session Page Complete
- PomodoroTimer: endTime-based countdown (drift resistant), state machine work->break->longBreak
- useAudioNotification: Web Audio OscillatorNode + optional Notification API
- SessionLog: records completed sessions in memory, saves all to DB via createSession
- DailyGoal: localStorage persistence, resets daily, +1/-1 controls

## [2026-03-14] Task 20: Export/Import API Complete
- GET /api/data: returns all progress + sessions with problem slugs, sets Content-Disposition header
- POST /api/data: upserts progress by problemId, creates sessions (skip duplicate date+duration)
- ExportImport component: client-side export/import buttons with file download/upload
- Dashboard: ExportImport positioned top-right of heading with flexbox justify-between
- Round-trip: export JSON → import → re-export produces identical data structure
- Tests: 4 passing (GET returns arrays, GET includes slugs, POST validates JSON, POST returns counts)
- Build: successful with no errors, route registered as /api/data (Dynamic)

## [2026-03-14] Task 22: Keyboard Shortcuts Wired
- KeyboardNav client component: null-render, just wires shortcuts
- data-status-selector attribute on StatusSelector trigger
- Next.js 16: router.push() for navigation
- Shortcuts: n=next, p=previous, s=status toggle
- All 28 tests passing (6 test files)

## [2026-03-14] Task 21: Optimistic Updates + Timer Persistence
- StatusSelector: onStatusChange prop added for parent coordination
- ProblemControls: tracks status changes, shows SaveTimeDialog on SOLVED
- SaveTimeDialog: save elapsed time or skip, resets timer
- Timer persistence: Zustand persist middleware covers page navigation

## [2026-03-14] Task 23: Empty States + Loading Skeletons Complete
- Loading skeletons: 4 files (global, topic, problem, stats)
- All pages verified for empty state handling
- notFound() used for invalid slugs
- Build passes with all 7 pages generated

## [2026-03-14] Task 25: Final Build Gate Verification Complete
- TypeScript (npx tsc --noEmit): PASS (0 errors)
  * Fixed 4 type casting issues in test files using `as unknown as` pattern
  * useKeyboardShortcuts.test.ts: Fixed EventTarget type issues
  * progress.test.ts, sessions.test.ts, stats.test.ts: Fixed Prisma mock type casting
- Lint (npm run lint): PASS (0 errors)
  * Removed unused imports (beforeEach, afterEach, vi, CardHeader, CardTitle)
  * Added eslint-disable-next-line comments for necessary any types
  * Refactored DailyGoal: moved localStorage init to initializeState() with window check
  * Refactored useTimer: removed setState in effects, used initializer functions
  * Fixed ActivityHeatmap: replaced Date.now() with new Date().toISOString()
  * Fixed stats page: replaced variable reassignment with reduce pattern
- Build (npm run build): PASS
  * Production build succeeded in 3.7s
  * All 9 pages generated successfully
  * Fixed localStorage access in DailyGoal with typeof window === 'undefined' guard
- Tests (npm run test -- --run): PASS
  * 31 test files passed
  * 142 tests passed
  * Duration: 7.85s
- Database Counts: PASS
  * Topics: 18 ✓
  * Problems: 150 ✓
  * Resources: 17 ✓
- Evidence: Saved to .sisyphus/evidence/task-25-build-gate.txt

## [2026-03-14] Task 24: Playwright E2E Suite Complete
- 8 spec files covering all 7 pages + navigation
- 38 tests total, 38 pass, 0 fail
- Key findings: Playwright needed webpack-backed `webServer` because Turbopack `next dev` panicked on Windows for `/`; build verification also required moving `ResourceCard` out of `src/app/resources/page.tsx` into `src/app/resources/ResourceCard.tsx` because app route pages cannot export arbitrary named components.

## [2026-03-14] F2 Follow-up: Code Quality Fixes
- NotesEditor now clears its debounced save timer on unmount to avoid stale timeout callbacks after navigation.
- Intentional `catch` blocks in bulk import and audio notification paths are documented so silent partial-failure behavior is explicit during audits.
- Verification after fixes: `npm run test -- --run` PASS, `npm run build` PASS, LSP diagnostics clean for changed files.
