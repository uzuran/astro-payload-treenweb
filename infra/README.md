# infra

Infrastructure-as-code. Nothing here imports app code; apps never import
from here.

| Path                      | Purpose                                         | Step             |
| ------------------------- | ----------------------------------------------- | ---------------- |
| `docker-compose.yml`      | Base stack (`db`, networks, volumes)            | 3                |
| `docker-compose.dev.yml`  | Dev override (app services, bind mounts, ports) | 3                |
| `docker-compose.prod.yml` | Prod override (GHCR images, secrets, hardening) | 11               |
| `dev/stub-server.mjs`     | Temporary health stub for `backend`/`frontend`  | 3 (removed in 5) |
| `postgres/init/`          | First-boot SQL (extensions)                     | 3                |
| `postgres/backup/`        | `pg_dump` backup sidecar                        | 11               |
| `traefik/`                | Static + dynamic Traefik v3 config              | 8                |
| `plausible/`              | optional self-hosted analytics fragment         | 8                |
| `secrets/`                | host-side secret files (git-ignored)            | 11               |
| `scripts/`                | `deploy.sh`, `rollback.sh`                      | 10               |

## Dev stack

```bash
make up      # start (waits for all services healthy)
make ps      # status
make logs    # follow logs
make psql    # psql shell on the dev DB
make down    # stop
make reset   # stop + drop volumes (fresh DB next `up`)
```

Topology: `db` on the `data` network only (no internet); `backend` on
`data` + `edge`; `frontend` on `edge` only (it reaches `backend` by
service name, never the DB). Ports are bound to `127.0.0.1` — Postgres
`5432`, backend `3000`, frontend `4321`.
