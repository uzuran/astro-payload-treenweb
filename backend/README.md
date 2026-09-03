# @treenweb/backend

Payload CMS 3 running inside Next.js 15 (App Router) — **API + admin only**,
no public marketing routes. PostgreSQL via `@payloadcms/db-postgres`.

## Layout

```
src/
  payload.config.ts     buildConfig — collections, globals, db, editor
  env.ts                Zod-validated environment (fails fast on boot)
  lexical/allowlist.ts  single source of truth for the richtext feature set
  access/               pure access-control functions (unit-tested)
  fields/               reusable field configs (slug, seo)
  collections/          Pages, Posts, Media, Redirects, Users
  globals/              SiteSettings, Navigation
  seed/                 deterministic dev fixtures
  migrations/           generated SQL migrations (staging/prod)
  app/(payload)/        Payload-provided admin UI + REST/GraphQL route handlers
  app/health/           liveness probe (no DB)
payload-types.ts        generated, COMMITTED — consumed by @treenweb/schemas (Step 6)
```

## Commands

| Command                                              | Purpose                                      |
| ---------------------------------------------------- | -------------------------------------------- |
| `pnpm --filter @treenweb/backend dev`                | Next/Payload dev server on :3000             |
| `pnpm --filter @treenweb/backend build`              | `generate:types` + `next build` (standalone) |
| `pnpm --filter @treenweb/backend generate:types`     | regenerate `payload-types.ts`                |
| `pnpm --filter @treenweb/backend generate:importmap` | regenerate admin import map                  |
| `pnpm --filter @treenweb/backend migrate`            | run SQL migrations (staging/prod)            |
| `pnpm --filter @treenweb/backend seed`               | create admin user + sample pages             |
| `pnpm --filter @treenweb/backend test:unit`          | Vitest — access rules, utils                 |
| `pnpm --filter @treenweb/backend test:integration`   | Vitest — Payload API against a throwaway DB  |

Or from the repo root: `make up` (runs it in a container), `make seed`,
`make types`.

## Environment

- **In the compose stack** (`make up`): env is injected by
  `infra/docker-compose.dev.yml` — nothing else needed.
- **Running on the host**: `make env` copies the root `.env` to `backend/.env`
  (Next/Payload load it automatically). Change `@db:` to `@localhost:` in
  `DATABASE_URL` for host runs.

Key vars: `DATABASE_URL`, `PAYLOAD_SECRET` (≥32 chars), `PAYLOAD_DB_PUSH`
(`true` in dev only), `CORS_ORIGINS`, `CSRF_ORIGINS`. See `.env.example`.

## Migration policy (ADR 0002)

`PAYLOAD_DB_PUSH=true` syncs schema directly in local dev. Staging/prod set
it `false` and run generated migrations (`migrate:create` to author,
`migrate` to apply) — expand/contract only. Wired into CI in Step 10.

## Deferred

- **Sentry** wiring (`instrumentation.ts`, sourcemap upload) lands with CI in
  Step 10; config already sets `sendDefaultPii: false` intent.
- **S3 media storage** (`@payloadcms/storage-s3`) for prod lands in Step 11;
  dev uses local disk (`uploads/`, git-ignored).
- **Lexical feature list** is defined but not yet locked 1:1 to the
  serializer allowlist — that parity test is Step 7.
