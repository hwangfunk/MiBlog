<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent Guidelines

- **Always use pnpm**, never npm or yarn. The project enforces pnpm via corepack.
- Before modifying Next.js pages/routes, consult `node_modules/next/dist/docs/01-app/` for App Router docs.
- Blog post data lives in Supabase (PostgreSQL). All CRUD goes through `src/lib/posts.ts`.
- Admin routes are protected by middleware in `src/proxy.ts`. Auth logic is in `src/lib/session.ts`.
- When adding new admin pages, they are auto-protected by the middleware matcher `/admin/:path*`.
- Use Server Components by default. Only add `"use client"` when the component needs browser APIs, hooks, or event handlers.
- Run `pnpm build` to verify changes compile before finishing.
