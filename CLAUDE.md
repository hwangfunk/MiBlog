@AGENTS.md

# MiBlog

Personal blog platform with admin CMS, Supabase database, and JWT auth.

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
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only, bypasses RLS)

## Architecture

- **Framework**: Next.js 16 + React 19 + Tailwind CSS 4
- **Data storage**: Supabase (PostgreSQL) — `posts` table with unique `slug` constraint
- **Auth**: JWT sessions via `jose`, stored in HttpOnly cookies, validated by middleware (`src/proxy.ts`)
- **Admin CMS**: Rich text editor at `/admin/*`, protected by middleware
- **Server Actions**: `src/app/admin/actions.ts` handles CRUD + cache revalidation via `revalidatePath`
- **Styling**: Tailwind CSS 4 with `@tailwindcss/typography` for prose, dark theme, JetBrains Mono font (self-hosted)
- **Animations**: CSS keyframe animations for page transitions and staggered list reveals

## Key Files

- `src/proxy.ts` — Middleware matching `/admin/:path*` for route protection
- `src/lib/session.ts` — JWT session creation/verification, cookie management
- `src/lib/supabase.ts` — Supabase client (server-only, uses service role key)
- `src/lib/posts.ts` — CRUD operations via Supabase (`listPosts`, `getPostBySlug`, `savePost`, `deletePost`)
- `src/lib/sanitize.ts` — HTML sanitization and plain text extraction helpers
- `src/types/blog.ts` — `BlogPostSummary` and `BlogPost` interfaces
- `src/app/admin/actions.ts` — Server actions for post create/update/delete
- `src/app/admin/login/actions.ts` — Login server action
- `src/app/admin/components/PostEditor.tsx` — Rich text editor (dynamically imported)

## Code Style

- React 19: use `useActionState` (not `useFormState`), async `params`/`searchParams` in route handlers
- Server Components by default; `"use client"` only where needed (animations, forms, editor)
- Server Actions use `"use server"` directive
- Path alias: `@/*` maps to `./src/*`

## Gotchas

- Blog content is HTML sanitized via `isomorphic-dompurify` before rendering
- Posts use `id` (bigint PK) as stable identifier; slug can be changed safely via update
- Supabase client uses service role key (bypasses RLS) — protected with `import 'server-only'`
- `PostEditor` is dynamically imported with `ssr: false` because ReactQuill requires browser APIs
- `savePost` returns structured errors (`DUPLICATE_SLUG` | `DB_ERROR`), not boolean
