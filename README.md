# GoviyaNet Frontend

Farm-to-Table Direct Market Platform for Sri Lanka — React 18 + Vite + TypeScript.

## Quick Start

```bash
npm install
cp .env.example .env   # already configured for localhost:8080
npm run dev
```

## Stack

- React 18 + Vite + TypeScript (strict)
- Tailwind CSS v3 + shadcn/ui (Radix primitives)
- React Router v6, Zustand (persist), TanStack Query v5
- Axios (JWT + auto-refresh), React Hook Form + Zod
- Framer Motion, Recharts, Sonner, Lucide React

## Project Structure

```
src/
├── api/           # Axios client + service modules
├── components/
│   ├── ui/        # shadcn primitives
│   ├── shared/    # Logo, inputs, cards, badges, etc.
│   ├── layout/    # (Phase 4)
│   ├── farmer/    # (Phase 4+)
│   ├── buyer/
│   ├── rider/
│   └── admin/
├── hooks/
├── lib/           # utils, constants, animations
├── pages/
├── providers/
├── store/
├── styles/
└── types/
```

## Phases Completed

- **Phase 1**: Project setup, Tailwind theme, path aliases, env vars
- **Phase 2**: Types, API layer, auth store, React Query, utilities
- **Phase 3**: Shared UI components + shadcn primitives

## Next Phases

- Phase 4: Dashboard layout (navbar, sidebar, protected routes)
- Phase 5+: Role dashboards (farmer, buyer, rider, admin)
