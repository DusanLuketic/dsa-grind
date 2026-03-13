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
