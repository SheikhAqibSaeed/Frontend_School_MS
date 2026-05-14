# Project structure

This app lives under `Frontend_School_MS` in the monorepo. The canonical full-repo tree is documented in the root `README.md` at `SchoolManagmentSystem/README.md`.

## Frontend layout (`src/`)

```
src/
├── app/                 # Next.js App Router (pages, layouts, API route handlers)
├── components/          # Shared UI (ui/, layout/, forms/)
├── services/            # API clients, Prisma db, auth helpers used by Route Handlers
│   └── api/             # Typed fetch helpers for external/backend API
├── hooks/               # Client hooks (e.g. useAuth, useApi)
├── store/               # Reserved for global client state
├── utils/               # cn(), dates, IDs, etc.
├── styles/              # Optional shared CSS beyond app/globals.css
└── middleware.ts        # Next.js middleware
```

Root-level items next to `src/`: `prisma/`, `public/` (static assets), `package.json`, `next.config.js`, `tailwind.config.ts`, `Dockerfile`.

## Backend counterpart

The Express API uses `Backend_School_MS` with `src/main.ts`, `src/routes`, `src/controllers`, and scaffold folders `src/modules/*`, `src/common/*`, `src/database/`. See root `README.md` for the full diagram.

## Development commands

```bash
npm install
npm run dev
npm run build
npm run start
npx prisma generate
npm run db:migrate
```
