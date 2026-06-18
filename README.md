# OpenPath

Intelligent open-source contribution discovery & recommendation platform.

See [`TECHNICAL_PLAN.md`](./TECHNICAL_PLAN.md) for the architecture and roadmap,
and [`docs/RESEARCH.md`](./docs/RESEARCH.md) for the evaluation plan.

## Monorepo layout

```
apps/
  web/      Next.js frontend (port 3000)
  api/      NestJS API        (port 4000, prefix /api)
  worker/   BullMQ ingestion + scoring workers (rate-limited to GitHub's 5k/hr)
packages/
  db/       Prisma schema + shared PrismaClient (@openpath/db)
services/
  ml/       Python/FastAPI model service (port 8000) — Phase 5
```

## Prerequisites

- Node.js ≥ 20 (you have v24) and npm
- PostgreSQL + Redis (two options below)
- Python ≥ 3.11 (only for `services/ml`, later)

## Setup

```bash
npm install
cp .env.example .env        # then fill in values
```

### Database & Redis — pick one

**Option A — Docker (when installed):**
```bash
docker compose up -d        # starts postgres + redis with the .env defaults
```

**Option B — no Docker (zero local install):**
Use free managed tiers and paste the connection strings into `.env`:
- Postgres → [Neon](https://neon.tech) → set `DATABASE_URL`
- Redis → [Upstash](https://upstash.com) → set `REDIS_URL`

### Generate the Prisma client, build shared package, run migrations

```bash
npm run db:build            # prisma generate + compile @openpath/db
npm run db:migrate          # creates tables from the schema (needs the DB up)
```

## Run (three terminals)

```bash
npm run dev:api             # http://localhost:4000/api/health
npm run dev:web             # http://localhost:3000  (shows API status)
npm run dev:worker          # ingestion worker (needs Redis)
```

The web home page pings the API health endpoint — green means the API is up.

## Status

Phase 0 (foundations) — scaffold only. Next: GitHub OAuth, then Phase 1 ingestion.
