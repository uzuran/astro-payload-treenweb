# .devcontainer

Reproducible dev environment for local VS Code (Dev Containers) and GitHub
Codespaces.

## What it provides

| Piece                         | Detail                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Base image                    | `mcr.microsoft.com/devcontainers/typescript-node:22-bookworm` (Node 22)                                         |
| `docker-in-docker` feature    | `docker` + `docker compose v2` inside the container                                                             |
| `github-cli` feature          | `gh` for CI/PR work                                                                                             |
| `post-create.sh`              | Corepack → pinned pnpm, `.env` bootstrap, `pnpm install`, Playwright browsers (once Playwright lands in Step 9) |
| Forwarded ports               | 4321 Astro · 3000 Payload/Next · 5432 Postgres · 8080 Traefik                                                   |
| VS Code extensions + settings | Astro, ESLint (flat config), Prettier (format on save), Playwright, Docker, YAML, TOML, GitHub Actions, dotenv  |

The container is **image-based** — it does not start the Docker stack. After
it comes up, run the stack yourself:

```bash
make up      # or: pnpm dev:up   (available from Step 3)
```

This is deliberate: starting Compose during `postCreateCommand` races the
docker-in-docker daemon and is a common source of Codespaces flakiness.

## Design decisions

- **No named volumes for `node_modules` / pnpm store.** On Codespaces and
  local bind-mount setups the workspace folder already persists across
  rebuilds, and root-owned volume mounts over `node_modules` cause
  permission failures — the opposite of "stability". Codespaces
  **prebuilds** are the intended speed-up for `pnpm install`.
- **`post-create.sh` is idempotent** — safe to re-run on "Rebuild
  Container". It never overwrites an existing `.env`.
- **`NODE_OPTIONS=--max-old-space-size=4096`** guards Astro/Next builds on
  8 GB Codespaces machines.
- **`COREPACK_ENABLE_DOWNLOAD_PROMPT=0`** so pnpm provisioning never blocks
  on an interactive prompt.

## Validating a change to this folder

The container cannot rebuild itself from the inside. To test:

1. **Local:** Command Palette → _Dev Containers: Rebuild Container_.
2. **Codespaces:** Command Palette → _Codespaces: Full Rebuild Container_,
   or create a fresh Codespace on the branch.

Expected: rebuild finishes without errors in a few minutes; then

```bash
node -v            # v22.x
pnpm -v            # matches package.json "packageManager"
docker info        # daemon reachable, no sudo needed
pnpm exec playwright --version   # only resolves from Step 9 on
make check         # lint + format + typecheck + unit — all green
```
