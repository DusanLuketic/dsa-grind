# DSA Grind — Design Spec

## Overview

DSA Grind is a free, self-hosted Next.js web application for learning data structures and algorithms. It aggregates free resources (NeetCode roadmap, YouTube explanations, LeetCode problems) into a unified, personalized interface for technical interview preparation.

**Core goal**: Replace NeetCode Pro with a free alternative that tracks progress through the NeetCode 150 problem set, embeds video explanations, and organizes study with a visual roadmap.

---

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite via Prisma ORM (local, zero-config)
- **State management**: React Server Components + Zustand (client UI state only)
- **Data mutations**: Next.js Server Actions (no REST API layer)
- **Video embed**: YouTube IFrame (free)
- **Charts**: Recharts (line, pie/donut) + react-activity-calendar (heatmap)
- **Rich text**: Tiptap WYSIWYG editor
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Auth**: None (single-user, self-hosted)
- **Theme**: Dark mode only

---

## Database Schema

### Topic

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | String   | @id                                |
| title       | String   | "Arrays & Hashing", "Two Pointers" |
| slug        | String   | @unique                            |
| icon        | String   | Emoji                              |
| color       | String   | Hex color for UI                   |
| order       | Int      | Position in roadmap                |
| description | String?  | Short description                  |
| problems    | Problem[]|                                    |

### Problem

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | Int      | @id @default(autoincrement())      |
| title       | String   | "Two Sum", "Valid Anagram"         |
| slug        | String   | @unique                            |
| difficulty  | Enum     | EASY, MEDIUM, HARD                 |
| leetcodeUrl | String   | Direct LeetCode link               |
| youtubeUrl  | String   | NeetCode video or search fallback  |
| topicId     | String   | FK to Topic                        |
| hints       | String?  | Optional hints                     |
| pattern     | String?  | Algorithm pattern used             |
| order       | Int      | Position within topic              |
| progress    | Progress?|                                    |

### Progress

| Field        | Type      | Notes                            |
|--------------|-----------|----------------------------------|
| id           | Int       | @id @default(autoincrement())    |
| problemId    | Int       | @unique, FK to Problem           |
| status       | Enum      | NOT_STARTED, ATTEMPTED, SOLVED, REVIEW |
| solvedAt     | DateTime? |                                  |
| notes        | String?   | HTML from Tiptap editor          |
| timeSpent    | Int?      | Minutes                          |
| revisitCount | Int       | @default(0)                      |
| lastRevisit  | DateTime? |                                  |
| confidence   | Int?      | 1-5 scale                        |

### StudySession

| Field          | Type      | Notes                          |
|----------------|-----------|--------------------------------|
| id             | Int       | @id @default(autoincrement())  |
| date           | DateTime  | @default(now())                |
| duration       | Int       | Minutes                        |
| problemsSolved | Int       |                                |
| topicId        | String?   | Optional FK to Topic           |
| notes          | String?   |                                |

### Resource

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | Int      | @id @default(autoincrement())      |
| title       | String   |                                    |
| url         | String   |                                    |
| type        | Enum     | VIDEO, ARTICLE, COURSE, TOOL       |
| source      | String   | "NeetCode", "MIT OCW", etc.        |
| topicId     | String?  | Optional FK to Topic               |
| description | String?  |                                    |

### Key decisions

- `Progress` is 1:1 with `Problem` — each problem has at most one progress record.
- `StudySession` is independent — optionally linked to a topic, not to specific problems.
- `Problem.order` field added for prev/next navigation within a topic.
- Enums: `Difficulty` (EASY, MEDIUM, HARD), `Status` (NOT_STARTED, ATTEMPTED, SOLVED, REVIEW), `ResourceType` (VIDEO, ARTICLE, COURSE, TOOL).

---

## Data Access Layer

### Prisma Client

`lib/db.ts` — standard singleton pattern for Next.js (prevents multiple instances in dev).

### Server Actions (`lib/actions/`)

No REST API routes. All data mutations go through Server Actions:

- **`progress.ts`**:
  - `updateProgress(problemId, { status, notes, confidence, timeSpent })` — upserts Progress record
  - `getProgressByTopic(topicId)` — returns all progress for a topic

- **`sessions.ts`**:
  - `createSession({ duration, problemsSolved, topicId, notes })` — creates StudySession
  - `getSessions(from?, to?)` — returns session history

- **`stats.ts`**:
  - `getStats()` — aggregated stats for dashboard
  - `getStreakData()` — consecutive days with activity
  - `getActivityData()` — data for heatmap calendar

### API Routes (exceptions)

- `api/data/route.ts` — GET exports all Progress + StudySession as JSON; POST imports/upserts from same format.

### Seed Data (`prisma/seed.ts`)

- 18 topics in exact NeetCode roadmap order with icons and colors.
- 150 problems with LeetCode URLs, YouTube URLs (exact VIDEO_ID where known, search fallback otherwise), difficulty, pattern, order within topic.
- ~17 external resources (YouTube channels, courses, tools, books).

---

## Layout & Navigation

### Root Layout (`app/layout.tsx`)

- Dark mode only — dark background (#0a0a0f), no theme toggle.
- Fonts: JetBrains Mono (code elements), Inter (UI text) via Google Fonts.
- Sidebar + main content area flex layout.

### Sidebar (`components/layout/Sidebar.tsx`) — Client Component

- Fixed left, 260px width on desktop.
- Collapsible on mobile via shadcn Sheet (drawer).
- Contents:
  - "DSA Grind" logo/title at top
  - Nav links: Dashboard, Roadmap, Resources, Statistics, Session
  - Active route highlighted
  - Mini progress bar at bottom (X/150 solved)

### Breadcrumbs (`components/layout/Breadcrumbs.tsx`)

- Displays on all pages below header area.
- Format: `Dashboard > Trees > Invert Binary Tree`
- Generated from URL segments + database lookups (slug → title).

### Keyboard Shortcuts (`hooks/useKeyboardShortcuts.ts`)

- `n` = next problem, `p` = previous problem (only on `/problem/[slug]`)
- `s` = open status dropdown (only on `/problem/[slug]`)
- Registered in root layout, contextually active.

---

## Pages

### Dashboard (`/`) — Server Component

- **Quick stats cards** at top: total solved, solved by difficulty (easy/med/hard), average time.
- **Topic progress bars** — 18 horizontal bars showing completion percentage per topic.
- **Streak tracker** — consecutive days with activity (based on Progress/StudySession dates).
- **Today's solved** — list of problems solved today.
- **Recommended next** — first unsolved problems by roadmap order (max 5).

### Roadmap (`/roadmap`) — Server Component

- **Vertical flowchart** — topics as nodes connected by vertical lines showing dependencies.
- Branching where topics can be studied in parallel (mirrors neetcode.io/roadmap structure).
- Each node: icon, title, X/Y solved, progress bar.
- Node color changes by progress: gray (0%) → yellow (in progress) → green (100%).
- Click navigates to `/topic/[slug]`.
- Implementation: CSS flex/grid with SVG lines for connections. Dependency graph hardcoded in config (`lib/constants.ts`) following neetcode.io/roadmap:
  - Arrays & Hashing → Two Pointers, Stack (parallel branches)
  - Two Pointers → Sliding Window
  - Stack → Binary Search
  - Sliding Window, Binary Search → Linked List (merge)
  - Linked List → Trees
  - Trees → Tries, Heap/Priority Queue, Backtracking (three branches)
  - Tries, Heap/PQ, Backtracking → Graphs (merge)
  - Graphs → Advanced Graphs, 1-D Dynamic Programming (two branches)
  - Advanced Graphs → (terminal)
  - 1-D DP → 2-D Dynamic Programming
  - 2-D DP → Greedy
  - Greedy → Intervals
  - Intervals → Math & Geometry
  - Math & Geometry → Bit Manipulation

### Topic (`/topic/[slug]`) — Server Component

- **Header**: topic name, icon, description, overall progress bar.
- **Problem table**: status indicator (icons), title (link to problem page), difficulty badge, LeetCode link, YouTube link, quick status change button (Client Component).
- **Filters** by status and difficulty (Client Component wrapper).
- **Sorting** by difficulty, status, or solved date.

### Problem (`/problem/[slug]`) — Mixed Server + Client

**Left/top panel:**
- YouTube iframe embed (responsive 16:9 aspect ratio).
- For search fallback URLs: "Search on YouTube" button instead of embed.

**Right/bottom panel:**
- Problem title, difficulty badge, pattern tag.
- External links: LeetCode (new tab), NeetCode.
- Status dropdown (Client) — NOT_STARTED, ATTEMPTED, SOLVED, REVIEW.
- Confidence slider 1-5 (Client).
- Timer — manual start/pause, records time spent (Client, Zustand store).
- Tiptap WYSIWYG editor for notes — toolbar: bold, italic, code, bullet list, heading. Auto-save with 1.5s debounce. Saves as HTML in Progress.notes.
- Hints section (expandable/collapsible).
- Prev/Next navigation within topic (based on Problem.order).

### Resources (`/resources`) — Server Component

- Grouped by type: YouTube Channels, Courses, Tools, Books.
- Each resource: title, description, link (new tab), source badge.
- All data from seed, static display.

### Stats (`/stats`) — Server Component + Client for charts

- **Recharts line chart**: solved count over time (by day).
- **react-activity-calendar**: GitHub-style activity heatmap.
- **Recharts pie/donut**: distribution by difficulty.
- **Review list**: problems with confidence < 3 or not attempted in 7+ days.
- **Average time by difficulty**.

### Session (`/session`) — Client Component

- **Pomodoro timer**: 25 min work / 5 min break / 15 min long break (every 4th). Configurable durations.
- **Audio notification** via Web Audio API (beep/chime) when timer expires, plus browser Notification if permission granted.
- **Session log**: records duration and problems worked on.
- **Daily goal tracker**: set target number of problems per day. Goal stored in localStorage (ephemeral, resets if cleared).

---

## Key Interactions

### Optimistic Updates

- Status, confidence, and notes changes update UI immediately.
- Server Action fires in background via `useTransition`.
- On failure, reverts to previous state.

### Timer Persistence

- Zustand store with persist middleware — timer survives page navigation.
- When user marks problem as SOLVED, prompt to save elapsed time to Progress.

### Export/Import

- `GET /api/data` — returns JSON with all Progress and StudySession records.
- `POST /api/data` — accepts same format, upserts into database.
- Accessible via button on Dashboard or in sidebar.

---

## Folder Structure

```
dsa-grind/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db                  # SQLite (gitignored)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── roadmap/page.tsx
│   │   ├── topic/[slug]/page.tsx
│   │   ├── problem/[slug]/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── session/page.tsx
│   │   └── api/
│   │       └── data/route.ts   # Export/import JSON
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── dashboard/
│   │   │   ├── ProgressOverview.tsx
│   │   │   ├── StreakTracker.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   └── RecommendedProblems.tsx
│   │   ├── roadmap/
│   │   │   ├── RoadmapFlow.tsx
│   │   │   └── TopicNode.tsx
│   │   ├── problem/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── ProblemInfo.tsx
│   │   │   ├── NotesEditor.tsx
│   │   │   ├── StatusSelector.tsx
│   │   │   ├── ConfidenceSlider.tsx
│   │   │   └── ProblemTimer.tsx
│   │   ├── topic/
│   │   │   ├── ProblemTable.tsx
│   │   │   └── TopicFilters.tsx
│   │   ├── stats/
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── ActivityHeatmap.tsx
│   │   │   ├── DifficultyPie.tsx
│   │   │   └── ReviewList.tsx
│   │   └── session/
│   │       ├── PomodoroTimer.tsx
│   │       ├── SessionLog.tsx
│   │       └── DailyGoal.tsx
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── utils.ts
│   │   ├── constants.ts        # Colors, icons, enums
│   │   └── actions/
│   │       ├── progress.ts
│   │       ├── sessions.ts
│   │       └── stats.ts
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useTimer.ts
│   └── store/
│       └── useAppStore.ts      # Zustand (timer, sidebar, UI state)
├── public/
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Dependencies

### Production
- `next`, `react`, `react-dom`
- `prisma`, `@prisma/client`
- `zustand`
- `recharts`
- `react-activity-calendar`
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`
- shadcn/ui components (card, badge, button, progress, tabs, dialog, dropdown-menu, tooltip, separator, scroll-area, sheet, slider)

### Dev
- `typescript`, `@types/node`, `@types/react`
- `vitest`, `@testing-library/react`
- `playwright`, `@playwright/test`
- `tailwindcss`, `postcss`, `autoprefixer`

---

## Seed Data Summary

### Topics (18)
Exact NeetCode roadmap order: Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Tries, Heap/Priority Queue, Backtracking, Graphs, Advanced Graphs, 1-D Dynamic Programming, 2-D Dynamic Programming, Greedy, Intervals, Math & Geometry, Bit Manipulation.

### Problems (150)
All problems from neetcode.io/practice with:
- Exact LeetCode titles and slugs
- Difficulty (EASY/MEDIUM/HARD)
- LeetCode URLs (`leetcode.com/problems/{slug}/`)
- YouTube URLs (exact NeetCode VIDEO_ID where known, `youtube.com/results?search_query=neetcode+{title}` as fallback)
- Algorithm pattern tags
- Order within topic

### Resources (17)
YouTube channels (NeetCode, Abdul Bari, William Fiset, Striver, freeCodeCamp, Back To Back SWE), courses (MIT 6.006, MIT 6.046), tools (VisuAlgo, Python Tutor, Big-O Cheat Sheet, LeetCode, neetcode.io), books (Algorithms by Jeff Erickson, Open Data Structures).
