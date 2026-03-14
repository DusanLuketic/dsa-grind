# DSA Grind — Issues & Gotchas

## Known Compatibility Issues
- Tailwind v3 vs v4: create-next-app may install either. Check version and adapt config.
  - v3: tailwind.config.ts
  - v4: CSS @theme directive in globals.css
- react-activity-calendar React 19 compat: check, may need fallback SVG grid heatmap
- Prisma v6+: seed config in prisma.config.ts NOT package.json

## Windows Platform Notes
- Running on Windows — use Windows-compatible paths and commands
- PowerShell vs CMD — prefer npm scripts over raw bash

## YouTube CSP
- next.config.ts MUST allow: frame-src https://www.youtube.com https://www.youtube-nocookie.com

## Prisma SQLite
- No native enums — use String fields with validation at ORM level
- For Problem IDs: autoincrement (NOT cuid/uuid)
- Topic IDs: String @id (slug-based)

## CRITICAL: Prisma v7 Breaking Change
- Prisma v7.5.0 uses "client" engine type by default — requires adapter
- `new PrismaClient()` FAILS without adapter — throws PrismaClientInitializationError
- SOLUTION: Install `better-sqlite3 @prisma/adapter-better-sqlite3 @types/better-sqlite3`
- USAGE in db.ts:
  ```
  import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
  const prisma = new PrismaClient({ adapter })
  ```
- schema.prisma datasource block: NO url needed (URL is in prisma.config.ts)
- schema.prisma generator: `engineType = "library"` (though adapter approach is primary)
- Seed script: uses Node.js built-in sqlite (works fine — doesn't need Prisma adapter)
- Database location: project root ./dev.db (not prisma/dev.db)
- Packages installed: better-sqlite3, @prisma/adapter-better-sqlite3, @types/better-sqlite3

## Task 6 Status
- neetcode150.json: 150 problems downloaded to prisma/data/
- seed.ts: uses Node.js SQLite directly (working)
- Database seeded: 18 topics, 150 problems, 17 resources ✅
- Idempotent: skipDuplicates on createMany, upsert on topics
- YouTube URLs: all 150 problems have youtubeUrl (direct or search fallback)
