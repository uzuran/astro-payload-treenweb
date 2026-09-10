# Deploy & rollback runbook

Operational procedure for the treenweb prod stack. Scripts live in
`infra/scripts/`; all are `set -euo pipefail` and take config via env vars.

| Script          | What it does                                                             |
| --------------- | ------------------------------------------------------------------------ |
| `deploy.sh`     | backup → pull → start (health-gated) → migrate → smoke-check `/readyz`   |
| `rollback.sh`   | backup → pull+start a previous tag → (optional) `migrate:down` → recheck |
| `db-backup.sh`  | `pg_dump` the running `db` service → `infra/backups/*.sql.gz`, keeps 14  |
| `db-restore.sh` | restore a gzipped dump (destructive; prompts)                            |

`COMPOSE_FILES` (default `infra/docker-compose.yml:infra/docker-compose.prod.yml`)
is a `:`-separated list. `IMAGE_TAG` selects the release; the prod compose must
reference `${IMAGE_TAG}` in each service's `image:`.

---

## Prerequisites (once per host)

- Docker Engine + Compose v2.
- A root `.env` on the host (chmod 600, git-ignored) with every var the
  header of `infra/docker-compose.prod.yml` lists. Compose reads it for
  `${VAR}` interpolation and the services `env_file` it; missing required vars
  fail the deploy immediately. Key ones: `IMAGE_REGISTRY`, `PAYLOAD_SECRET`
  (≥32, unique to prod), `DATABASE_URL`, `PUBLIC_SITE_URL` / `PUBLIC_CMS_URL`
  as real `https://` origins (the app **refuses to boot** on localhost in
  production — `frontend/src/env.ts`), `CORS_ORIGINS`, `CSRF_ORIGINS`, and
  `SMTP_URL` (or `EMAIL_OPTOUT=true` — without one the backend refuses to boot,
  because password-reset tokens would be written to the log). The prod compose
  pins `PAYLOAD_DB_PUSH=false`; the backend also refuses to boot with push on in
  production (`backend/src/env.ts`).
- A cron/systemd timer running `infra/scripts/db-backup.sh` (e.g. every 6 h)
  with `BACKUP_DIR` on a volume that is itself backed up off-box.

---

## Routine deploy

```bash
# on the host, repo checked out at the release commit
IMAGE_TAG=v1.4.0 infra/scripts/deploy.sh
```

1. **Backup** — a pre-deploy dump is always taken first.
2. **Pull** the tagged images.
3. **Start** with `--wait`; the baked `HEALTHCHECK`s (`/health`, `/healthz`)
   gate readiness. A service that never goes healthy fails the deploy here,
   before migrations run.
4. **Migrate** — prints `migrate:status`, then `payload migrate` applies any
   pending files from `backend/src/migrations/`.
5. **Smoke check** — polls `/readyz` (verifies frontend → CMS → Postgres). Exit
   0 = deploy OK.

If step 3, 4, or 5 fails: the previous containers may already be gone. Go
straight to **Rollback**.

---

## Rollback

```bash
# redeploy the last known-good images
IMAGE_TAG=v1.3.0 infra/scripts/rollback.sh

# ...and revert the last migration, only if the release you're leaving added
# one AND its down() is safe against prod data
IMAGE_TAG=v1.3.0 MIGRATE_DOWN=1 infra/scripts/rollback.sh
```

Guidance:

- **Code-only regression** → `rollback.sh` without `MIGRATE_DOWN`. The old image
  runs against the current (forward) schema; Payload migrations are additive by
  convention, so this is normally safe.
- **Bad migration** → prefer restoring the pre-deploy dump (below) over
  `migrate:down` when the `down()` wasn't verified or the migration dropped
  data. `MIGRATE_DOWN=1` is for reversible, verified schema changes.

### Restore a dump

```bash
infra/scripts/db-restore.sh infra/backups/treenweb-<utc>.sql.gz
# then bring the app back on the matching IMAGE_TAG
IMAGE_TAG=v1.3.0 infra/scripts/rollback.sh
```

Dumps are `--clean --if-exists`, so restore drops and recreates every object
in the dump. Take a fresh `db-backup.sh` first if the current state has
anything worth keeping.

---

## Authoring a migration

Dev auto-syncs the schema (`PAYLOAD_DB_PUSH=true`); prod never does. For any
model/collection/global change:

```bash
pnpm --filter @treenweb/backend run migrate:create <name>   # diffs schema → src/migrations/*
# review the generated up()/down(); verify locally:
pnpm --filter @treenweb/backend run migrate                 # up
pnpm --filter @treenweb/backend run migrate:down            # down
pnpm --filter @treenweb/backend run migrate                 # up again
```

Commit the `.ts` + `.json` pair and the `index.ts` change. `deploy.sh` applies
them on the next release.

---

## `infra/docker-compose.prod.yml`

Present. `backend` + `frontend` run GHCR images
(`${IMAGE_REGISTRY}/treenweb-<svc>:${IMAGE_TAG}`, `pull_policy: always`, no
`build:`), `restart: unless-stopped`, json-file log rotation (10m×5), and
`mem_limit` / `cpus` (backend 1 GB/1.0, frontend 512 MB/0.5, db 1 GB/1.0 —
tune to the host). `db` publishes no ports. `PAYLOAD_DB_PUSH=false` and
`NODE_ENV=production` are pinned. Every critical var is `${VAR:?}` so a
`config` / `up` with an incomplete `.env` fails immediately.

## `infra/traefik/` (edge proxy)

The `traefik` service (v3) terminates TLS, redirects `:80 → :443` (permanent),
and fronts both apps by `Host()` rule (`SITE_DOMAIN` → frontend:4321,
`CMS_DOMAIN` → backend:3000). Certs: Let's Encrypt TLS-ALPN-01 challenge (only
:443 needs to be reachable), email from `ACME_EMAIL`, stored in the
`traefik-acme` volume.

Global middlewares on the `websecure` entrypoint (`infra/traefik/dynamic/`):

- **security-headers** — HSTS (2y, includeSubDomains, preload), `X-Frame-Options
DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, and strips `Server` / `X-Powered-By`. **CSP stays in the
  app** (`frontend/src/lib/securityHeaders.ts` — it needs the CMS origin and is
  unit-tested); Traefik does not duplicate it.
- **rate-limit** — 100 req / client-IP / minute, burst 50. A tighter
  `rate-limit-strict` (20/min) is defined for `/admin` + write endpoints —
  attach it once path routers are added to the app labels.
- **compress**.

Prereqs: DNS `A`/`AAAA` for `SITE_DOMAIN` and `CMS_DOMAIN` → the host; ports
80/443 open. Dashboard is off (`api.dashboard: false`).

## Still open (needs an infra decision)

- **CD workflow.** No `.github/workflows/deploy.yml`. `deploy.sh`/`rollback.sh`
  are the building blocks; a workflow needs the deploy target chosen
  (compose-over-SSH, a Docker context, Kamal, Swarm, k8s) and a release-tag /
  image-push step wired to GHCR.
- Off-box backup destination for `infra/backups/` (S3 per `.env.example`).
- **Sentry**: server-side capture is wired in the **frontend** (Astro
  middleware, `@sentry/node`) — set `SENTRY_DSN` in the prod `.env` to turn it
  on (no-op otherwise). The **backend** is not wired: `@sentry/node` breaks
  Next's instrumentation-hook bundling; it needs `@sentry/nextjs` (a separate,
  larger change). Also still to do: browser-side capture (`PUBLIC_SENTRY_DSN` +
  `@sentry/browser`), sourcemap upload in the Docker build (`SENTRY_AUTH_TOKEN`),
  and an uptime probe hitting `/readyz` with an alert.
