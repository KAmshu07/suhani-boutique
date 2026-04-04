# Suhani Boutique

Full-stack web app providing professional online presence, appointment booking, real-time order tracking, and admin dashboard for a home-based tailoring business in Raipur, Chhattisgarh.

## Stack

- **Next.js 16** — App Router, TypeScript, Server Components
- **Supabase** — PostgreSQL, Auth, Realtime, Storage
- **Tailwind CSS** — Design tokens from brand spec
- **Vercel** — Deployment

## Architecture

```
src/
├── data/        ← constants, types, translations, schemas (zero imports)
├── lib/         ← business logic, Supabase client, utilities
├── components/  ← reusable React components
└── app/         ← Next.js pages, layouts, API routes
```

Dependency flow: `data ← lib ← components ← app`. Lower layers never import upper layers.
