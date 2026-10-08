# OpenPath Deployment

This project is a monorepo with four runtime pieces:

- `apps/web`: Next.js frontend, deploy to Vercel.
- `apps/api`: NestJS API, deploy as a long-running Node web service.
- `apps/worker`: BullMQ background worker, deploy as a long-running worker.
- `packages/db`: Prisma schema/client shared by the API and worker.

## Current Production Shape

The known frontend deployment is:

- Vercel: `https://open-path-delta.vercel.app`

The local `.env` points at managed services:

- Neon Postgres, region/host family: `ap-southeast-1.aws.neon.tech`
- Upstash Redis, but the saved hostname is no longer valid and must be replaced.

## Required Accounts

You need access to:

- Vercel project for `open-path-delta.vercel.app`
- GitHub repo `kruxshnx/OpenPath`
- Neon project containing the OpenPath database
- Upstash project, or a new Upstash Redis database
- GitHub OAuth app used by OpenPath sign-in

## Vercel Frontend

Recommended Vercel project settings:

- Framework: Next.js
- Root Directory: `apps/web`
- Install Command: `cd ../.. && npm ci`
- Build Command: `cd ../.. && npm run build -w @openpath/web`
- Output Directory: `.next`

Required environment variables:

```text
AUTH_SECRET=<same secret used for Auth.js>
NEXTAUTH_URL=https://open-path-delta.vercel.app
AUTH_URL=https://open-path-delta.vercel.app
GITHUB_CLIENT_ID=<github oauth client id>
GITHUB_CLIENT_SECRET=<github oauth client secret>
API_URL=https://<api-service-domain>
```

After deployment, this URL must return JSON instead of 404:

```text
https://open-path-delta.vercel.app/api/auth/session
```

## API Service

Deploy `apps/api` as a Node web service. The service must listen on `API_PORT` or
the platform-provided `PORT`.

Required environment variables:

```text
DATABASE_URL=<neon pooled or direct postgresql URL with sslmode=require>
REDIS_URL=<new valid Upstash rediss:// URL>
JWT_SECRET=<strong random secret>
ENCRYPTION_KEY=<strong random 32-byte-compatible secret>
WEB_ORIGIN=https://open-path-delta.vercel.app
API_PORT=<platform port if required, otherwise 4000>
```

Health check:

```text
https://<api-service-domain>/api/health
```

## Worker Service

Deploy `apps/worker` as a background worker using the same `DATABASE_URL`,
`REDIS_URL`, and `GITHUB_TOKEN`.

Required environment variables:

```text
DATABASE_URL=<same Neon URL>
REDIS_URL=<same Upstash rediss:// URL>
GITHUB_TOKEN=<GitHub token with read access for ingestion>
```

## GitHub OAuth

In the GitHub OAuth app, set:

```text
Homepage URL: https://open-path-delta.vercel.app
Authorization callback URL: https://open-path-delta.vercel.app/api/auth/callback/github
```

## Database

This repo now includes an initial Prisma migration under
`packages/db/prisma/migrations`.

For a new database:

```bash
npm run db:build
npm run -w @openpath/db migrate:deploy
npm run db:seed
```

For the existing Neon database, do not run destructive resets. If Prisma reports
that the database is not managed by Prisma Migrate, baseline the initial
migration instead of reapplying it.

## Quick Verification

After redeploying:

```bash
node -e "fetch('https://open-path-delta.vercel.app/api/auth/session').then(async r=>console.log(r.status, await r.text()))"
node -e "fetch('https://<api-service-domain>/api/health').then(async r=>console.log(r.status, await r.text()))"
node -e "fetch('https://open-path-delta.vercel.app/repositories').then(r=>console.log(r.status, r.url))"
```

