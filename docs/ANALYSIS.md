# ANALYSIS & PREPARATION PLAN — astro-payload-treenweb

Secure, SEO-first web platform.

**Stack:** Astro 5 SSR · Payload CMS 3 (Next.js 15) · PostgreSQL 16 · pnpm
workspace · Docker Compose · Traefik v3 · Sentry · Plausible · Zod ·
Lexical safe serializer · Playwright + Lighthouse · GitHub Actions ·
Node 22 toolchain.

---

## PART 1 — FULL-STACK ANALYSIS

### 1.1 Version compatibility

| Layer              | Target                                                       | Notes                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js            | **22.x LTS**                                                 | Astro 5 needs `18.20.8 \|\| 20.3 \|\| >=22`; Next 15 `>=18.18`; Payload 3 `^18.20.2 \|\| >=20.9`. Node 22 satisfies all. Avoid odd releases (19/21/23) — Astro rejects them. |
| pnpm               | **10.x**                                                     | Corepack, `packageManager` pins exact. `pnpm deploy` for pruned prod installs.                                                                                               |
| Astro              | **5.x**                                                      | `output: 'server'`, adapter `@astrojs/node` standalone.                                                                                                                      |
| Payload CMS        | **3.x**                                                      | Runs inside Next.js 15. `@payloadcms/db-postgres` (Drizzle). `@payloadcms/richtext-lexical`.                                                                                 |
| Next.js            | **15.x**                                                     | Host for Payload only. `output: 'standalone'`. React 19.                                                                                                                     |
| React              | **19.x**                                                     | Backend mandates it; Astro islands align via `pnpm.overrides`.                                                                                                               |
| PostgreSQL         | **16.x**                                                     | `postgres:16-alpine`. Least-privilege app role, not `postgres`.                                                                                                              |
| Traefik            | **v3.x**                                                     | v3 config syntax; pin minor.                                                                                                                                                 |
| Sentry             | `@sentry/astro` + `@sentry/nextjs`                           | `sendDefaultPii: false`; CI sourcemap upload.                                                                                                                                |
| Plausible          | script + optional first-party proxy                          | Survive adblock via `/js/script.js` proxy.                                                                                                                                   |
| Zod                | **3.23+** (decision pending — see ADR 0002)                  | Env + contract validation.                                                                                                                                                   |
| Lexical serializer | `@payloadcms/richtext-lexical` + `sanitize-html` / DOMPurify | Allowlist + sanitize.                                                                                                                                                        |
| Playwright         | latest                                                       | E2E + `@axe-core/playwright`.                                                                                                                                                |
| Lighthouse         | `@lhci/cli`                                                  | Run vs built `astro preview`.                                                                                                                                                |
| Turborepo          | optional (decision pending)                                  | Task graph + CI cache.                                                                                                                                                       |

**Headline risks**

1. **pnpm strict isolation vs Next/Payload** — targeted `public-hoist-pattern`
   in `.npmrc` (not `shamefully-hoist`); validate `pnpm i --frozen-lockfile`
   - `next build` in CI from day one.
2. **Duplicate React** in Astro islands — `pnpm.overrides` pin `react` +
   `react-dom`.
3. **Drizzle migration mode** — `push: true` dev only; generated SQL
   migrations + `payload migrate` in staging/prod.
4. **Odd Node in CI** — pin `actions/setup-node` to `22` explicitly.
5. **ESM everywhere** — all config `.mjs`/`.ts`, `"type": "module"`.

### 1.2 Recommended configurations

- **Root:** `private`, `packageManager` pinned, `engines.node >=22`,
  `.npmrc` (`engine-strict`, `auto-install-peers`, targeted hoist),
  `tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`,
  `moduleResolution: bundler`), shared config packages.
- **Astro:** `output: 'server'`, `adapter: node({ mode: 'standalone' })`,
  `site` set, `@astrojs/sitemap`, `security.checkOrigin: true`, env split
  `PUBLIC_*` vs server-only, `PAYLOAD_INTERNAL_URL` (docker service name)
  vs `PUBLIC_SITE_URL`.
- **Payload:** `postgresAdapter` (`push` dev only), strong `PAYLOAD_SECRET`,
  explicit `cors`/`csrf` allowlists, secure cookies, `maxLoginAttempts` +
  lockout, GraphQL playground/introspection off in prod, Lexical feature
  allowlist, committed generated types, S3 storage in prod, `sharp` on.
- **Next:** `withPayload()`, `output: 'standalone'`, `poweredByHeader: false`,
  fallback security headers.
- **PostgreSQL:** secrets for creds, no host port in prod, daily `pg_dump`
  → object storage, tested restore.
- **Traefik v3:** static (`traefik.yml`) entrypoints + ACME + providers;
  dynamic (`dynamic/*.yml`) middleware chain (HSTS, secure headers,
  rate-limit, compress, CSP, optional admin allowlist), TLS 1.2+ (prefer
  1.3) with curated ciphers + `sniStrict`.
- **Sentry:** low prod sample rates, `beforeSend` PII scrub, `environment` +
  `release` (git SHA), CI uploads then discards sourcemaps.
- **Zod:** one `env.ts` per app parsed at boot (fail fast); shared DTO
  schemas in `@treenweb/schemas`.

### 1.3 Security considerations

- **Edge (Traefik):** force HTTPS, HSTS preload, TLS 1.2+/1.3, global +
  targeted rate limits (`/admin`, `/api/*/login`), full security headers,
  tuned CSP (self + Plausible + Sentry ingest, hashed inline styles),
  optional IP allowlist / forward-auth for admin, dashboard off public
  entrypoints.
- **Payload:** secrets via files, explicit CORS/CSRF, `httpOnly`+`secure`+
  `sameSite=Lax` cookies, login lockout, 2FA for admins (plugin),
  field-level access default-deny, public read only on published content,
  GraphQL playground/introspection off, Zod-validate every custom endpoint,
  restrict upload mime/size, re-encode images to strip metadata.
- **Astro:** SSR fetches Payload only over internal network, never proxies
  client-controlled URLs; `checkOrigin` on; escape by default; richtext via
  `@treenweb/richtext` only; no secrets in `PUBLIC_*` (CI grep gate); SRI on
  any non-first-party script.
- **Data/infra:** Postgres not internet-exposed, least-privilege role,
  encrypted + tested backups; images `node:22-slim`/distroless, non-root
  `USER`, no build tools in final stage, `HEALTHCHECK`, read-only FS +
  tmpfs, `cap_drop: [ALL]`, `no-new-privileges`; `pnpm audit` + Renovate,
  `--frozen-lockfile` in CI; GH Actions pinned by SHA, minimal token
  permissions, secrets in protected Environments.
- **SEO correctness:** real status codes (404/410/301), canonical, robots,
  sitemap filtered to published, JSON-LD, OG/Twitter, hreflang if multi,
  stable slugs + redirect map, `Cache-Control`/`ETag`, sized images.

**Secrets inventory:** `PAYLOAD_SECRET`, `DATABASE_URL` /
`POSTGRES_PASSWORD`, `SENTRY_DSN` (x2), `SENTRY_AUTH_TOKEN`, `PLAUSIBLE_*`,
S3 keys, ACME email/DNS token, deploy SSH key, GHCR token.

### 1.4 Folder architecture principles

Two deployable apps (`frontend`, `backend`) + shared packages
(`packages/*`) + infra (`infra/`) + cross-service tests (`tests/`).
Per-app tests live in the app; only cross-service E2E/Lighthouse live in
root `tests/`. Infra never imports app code. `packages/schemas` is the only
place Payload-generated types are re-exported. Every app owns its
Dockerfile; compose files live in `infra/`.

### 1.5 Build pipeline design

```
install (frozen lockfile)
  -> codegen (backend payload generate:types -> packages/schemas)
     -> typecheck / lint / test:unit
        -> build:backend (next build standalone)
        -> build:frontend (astro build node standalone)
           -> test:e2e + test:a11y (composed stack)
           -> test:lhci (astro preview)
              -> docker:build (multi-stage) -> docker:push (GHCR: <sha>, latest on main)
```

Caching: Turbo remote cache (if adopted) + Docker layer cache
(`buildx --cache-to/from=type=gha`). Determinism: frozen lockfile,
`.dockerignore`, base images pinned by digest. Dockerfile stages:
`deps` -> `build` -> `prune` (`pnpm deploy --prod`) -> `runtime`
(slim/distroless, non-root, `HEALTHCHECK`).

### 1.6 Deployment pipeline design

- **PR** -> `ci`: install, codegen, lint, typecheck, unit, build, e2e
  (ephemeral compose), lighthouse. Blocking.
- **Merge to main** -> `release`: build + push images (`<sha>` + `latest`),
  Sentry release + sourcemaps, then `deploy` to staging.
- **Deploy job (single host, Compose):** connect via `docker context` over
  SSH; `pg_dump` snapshot; run migration one-shot
  (`docker compose run --rm backend pnpm payload migrate`) as a hard gate;
  `docker compose pull && up -d`; health gate on Traefik routes; smoke
  test; mark Sentry deploy; notify.
- **Rollback:** re-`up -d` previous `<sha>`; migrations authored
  expand/contract so old image runs on new schema; irreversible migrations
  gated behind manual approval.
- **Environments:** development, preview (optional per-PR), staging
  (auto from main), production (manual approval).

### 1.7 Testing strategy

| Level          | Tool                                 | Scope                                                                 | CI gate                        |
| -------------- | ------------------------------------ | --------------------------------------------------------------------- | ------------------------------ |
| Static         | tsc, ESLint, Prettier, `astro check` | types/lint/format                                                     | blocking                       |
| Env/contract   | Vitest                               | env schemas parse; DTO round-trip; Payload↔schemas parity             | blocking                       |
| Unit           | Vitest                               | Lexical serializer (XSS corpus), utils, SEO builders, access rules    | blocking                       |
| Integration    | Vitest + ephemeral PG                | Payload REST/local API, auth, access, draft/publish, endpoint Zod     | blocking                       |
| E2E            | Playwright                           | render from real CMS data, nav, 404/redirect, form, admin login smoke | blocking                       |
| A11y           | `@axe-core/playwright`               | WCAG 2.1 AA key templates                                             | blocking (no serious/critical) |
| Perf/SEO       | Lighthouse CI                        | Perf>=90, SEO>=95, A11y>=95, BP>=95; LCP<2.5s, CLS<0.1, TBT<200ms     | blocking on regression         |
| Visual (opt)   | Playwright screenshots               | template snapshots                                                    | non-blocking initially         |
| Security (opt) | `pnpm audit`, Trivy, ZAP baseline    | deps + image + running app                                            | scheduled                      |

Deterministic `seed` script (Payload local API) feeds E2E/Lighthouse;
disposable DB seeded fresh each run. Playwright waits on healthchecks,
retries=2 in CI only, explicit locators.

### 1.8 Containerization strategy

- **Dev (`docker-compose.dev.yml`):** `db` (127.0.0.1:5432), `backend`
  (`next dev`, bind mount, `push:true`), `frontend` (`astro dev`), optional
  `traefik`, optional `plausible`, optional `mailpit`. `node_modules` in
  named volumes. Hot reload both apps.
- **Prod (`docker-compose.prod.yml`):** `traefik` (80/443, ACME volume,
  read-only socket via socket-proxy), `backend` + `frontend` from GHCR
  `<sha>` images (standalone, non-root), `db` (no host port, secrets,
  backup sidecar), optional `plausible`. Every service:
  `restart: unless-stopped`, `HEALTHCHECK`, `read_only` + `tmpfs`,
  `cap_drop: [ALL]`, `no-new-privileges`, resource limits, log rotation.
  Secrets via `secrets:` files.
- **Shared:** `docker-compose.yml` base + `*.dev.yml`/`*.prod.yml`
  overrides; `.dockerignore` per app; base images pinned by digest.

### 1.9 Networking topology

```
Internet :80/:443
   |
Traefik v3  (TLS 1.3, ACME; middlewares: sec-headers, rate-limit, compress, csp)
   |  network: edge                         |  network: edge
Host: treenweb.example                      Host: cms.treenweb.example
   |                                        |
frontend (Astro 5 SSR :4321) --SSR fetch--> backend (Next 15 + Payload 3 :3000)
   |  (no DB access)             network: internal        |  network: internal
   +------------------------------------------------> PostgreSQL 16 :5432
                                                     (internal ONLY, no host port in prod)
```

Rules: browser talks only to Traefik. Astro SSR -> Payload via
`http://backend:3000` on the internal network (never hairpin through
public DNS). Browser -> Payload API uses public `PUBLIC_CMS_URL`, subject
to CORS/CSRF allowlist = only `PUBLIC_SITE_URL`. Only `backend` reaches
`db`; put `frontend`+`backend` on `edge`, `backend`+`db` on `internal`,
`frontend` never on `internal`. `exposedByDefault=false`; `db` unlabelled.
Subdomain routing recommended over path routing (cleaner CSP + cookie
scoping). Plausible via its own route or first-party proxy.

---

## PART 2 — REPOSITORY STRUCTURE

```
astro-payload-treenweb/
├── .github/workflows/       ci.yml, release.yml, codeql.yml            (Step 10)
├── frontend/                Astro 5 SSR site                           (Step 5)
│   ├── src/{pages,layouts,components,lib,middleware.ts,env.ts,styles}
│   ├── public/              robots.txt, favicons, og images
│   ├── astro.config.mjs, sentry.*.config.ts, Dockerfile, package.json
├── backend/                 Payload CMS 3 in Next.js 15 (API + admin)  (Step 4)
│   ├── src/{app,collections,fields,access,endpoints,hooks,lexical,migrations,seed}
│   ├── payload.config.ts, payload-types.ts, next.config.mjs
│   ├── instrumentation.ts, Dockerfile, package.json
├── packages/
│   ├── schemas/             @treenweb/schemas  (Zod DTOs + payload-types) (Step 6)
│   ├── richtext/            @treenweb/richtext (Lexical safe serializer)  (Step 7)
│   ├── eslint-config/       @treenweb/eslint-config
│   └── tsconfig/            @treenweb/tsconfig (base.json)
├── infra/
│   ├── docker-compose.yml / .dev.yml / .prod.yml                  (Step 3 / 11)
│   ├── traefik/{traefik.yml,dynamic/*}                            (Step 8)
│   ├── postgres/{init,backup}                                     (Step 3 / 11)
│   ├── plausible/                                                 (Step 8)
│   ├── secrets/.gitkeep
│   └── scripts/{deploy.sh,rollback.sh}                            (Step 10)
├── tests/
│   ├── e2e/                 Playwright + axe (cross-service)            (Step 9)
│   └── lighthouse/          Lighthouse CI budgets                      (Step 9)
├── docs/                    ANALYSIS.md, ADR/, RUNBOOK.md, SECURITY.md
├── .editorconfig .gitignore .npmrc .nvmrc .node-version
├── .prettierrc.json .prettierignore eslint.config.mjs
├── package.json  pnpm-workspace.yaml  tsconfig.base.json  tsconfig.json
└── .env.example
```

All workspace packages scoped `@treenweb/*`. Apps are `private`, never
published.

---

## PART 3 — STEP-BY-STEP BUILD PLAN

Each step: **Goals · Risks · Testing procedure · Debug procedure ·
Expected output**. Steps are additive; one PR per step; CI green before
merge.

### Step 1 — Workspace + folder structure ✅ (this PR)

**Goals** — pnpm workspace; root config (`package.json`,
`pnpm-workspace.yaml`, `.npmrc`, `tsconfig.base.json`, ESLint flat config,
Prettier, `.editorconfig`, `.gitignore`, `.nvmrc`); all app/package/test
directories with placeholder `package.json` + README; `.env.example`;
`docs/ANALYSIS.md` + seed ADRs; every root script wired
(`lint`, `format`, `typecheck`, `test:unit|integration|e2e|a11y|lhci`,
`test:all`, `build`, `dev`, `dev:up|down|logs|reset`, `check`).

**Risks** — pnpm hoisting surprises (mitigate via `.npmrc`); Node drift
(local 24 vs target 22 — `engines.node >=22` so both pass, `.nvmrc` pins
the version); TS alias inconsistency (single base config); premature Turbo
noise (deferred to ADR 0002).

**Testing procedure**

- Clean `pnpm install` succeeds and writes `pnpm-lock.yaml`.
- `pnpm -r exec node -p "process.version"` prints v22 (v24 acceptable on the
  host as long as `engines.node >=22` passes).
- `pnpm lint`, `pnpm format:check`, `pnpm typecheck` exit 0.
- `pnpm test:unit`, `test:integration`, `test:e2e`, `test:a11y`,
  `test:lhci`, `test:all`, `build` all exit 0 (placeholder echoes).
- `pnpm check` exits 0.

**Debug procedure** — install failure: `pnpm install --reporter=append-only`,
check workspace globs. Wrong Node: `corepack enable`, verify image tag.
Alias resolution: `tsc --traceResolution | grep <alias>`. Script not found:
confirm `--if-present` and package `name`/`scripts`.

**Expected output** — reproducible `pnpm install`; lint/format/typecheck
wired and green; every test/build command runs green via placeholders;
repo tree matches Part 2.

### Step 2 — Local dev toolchain

**Goals** — Node 22 (`.nvmrc` / `.node-version`), pnpm 10 via Corepack
(`packageManager` pinned, `COREPACK_ENABLE_DOWNLOAD_PROMPT=0`), Docker +
Docker Compose on the host; `Makefile` wrapping every `pnpm` script;
`make setup` bootstraps `.env` from `.env.example` and runs `pnpm install`;
`.env.example` documents container-mode vs host-mode host names.

**Risks** — Corepack signature errors (pin exact pnpm); host/container
native-module mismatch for bind-mounted `node_modules` (keep both on
linux/amd64, or use named volumes); apps not binding `0.0.0.0` inside
containers; port clashes on 4321/3000/5432.

**Testing** — `corepack enable` then `pnpm -v` prints the pinned version;
`pnpm install` is reproducible; `docker compose version` works;
`make help` lists every target.

**Debug** — `pnpm install --reporter=append-only`; `docker info` for the
daemon; `ss -tlnp` for port owners; confirm `HOST=0.0.0.0` in the app dev
scripts.

**Expected output** — a fresh clone reaches a running stack with
`make setup && make up` (or `make dev-setup && make dev` for host mode).

### Step 3 — Docker Compose (dev)

**Goals** — `infra/docker-compose.yml` base + `docker-compose.dev.yml`
override: `db` (postgres:16-alpine, volume, `127.0.0.1:5432`), `backend`
(`pnpm --filter @treenweb/backend dev`, source + `node_modules` volume),
`frontend` (`pnpm --filter @treenweb/frontend dev`,
`PAYLOAD_INTERNAL_URL=http://backend:3000`), optional `traefik` with
`*.localhost` hosts. Healthchecks (`pg_isready`, `/api/access`,
`/healthz`); `depends_on: service_healthy`. Scripts `dev:up/down/logs/psql/
reset`.

**Risks** — apps not built until Steps 4–5 (deliver compose files + verify
`db`; optionally stub tiny servers); host port 5432 clash; bind-mount vs
container `node_modules` (named volume); HMR not firing in containers
(polling, dev-only); `*.localhost` resolution (`/etc/hosts` fallback).

**Testing** — `pnpm dev:up` -> `db` healthy; `pnpm dev:psql -c 'select
version();'` -> PG 16; `pnpm dev:reset` recreates clean db; internal DNS:
frontend container can `wget http://backend:3000`; `docker compose config`
validates merged files.

**Debug** — `docker compose logs <svc>`; exec in and run healthcheck
manually; check `DATABASE_URL` host = `db`; `docker compose -f base -f dev
config`; volume ownership vs container `USER`.

**Expected output** — `pnpm dev:up` brings up healthy Postgres with proven
internal DNS; reproducible reset.

### Step 4 — Payload CMS skeleton (`backend/`)

**Goals** — Next 15 App Router hosting Payload 3, `output: 'standalone'`,
`withPayload()`; `payload.config.ts` (`postgresAdapter` `push:true` dev,
`lexicalEditor` allowlist, Zod-`PAYLOAD_SECRET`, `cors`/`csrf`);
collections `Users` (auth + lockout), `Media` (upload allowlist + sharp),
`Pages`, `Posts`, `Redirects`; globals `SiteSettings`, `Navigation`;
`access/` pure functions (public read only when published);
`payload generate:types` committed -> wired into `@treenweb/schemas`;
`seed/` fixtures; multi-stage non-root Dockerfile + healthcheck; Sentry
(`instrumentation.ts`, `sendDefaultPii:false`).

**Risks** — Payload/Next/React peer friction under pnpm (verify clean
install + build, add hoist patterns/overrides, pin exact); `push:true`
masking migrations (also generate + commit an initial migration, CI runs
`payload migrate` on fresh DB); over-permissive access (write access tests
first); admin bundle build memory (raise `--max-old-space-size`, build in
Docker); default secret (fail boot if missing/short); editor↔serializer
allowlist drift (single `lexical/allowlist.ts`).

**Testing** — `/admin` loads, first-user creation works; integration
(Vitest + ephemeral PG): CRUD, unauth GET returns only published, draft
hidden, login lockout after N, custom endpoint rejects bad payload;
`payload generate:types` no diff in CI; `build` + Docker `run` serves
`/api/access` 200 as non-root; `payload migrate` on empty DB, re-run no-op.

**Debug** — `docker compose logs backend`, browser console; check
`PAYLOAD_SECRET`, DB reachability, env split; `payload migrate:status`;
dev `migrate:fresh` to reset; `pnpm why next react`; add failing Vitest for
any access leak.

**Expected output** — running admin + REST/GraphQL API on Postgres, seeded
content, committed types + initial migration, green access + integration
tests, hardened buildable image.

### Step 5 — Astro SSR skeleton (`frontend/`)

**Goals** — Astro 5 `output:'server'` + `@astrojs/node` standalone,
`site` set, `@astrojs/sitemap`, `@astrojs/react` (islands), Sentry;
`lib/payload/` typed client on `PAYLOAD_INTERNAL_URL` with timeouts +
Sentry breadcrumbs; routes `index`, `[...slug]` (real 404 via
`Astro.response.status`), `posts/[slug]`, `404`, `healthz`, `robots.txt`,
sitemap filtered to published; `lib/seo/` (`<SeoHead>` + JSON-LD);
`middleware.ts` (`checkOrigin`, fallback headers, cache headers, Sentry);
Zod `env.ts`; multi-stage non-root Dockerfile + healthcheck; richtext via
`@treenweb/richtext` (passthrough placeholder until Step 7).

**Risks** — SSR fetch before backend healthy (client timeout + graceful
degradation, `depends_on` healthy); secret leak via `PUBLIC_*` (CI grep
gate); SSR caching too aggressive (conservative defaults + per-route
override); CLS/LCP from unsized images/late fonts (enforce dimensions,
`font-display: swap`); island hydration cost (default zero-JS,
`client:visible/idle`); duplicate React (`pnpm.overrides`).

**Testing** — dev renders home + a seeded page; unknown slug -> HTTP 404
(verify status); `astro check` + `tsc` clean; Vitest for SEO builders;
`build` + `preview` + `curl -I` headers/status; Docker `run` serves
`/healthz` 200 non-root, reaches `backend` by service name;
`sitemap.xml` only published, `robots.txt` correct.

**Debug** — check `PAYLOAD_INTERNAL_URL` (service name not localhost),
network membership, backend health; `curl` backend from inside frontend
container; confirm `Astro.response.status` set before return; view-source
for SEO tags (not devtools DOM); `NODE_OPTIONS=--max-old-space-size=4096`.

**Expected output** — SSR site rendering live CMS content with correct HTTP
semantics, SEO head + JSON-LD, sitemap/robots, health endpoint, hardened
image; `pnpm dev:up` serves the full stack.

### Step 6 — API contracts + Zod validation

**Goals** — `packages/schemas`: env schemas (both apps), DTO schemas for
every boundary + custom endpoint, re-export `payload-types` + parity
helpers. Backend endpoints parse input with shared DTOs; frontend validates
responses at the boundary (fail -> Sentry + fallback, never render
unvalidated). Contract test: Zod DTOs structurally compatible with
generated types. `env.ts` in each app imports from `@treenweb/schemas`,
boot fails fast with a readable list.

**Risks** — schema/type drift (verify against `payload-types` in a test,
single source for shared enums); over-strict schemas on optional CMS fields
(model `nullable`/`optional` deliberately, validate a real snapshot in CI);
per-request validation perf (lean schemas, `.passthrough()` for
non-critical nested blocks); Zod 3 vs 4 lock-in (ADR 0002).

**Testing** — Vitest: valid fixture passes, malformed fails with expected
issues; env schema rejects missing `PAYLOAD_SECRET`; type test
(`expectTypeOf` / `satisfies`) compiles; integration: bad body -> 400 Zod
shape, good -> 200 matching schema; boot test: missing var -> non-zero exit
with clear message; CI validates a live API response fixture.

**Debug** — log `result.error.issues` (path + code), compare to
`payload-types`; `payload generate:types` + reconcile; format env issues as
`key: message` lines; snapshot response and diff against schema.

**Expected output** — single typed contract layer both apps depend on;
every boundary validated; boot-time env safety; tests that fail if CMS
schema and contracts diverge.

### Step 7 — Lexical safe serializer (`packages/richtext`)

**Goals** — convert Payload Lexical JSON -> HTML/AST with a strict
node/mark allowlist matching `backend/src/lexical/allowlist.ts`; URL
sanitisation (`http`/`https`/`mailto`/`tel` only, no `javascript:`/`data:`),
`rel="noopener noreferrer"` + target policy on external links; final pass
through `sanitize-html` / DOMPurify+jsdom mirroring the allowlist; unknown
nodes dropped (logged once), never raw; Astro `<RichText nodes={...}/>`
component; XSS test corpus.

**Risks** — editor/serializer node mismatch (shared allowlist module +
parity test); sanitizer stripping legit content (explicit per-tag attr
allowlist, test with real fixtures); bypass via nested/exotic nodes (fuzz
malformed JSON, assert no `<script>`/`on*=`/`javascript:`); perf on long
docs (benchmark, memoize, use `URL` not regex); `data:` image URIs
(disallow; only `Media` relation -> resolved URL).

**Testing** — Vitest corpus: output contains none of `<script`, `onerror=`,
`javascript:`, `<iframe`, `<object`, `<foreignObject`; snapshot benign;
property test on random node trees; parity test
(`editor === serializer === sanitizer` allowlist); integration: Post with
link + image + list renders with correct `rel`/`target`/resolved URL;
bench 100KB doc under budget.

**Debug** — bisect converter output vs post-sanitizer output; check
allowlist for missing node/attr; unit-test the URL sanitizer in isolation;
confirm editor/serializer parity if unknown-node Sentry spam.

**Expected output** — shared, unit-hardened richtext pipeline with proven
XSS resistance and allowlist parity, wired into Astro `<RichText>`.

### Step 8 — Traefik + security middlewares

**Goals** — `traefik.yml` static (entrypoints `web`->redirect,
`websecure`; providers docker `exposedByDefault:false` + file; ACME
HTTP-01 or DNS-01; JSON access log; dashboard internal + authed);
`dynamic/middlewares.yml` (`security-headers` HSTS 2y preload
includeSubDomains + `frameDeny` + `contentTypeNosniff` + `referrerPolicy` +
`permissionsPolicy`; `rate-limit` avg/burst on real IP; `compress`; `csp`
per-route; optional `admin-ipallowlist`/`forward-auth`);
`dynamic/tls.yml` (`minVersion TLS12`, curated ciphers, `sniStrict`).
Compose labels on `frontend` + `backend` (stricter limits on `/admin` &
`/api/*/login`). Traefik uses read-only docker socket (prefer
socket-proxy). Local `*.localhost` + `mkcert`; prod ACME.

**Risks** — CSP breaking the site (start `Content-Security-Policy-Report-
Only`, collect, tighten, enforce); ACME rate limits (use LE **staging**
first, ensure port 80 or DNS token); real client IP lost
(`forwardedHeaders.trustedIPs`); docker socket = host takeover
(socket-proxy, `:ro`); HSTS preload sticky (add only when certain); admin
IP allowlist lockout on dynamic IPs (opt-in per env).

**Testing** — `curl -I http://...` -> 301/308 to https;
`curl -Ik https://...` -> 200 + all security headers; `testssl.sh` A grade
TLS 1.3; CSP report-only -> zero violations -> enforce; hammer
`/api/x/login` -> 429 after threshold; Traefik cannot write to socket; ACME
staging issues cert then prod resolver issues trusted cert.

**Debug** — `docker compose logs traefik`; check router rule/labels + same
`edge` network + `enable=true`; ACME logs + challenge path/DNS + rate limit;
confirm middleware referenced + defined; browser `Report-Only` console;
inspect `X-Forwarded-For`.

**Expected output** — HTTPS everywhere, A-grade TLS, enforced headers +
tuned CSP, global + targeted rate limiting, hardened socket access, admin
optionally gated — verified via `*.localhost` and ACME staging->prod.

### Step 9 — Playwright + Lighthouse tests

**Goals** — `tests/e2e/playwright.config.ts` (`webServer` or external
`baseURL`, chromium [+ optional firefox/webkit], retries=2 CI,
trace/screenshot/video on failure, HTML reporter); specs (homepage from CMS,
nav, content by slug, 404 status, redirect, form happy + validation, admin
login page smoke, Sentry noop, sitemap/robots 200); a11y
(`@axe-core/playwright` on home/page/post, fail on serious/critical);
`tests/lighthouse/lighthouserc.cjs` (LHCI vs `astro preview`, budgets Perf

> =90 / SEO >=95 / A11y >=95 / BP >=95, LCP/CLS/TBT, `numberOfRuns: 3`
> median). Deterministic seed before both; disposable DB.

**Risks** — flake from timing/animations/network (explicit locators,
`waitForLoadState`, disable animations, block Plausible/Sentry in tests);
Lighthouse CI variance (3 runs median, real budgets, dedicated job, pinned
Chrome); whole-stack dependency (reuse `docker compose`, health-gate);
budgets too strict early (baseline then ratchet); admin creds (CI
secret/env, never in repo).

**Testing** — local `dev:up` -> `test:e2e` green, `test:a11y` no
serious/critical, `build` + `preview` -> `test:lhci` meets budgets; CI job
spins stack + seeds + runs all three + uploads reports; intentionally break
a page -> a11y/SEO assertion fails.

**Debug** — `playwright show-trace trace.zip`; `--repeat-each=20` locally;
read failing LHCI audit in HTML report; axe gives selector + rule + help
URL; match CI Node/Chrome locally.

**Expected output** — green E2E + a11y + Lighthouse suites as CI gates with
uploaded reports; budgets recorded; a proven failure mode.

### Step 10 — CI/CD pipeline

**Goals** — `ci.yml` (PR + main): `setup-node@v4` Node 22 +
`pnpm/action-setup` pinned, `pnpm install --frozen-lockfile`, cache store;
jobs `lint`, `typecheck` (+ `payload generate:types` no-diff + contract
parity), `test:unit`, `build`, `test:e2e` + `test:a11y` + `test:lhci`
(compose up + seed), `docker-build` (buildx, GHA cache, no push on PR).
`release.yml` (main/tags): build + push GHCR `<sha>` + `latest`; Sentry
release + sourcemaps (then discard); `deploy` -> staging via
`docker context` over SSH (`rsync infra/`, `pg_dump`, `payload migrate`,
`pull && up -d`, health gate, smoke, mark Sentry deploy); production job
gated by protected Environment + `rollback.sh` on failure. Least-privilege
`permissions:`, actions pinned by SHA, secrets in Environments, concurrency
group, path filters. Renovate/Dependabot. Branch protection.

**Risks** — long wall-time (parallel jobs + cache, e2e/lhci on PR + main
only or `paths` filter); secret leakage (`::add-mask::`, `pull_request` not
`pull_request_target`, same-repo-only e2e secrets); non-reproducible builds
(frozen lockfile, pinned digests/actions); fragile SSH (dedicated deploy
key, pinned `known_hosts`, manual runbook fallback); migration failure
mid-deploy (hard gate before `up -d`, pre-deploy `pg_dump`, expand/contract,
`rollback.sh`); `latest` races (deploy pins `<sha>`).

**Testing** — draft PR runs all jobs; injected lint/test/type errors fail
the right job; merge to main builds + pushes (verify GHCR) + Sentry release

- deploys staging; production job requires approval; deliberate
  `rollback.sh` on staging restores previous image + DB semantics;
  `generate:types` no-diff gate catches an uncommitted schema change.

**Debug** — reproduce in `node:22` container / `act`; inspect buildx cache
keys + `.dockerignore` + layer order; SSH verbose + `docker context ls` +
manual compose on host; confirm Sentry `release` == runtime
`SENTRY_RELEASE`; `payload migrate:status` + restore `pg_dump`.

**Expected output** — PRs gated by full test matrix; main auto-builds /
pushes / deploys staging; production behind manual approval with tested
rollback + pre-deploy backups; dependency + base-image automation.

### Step 11 — Production Docker Compose

**Goals** — `docker-compose.prod.yml`: `traefik` (80/443, `acme.json`
volume `chmod 600`, socket via socket-proxy, `edge` only), `backend` +
`frontend` from GHCR `<sha>` (standalone, non-root), `db` (named volume, no
host port, `data` network `internal: true`, secrets), `db-backup` sidecar
(cron `pg_dump` -> S3, retention), optional `plausible` + `clickhouse`.
Hardening everywhere: `restart: unless-stopped`, `HEALTHCHECK`,
`read_only: true` + `tmpfs`, `cap_drop: [ALL]` (+ minimal `cap_add`),
`security_opt: [no-new-privileges:true]`, `ulimits`,
`deploy.resources.limits`, `logging` json-file rotation. Secrets via
`secrets:` files (`0400`, root). `.env.prod` for non-secret config only.
`RUNBOOK.md` (deploy, rollback, restore drill, cert renewal, secret
rotation).

**Risks** — `read_only` breaking Next/Astro cache/tmp writes (map writable
paths to `tmpfs`/volumes, test); backup that never restores (scheduled
restore drill, alert on backup age); single-host SPOF (document; reversible
migrations; consider 2 replicas + `docker rollout`); disk exhaustion (log
rotation, retention, prune cron, disk alert); ACME renewal silently failing
(cert-expiry monitor); socket-proxy misconfig (least privileges, verify
discovery); secret rotation downtime (`PAYLOAD_SECRET` change invalidates
sessions — maintenance window).

**Testing** — on a staging box identical to prod: `up -d` with real `<sha>`
images -> all healthy; `db` has no published port (`nmap` shows only
80/443); apps run non-root (`exec ... id`); `read_only` effective
(`touch /x` fails, `/tmp` works); real cert via ACME (staging first),
`testssl.sh` A; force `pg_dump` -> object exists -> **restore** into scratch
DB + run backend integration tests; kill a container -> auto-restarts +
Traefik re-routes; full deploy + `rollback.sh` rehearsal (measure downtime);
load test confirms limits enforced without OOM loop.

**Debug** — `docker compose logs --tail=200 <svc>` + `inspect` health +
`docker events` (relax one hardening var at a time); confirm secret mount
path `/run/secrets/<name>` + file perms; ACME logs + `acme.json` perms +
challenge reachability; `pg_isready` from backend container; run backup
script manually in-container (creds/endpoint/clock skew); tune
`NODE_OPTIONS` heap below container limit.

**Expected output** — hardened, secret-managed, backup-verified production
stack proven on staging: HTTPS with auto-renew, non-root read-only
containers, isolated internal DB, tested backup/restore + rollback,
documented runbook.

---

## PART 4 — CROSS-CUTTING DECISIONS

Tracked as ADRs in `docs/ADR/`. Recommendations:

1. **Routing** — subdomain (`treenweb.example` + `cms.treenweb.example`).
2. **Zod major** — 3.23+ now.
3. **Task runner** — Turborepo (CI cache).
4. **Prod media** — S3-compatible storage.
5. **Plausible** — cloud first; self-host later.
6. **Deploy target** — single Docker host + Compose (accept brief blip) or
   invest in 2 replicas + `docker rollout` now.
7. **ACME challenge** — HTTP-01 (single host) vs DNS-01 (wildcard).
8. **i18n** — decide single vs multi now even if launching single.
9. **Admin protection** — IP allowlist / forward-auth / none.
10. **Migration policy** — no `push` outside dev; generated migrations +
    `payload migrate` in staging/prod; expand/contract only.

**Global conventions** — Conventional Commits; one PR per step; CI green to
merge; ADR for anything in Part 4; every env var lands in `.env.example` +
the app's Zod `env` schema in the same PR; base images pinned by digest,
actions pinned by SHA, `--frozen-lockfile` always; nothing renders
untrusted HTML except via `@treenweb/richtext`; no secrets in `PUBLIC_*`
or prod compose `environment:` or git.

**Milestones** — M1 Foundations: Steps 1–3 · M2 Apps: Steps 4–7 ·
M3 Edge & Quality: Steps 8–9 · M4 Delivery: Steps 10–11 + runbook +
restore drill.
