@AGENTS.md

# MiBlog

Personal blog platform with admin CMS, file-based storage, and JWT auth.

## Commands

Package manager: **pnpm** (enforced via corepack)

```bash
pnpm install        # Install dependencies
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm start          # Start production server
pnpm lint           # Run ESLint
```

## Required Environment Variables

- `SESSION_SECRET` — JWT signing key (app throws if missing)
- `ADMIN_PASSWORD` — Admin login password (silently fails if missing)

## Architecture

- **Framework**: Next.js 16 + React 19 + Tailwind CSS 4
- **Data storage**: File-based — all posts live in `src/lib/data.json` (no database)
- **Auth**: JWT sessions via `jose`, stored in HttpOnly cookies, validated by middleware (`src/proxy.ts`)
- **Admin CMS**: Rich text editor at `/admin/*`, protected by middleware
- **Server Actions**: `src/app/admin/actions.ts` handles CRUD + cache revalidation via `revalidatePath`
- **Styling**: Tailwind CSS 4 with `@tailwindcss/typography` for prose, dark theme, JetBrains Mono font
- **Animations**: Framer Motion for page transitions and staggered list reveals

## Key Files

- `src/proxy.ts` — Middleware matching `/admin/:path*` for route protection
- `src/lib/session.ts` — JWT session creation/verification, cookie management
- `src/lib/posts.ts` — CRUD operations on `data.json` (sync file I/O)
- `src/lib/data.json` — Blog post data store
- `src/types/blog.ts` — `BlogPost` interface
- `src/app/admin/actions.ts` — Server actions for post create/update/delete
- `src/app/admin/login/actions.ts` — Login server action
- `src/app/admin/components/PostEditor.tsx` — Rich text editor (dynamically imported)

## Code Style

- React 19: use `useActionState` (not `useFormState`), async `params`/`searchParams` in route handlers
- Server Components by default; `"use client"` only where needed (animations, forms, editor)
- Server Actions use `"use server"` directive
- Path alias: `@/*` maps to `./src/*`

## Gotchas

- Blog content is raw HTML rendered via `dangerouslySetInnerHTML` — not sanitized
- Editing a post's slug deletes the old post and creates a new one (slug is the primary key)
- Posts use sync file I/O (`readFileSync`/`writeFileSync`) — works for low traffic, not scalable
- `PostEditor` is dynamically imported with `ssr: false` because ReactQuill requires browser APIs
