# MiBlog

A minimalist personal blog with a built-in admin CMS. Dark theme, monospace typography, smooth animations.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** with typography plugin
- **CSS animations** for page transitions
- **Supabase** for data storage
- **Jose** for JWT session auth

## Getting Started

```bash
pnpm install
pnpm dev
```

Requires a `.env.local` with:

```
SESSION_SECRET=<your-secret>
ADMIN_PASSWORD=<your-password>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
