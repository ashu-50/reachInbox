# ReachInbox Backend (reachinbox-kimi)

New, isolated ReachInbox backend project. Node 20 LTS + TypeScript (ESM only) +
Express + PostgreSQL/Prisma + Redis/BullMQ + Elasticsearch + Nodemailer/Ethereal +
Google OAuth + Slack OAuth + Bull Board.

## What was verified in the build sandbox

- `npm run typecheck` — clean
- `npm run build` — clean
- `npm test` (vitest) — 19/19 passing, external services (Prisma/Redis/Slack/
  Elasticsearch/Ethereal) mocked
- `GET /health` — manually started the built app and confirmed the exact
  response shape
- No CommonJS (`require`/`module.exports`), no `any`/`@ts-ignore`/`@ts-nocheck`,
  no `/api/api` routes, no cron/`setInterval` scheduling, single route
  registration point (`src/routes/index.ts`)

## What was **not** verified in the build sandbox, and why

The sandbox this was built in has no Docker and a restricted network
allowlist that does not include `binaries.prisma.sh`. Two consequences:

1. **`npx prisma validate` / `generate` / `migrate dev` have never
   successfully run.** Prisma's CLI needs to download engine binaries from
   `binaries.prisma.sh` (403 Forbidden here). Because of this, `@prisma/client`
   fell back to an ungenerated stub whose `PrismaClient` type is literally
   `any` — meaning **every "clean typecheck" reported during the build did
   not actually check Prisma field/model usage against the schema.** I
   hand-verified every Prisma call against `prisma/schema.prisma` as I wrote
   it, but you must run the commands below yourself before trusting it.
2. **No live Postgres/Redis/Elasticsearch and no Docker**, so the actual
   campaign→queue→worker→send→search pipeline, Google/Slack OAuth flows, and
   Bull Board have only been exercised via mocked unit tests, never end to end.

## Setup (run these yourself, in order)

```bash
cd apps/backend
cp .env.example .env
# fill in GOOGLE_CLIENT_ID/SECRET, SLACK_CLIENT_ID/SECRET, SESSION_SECRET,
# and Ethereal creds (or leave Ethereal creds blank to auto-create a test
# account on send, provided the process has internet access)

npm install

# from repo root
docker compose -p reachinbox-kimi up -d

cd apps/backend
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init

npm run typecheck
npm run build
npm test

npm run build && npm start
# in another shell:
curl http://localhost:5100/health
```

Then verify per the original spec's Section 40 checklist: Postgres/Redis/
Elasticsearch connections, Google OAuth (`/api/auth/google`), campaign
creation, BullMQ job creation/processing, Ethereal send + preview URL,
`/api/emails/search`, rate limiting (send more than `hourlyLimit` in an
hour and confirm reschedule + Slack DM if Slack is connected), and Bull
Board at `/api/admin/queues` (requires a signed-in session).

## Known intentional deviation from the literal spec

Section 27 requires the Ethereal `previewUrl` to be available to the
dashboard API, but Section 13's `ScheduledEmail` field list doesn't include
a place to store it. I added two optional columns to make that possible:
`ScheduledEmail.providerMessageId` and `ScheduledEmail.previewUrl`. Everything
else follows the spec's field lists exactly.
