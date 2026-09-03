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
.devcontainer/     Dev Container / Codespaces config
Makefile           task runner (wraps the pnpm scripts)
```

## Dev container / Codespaces

Open the repo in **GitHub Codespaces** or **VS Code Dev Containers** and the
environment (Node 22, pnpm, Docker-in-Docker, `gh`, extensions) is built for
you; `.devcontainer/post-create.sh` bootstraps `.env` and runs `pnpm install`.
Then start the stack with `make up` (from Step 3). See
[.devcontainer/README.md](.devcontainer/README.md) for details and how to
validate changes to that folder.

## Running the stack

`make up` runs everything in containers: Postgres + Payload/Next (`backend`) +
Astro SSR (`frontend`).

| URL                                                              | What                                      |
| ---------------------------------------------------------------- | ----------------------------------------- |
| <http://localhost:4321>                                          | the site (Astro SSR, renders CMS content) |
| <http://localhost:4321/healthz> · `/robots.txt` · `/sitemap.xml` | infra endpoints                           |
| <http://localhost:3000/admin>                                    | Payload admin                             |
| `http://localhost:3000/api/*` · `/api/graphql`                   | CMS REST + GraphQL                        |

`make seed` creates a dev admin — `admin@treenweb.local` /
`admin-dev-password` — plus a published `/home` page and a `/draft-page`
(the draft is hidden from the public site and the sitemap).

The browser only ever talks to the frontend; Astro fetches the CMS
server-side over the internal Docker network (`PAYLOAD_INTERNAL_URL`).
`backend/payload-types.ts` is generated **and committed** — run `make types`
after changing the Payload config. See [backend/README.md](backend/README.md)
and [frontend/README.md](frontend/README.md).

## Prerequisites

- Node **22** (`.nvmrc`) — enforced via `engine-strict`
- pnpm **10** (via Corepack: `corepack enable`)
- Docker + Docker Compose (for the dev stack, added in Step 3)
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
| `make dev`                                                                                           | `pnpm dev`                                                  |
| `make up` / `down` / `logs` / `ps` / `reset`                                                         | dev Docker stack                                            |
| `make seed`                                                                                          | seed the dev DB (admin user + pages)                        |
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
