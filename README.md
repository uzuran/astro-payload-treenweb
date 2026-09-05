# astro-payload-treenweb

Secure, SEO-first web platform.

| Layer         | Tech                                           |
| ------------- | ---------------------------------------------- |
| Frontend      | Astro 5 (SSR, `@astrojs/node` standalone)      |
| Backend       | Payload CMS 3 on Next.js 15 (API + admin only) |
| Database      | PostgreSQL 16                                  |
| Monorepo      | pnpm workspace + (optional) Turborepo          |
| Edge          | Traefik v3 (TLS, security middlewares)         |
| Observability | Sentry (FE + BE), Plausible Analytics          |
| Validation    | Zod (env + API contracts)                      |
| Testing       | Vitest, Playwright, axe, Lighthouse CI         |
| CI/CD         | GitHub Actions → GHCR → Docker Compose         |

See **[docs/ANALYSIS.md](docs/ANALYSIS.md)** for the full architecture and the
11-step incremental build plan.

## Repository layout

```
frontend/          Astro 5 SSR site
backend/           Payload CMS 3 (Next.js 15) — API + admin
packages/
  schemas/         @treenweb/schemas   — Zod DTOs + generated Payload types
  richtext/        @treenweb/richtext  — Lexical safe serializer
  eslint-config/   @treenweb/eslint-config
  tsconfig/        @treenweb/tsconfig
infra/             Docker Compose, Traefik, Postgres, deploy scripts
tests/
  e2e/             Playwright + axe (cross-service)
  lighthouse/      Lighthouse CI budgets
docs/              ANALYSIS.md, ADRs, runbook
Makefile           task runner (wraps the pnpm scripts)
```

## Running the stack

Everything runs in local Docker containers via Docker Compose. Two modes —
pick one.

### Container mode (default)

`make up` runs the whole stack in containers: Postgres + Payload/Next
(`backend`) + Astro SSR (`frontend`). The workspace is bind-mounted, so both
apps hot-reload.

```bash
make setup   # one time: create .env + pnpm install
make up      # build + start Postgres, backend (:3000), frontend (:4321)
make seed    # dev admin + sample pages
make logs    # follow all three services   ·   make down   to stop
```

`.env` uses the compose service names here — `DATABASE_URL=…@db:5432`,
`PAYLOAD_INTERNAL_URL=http://backend:3000` (the defaults in `.env.example`).

### Host mode (only Postgres in Docker)

Apps run on the host, only Postgres runs in a container. Lighter — useful on
a low-memory machine or for attaching a debugger to an app directly.

```bash
make dev-setup   # one time: .env (rewritten for @localhost) + deps + Postgres + seed
make dev-db      # each session, if the Postgres container is not already up
make dev         # backend on :3000, frontend on :4321 (Ctrl-C to stop both)
```

Re-seed any time with `make dev-seed`. Stop the database with `make dev-db-down`
(the volume, and your data, survive). Host mode needs `DATABASE_URL` at
`@localhost:5432` and `PAYLOAD_INTERNAL_URL` at `http://localhost:3000` —
`make dev-setup` rewrites the compose service names when it creates `.env`.

### Endpoints (either mode)

| URL                                                              | What                                      |
| ---------------------------------------------------------------- | ----------------------------------------- |
| <http://localhost:4321>                                          | the site (Astro SSR, renders CMS content) |
| <http://localhost:4321/healthz> · `/robots.txt` · `/sitemap.xml` | infra endpoints                           |
| <http://localhost:3000/admin>                                    | Payload admin                             |
| `http://localhost:3000/api/*` · `/api/graphql`                   | CMS REST + GraphQL                        |

The seed creates a dev admin — `admin@treenweb.local` / `admin-dev-password`
— plus a published `/home` page and a `/draft-page` (the draft is hidden from
the public site and the sitemap). Until the seed runs, `/` returns HTTP 503
with a "home page has not been published yet" placeholder — that is expected.

The browser only ever talks to the frontend; Astro fetches the CMS
server-side over the internal Docker network (`PAYLOAD_INTERNAL_URL`).
`backend/payload-types.ts` is generated **and committed** — run `make types`
after changing the Payload config. See [backend/README.md](backend/README.md)
and [frontend/README.md](frontend/README.md).

## Prerequisites

- Docker + Docker Compose — the dev stack runs here
- Node **22** (`.nvmrc`) + pnpm **10** (via Corepack: `corepack enable`) —
  only needed for host mode and for running lint/tests/build on the host
- GNU Make (optional — every target just wraps a `pnpm` script)

## Quick start

```bash
make setup   # create .env, enable corepack, install deps
make check   # lint + format-check + typecheck + unit tests
```

## Make targets

`make` (or `make help`) prints the full list. Each target is a thin wrapper over
the matching `pnpm` script, so `make lint` and `pnpm lint` are equivalent.

| Target                                                                                               | Wraps                                                       |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `make setup`                                                                                         | create `.env` + `pnpm install`                              |
| `make install` / `make install-ci`                                                                   | `pnpm install [--frozen-lockfile]`                          |
| `make lint` / `make lint-fix`                                                                        | `pnpm lint[:fix]`                                           |
| `make format` / `make format-check`                                                                  | `pnpm format[:check]`                                       |
| `make typecheck`                                                                                     | `pnpm typecheck`                                            |
| `make check`                                                                                         | `pnpm check`                                                |
| `make test` / `test-unit` / `test-integration` / `test-e2e` / `test-a11y` / `test-lhci` / `test-all` | `pnpm test:*`                                               |
| `make build`                                                                                         | `pnpm build`                                                |
| `make up` / `down` / `logs` / `ps` / `reset`                                                         | container-mode dev stack (Compose)                          |
| `make seed`                                                                                          | seed the dev DB in container mode (admin user + pages)      |
| `make dev`                                                                                           | `pnpm dev` — run both app dev servers on the host           |
| `make dev-setup` / `dev-db` / `dev-db-down` / `dev-seed`                                              | host-mode: setup, start/stop Postgres, seed from the host   |
| `make types`                                                                                         | regenerate `backend/payload-types.ts`                       |
| `make psql`                                                                                          | psql shell on the dev DB                                    |
| `make env`                                                                                           | copy root `.env` → `backend/`, `frontend/` (host runs only) |
| `make clean`                                                                                         | remove build artifacts + `node_modules`                     |

## Common commands

| Command                                               | What it does                                           |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `pnpm install`                                        | Install the whole workspace (frozen lockfile in CI)    |
| `pnpm lint`                                           | ESLint across the workspace                            |
| `pnpm format`                                         | Prettier write · `pnpm format:check` to verify         |
| `pnpm typecheck`                                      | `tsc` per package (`--if-present`)                     |
| `pnpm test` / `test:unit`                             | Vitest unit suites (`--if-present`)                    |
| `pnpm test:integration`                               | Payload API integration tests (ephemeral Postgres)     |
| `pnpm test:e2e`                                       | Playwright end-to-end suite                            |
| `pnpm test:a11y`                                      | axe accessibility checks                               |
| `pnpm test:lhci`                                      | Lighthouse CI performance/SEO budgets                  |
| `pnpm test:all`                                       | unit → integration → e2e → a11y → lighthouse           |
| `pnpm build`                                          | Build every app                                        |
| `pnpm dev`                                            | Run every app's dev server in parallel                 |
| `pnpm dev:up` / `dev:down` / `dev:logs` / `dev:reset` | Dev Docker stack (Step 3)                              |
| `pnpm check`                                          | lint + format:check + typecheck + unit (pre-push gate) |

> `backend` and `frontend` are real. The shared `packages/*` still use
> placeholder scripts (they print which step implements them and exit `0`), so
> every command above runs green today.
