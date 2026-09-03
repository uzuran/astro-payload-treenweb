# syntax=docker/dockerfile:1
# Production image for the Astro SSR frontend (@astrojs/node standalone).
# Build context is the repo root.
ARG NODE_IMAGE=node:22-bookworm-slim

# ---------- base ----------
FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=1
RUN corepack enable
WORKDIR /repo

# ---------- deps ----------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/richtext/package.json ./packages/richtext/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY tests/e2e/package.json ./tests/e2e/
COPY tests/lighthouse/package.json ./tests/lighthouse/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---------- build + prune ----------
FROM deps AS build
COPY . .
RUN PUBLIC_SITE_URL=http://localhost:4321 pnpm --filter @treenweb/frontend build
RUN pnpm --filter @treenweb/frontend deploy --prod --legacy /out

# ---------- runtime ----------
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321
WORKDIR /app
RUN useradd --system --uid 1001 --user-group astro
COPY --from=build --chown=astro:astro /out/node_modules ./node_modules
COPY --from=build --chown=astro:astro /repo/frontend/dist ./dist
COPY --from=build --chown=astro:astro /repo/frontend/package.json ./package.json
USER astro
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4321/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "./dist/server/entry.mjs"]
