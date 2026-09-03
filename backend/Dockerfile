# syntax=docker/dockerfile:1
# Production image for the backend (Payload CMS 3 on Next.js 15, standalone).
# Build context is the repo root.
ARG NODE_IMAGE=node:22-bookworm-slim

# ---------- base ----------
FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=1 \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

# ---------- deps (frozen workspace install, cached) ----------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/richtext/package.json ./packages/richtext/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY tests/e2e/package.json ./tests/e2e/
COPY tests/lighthouse/package.json ./tests/lighthouse/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---------- build (codegen + next build) ----------
FROM deps AS build
COPY . .
# Placeholder env is scoped to this RUN only (never baked into the image) so
# config validation / codegen pass. Real values are injected at runtime.
RUN DATABASE_URL=postgres://build:build@localhost:5432/build \
    PAYLOAD_SECRET=build-time-placeholder-secret-0123456789 \
    PAYLOAD_DB_PUSH=false \
    pnpm --filter @treenweb/backend run generate:types \
 && pnpm --filter @treenweb/backend run generate:importmap \
 && DATABASE_URL=postgres://build:build@localhost:5432/build \
    PAYLOAD_SECRET=build-time-placeholder-secret-0123456789 \
    PAYLOAD_DB_PUSH=false \
    pnpm --filter @treenweb/backend exec next build

# ---------- runtime (minimal standalone) ----------
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
RUN useradd --system --uid 1001 --user-group nextjs
COPY --from=build --chown=nextjs:nextjs /repo/backend/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /repo/backend/.next/static ./backend/.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "backend/server.js"]
