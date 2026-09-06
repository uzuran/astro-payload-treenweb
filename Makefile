# astro-payload-treenweb — task runner
# Thin wrapper over pnpm + docker compose. Run `make` or `make help` for the list.

SHELL := bash
.DEFAULT_GOAL := help

COMPOSE := docker compose -f infra/docker-compose.yml -f infra/docker-compose.dev.yml

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ─── Setup ──────────────────────────────────────────────────────────────────

.PHONY: setup
setup: ## First-time setup: create .env, enable corepack, install deps
	@test -f .env || { cp .env.example .env && echo "created .env from .env.example"; }
	@corepack enable 2>/dev/null || true
	pnpm install

.PHONY: install
install: ## Install workspace dependencies
	pnpm install

.PHONY: install-ci
install-ci: ## Install with a frozen lockfile (CI parity)
	pnpm install --frozen-lockfile

# ─── Quality ────────────────────────────────────────────────────────────────

.PHONY: lint
lint: ## Run ESLint across the workspace
	pnpm lint

.PHONY: lint-fix
lint-fix: ## Run ESLint with --fix
	pnpm lint:fix

.PHONY: format
format: ## Format the repo with Prettier
	pnpm format

.PHONY: format-check
format-check: ## Verify Prettier formatting
	pnpm format:check

.PHONY: typecheck
typecheck: ## Type-check every package
	pnpm typecheck

.PHONY: check
check: ## Full pre-push gate (heavy: runs `astro check`) — prefer CI, this OOMs on small boxes
	pnpm check

.PHONY: verify
verify: ## Light local gate: lint + format-check + unit tests (skips astro check / e2e — CI runs those)
	pnpm lint && pnpm format:check && pnpm test:unit

# ─── Tests ──────────────────────────────────────────────────────────────────

.PHONY: test
test: ## Run unit tests
	pnpm test:unit

.PHONY: test-unit
test-unit: ## Run unit tests (Vitest)
	pnpm test:unit

.PHONY: test-integration
test-integration: ## Run Payload API integration tests
	pnpm test:integration

.PHONY: test-e2e
test-e2e: ## Run Playwright end-to-end tests
	pnpm test:e2e

.PHONY: test-a11y
test-a11y: ## Run axe accessibility checks
	pnpm test:a11y

.PHONY: test-lhci
test-lhci: ## Run Lighthouse CI budgets
	pnpm test:lhci

.PHONY: test-all
test-all: ## Run every test suite (unit -> integration -> e2e -> a11y -> lighthouse)
	pnpm test:all

# ─── Build & run ────────────────────────────────────────────────────────────

.PHONY: build
build: ## Build every app
	pnpm build

.PHONY: dev
dev: ## Run every app's dev server in parallel (no containers)
	pnpm dev

# ─── Host-mode local dev (apps on the host, only Postgres in Docker) ─────────
# Lighter alternative to `make up`. One-time:
#   make dev-setup
# Each session:
#   make dev-db   # if the db container is not already up
#   make dev      # backend :3000  +  frontend :4321

.PHONY: dev-setup
dev-setup: ## Host dev one-time setup: .env + deps + Postgres + seed
	@test -f .env || { cp .env.example .env && \
		sed -i 's#@db:5432#@localhost:5432#; s#http://backend:3000#http://localhost:3000#' .env && \
		echo "created .env from .env.example (rewritten for host mode: @localhost)"; }
	@corepack enable 2>/dev/null || true
	pnpm install
	$(MAKE) dev-db
	$(MAKE) env
	$(MAKE) dev-seed

.PHONY: dev-db
dev-db: ## Host dev: start ONLY the Postgres container (127.0.0.1:5432)
	$(COMPOSE) up -d --wait db

.PHONY: dev-db-down
dev-db-down: ## Host dev: stop the Postgres container (keeps the volume)
	$(COMPOSE) stop db

.PHONY: dev-seed
dev-seed: ## Host dev: seed the DB from the host (admin user + sample pages)
	cd backend && pnpm exec tsx --env-file=.env src/seed/index.ts

.PHONY: up
up: ## Start the dev Docker stack (waits for healthy)
	$(COMPOSE) up -d --wait

.PHONY: down
down: ## Stop the dev Docker stack
	$(COMPOSE) down

.PHONY: restart
restart: ## Restart the app containers (backend + frontend; reloads Payload config). Use `make down up` for a full recreate.
	$(COMPOSE) restart backend frontend

.PHONY: restart-backend
restart-backend: ## Restart only the backend container (reloads Payload config, regenerates payload-types.ts)
	$(COMPOSE) restart backend

.PHONY: restart-frontend
restart-frontend: ## Restart only the frontend container
	$(COMPOSE) restart frontend

.PHONY: logs
logs: ## Follow dev Docker stack logs
	$(COMPOSE) logs -f

.PHONY: ps
ps: ## Show dev Docker stack status
	$(COMPOSE) ps

.PHONY: psql
psql: ## Open a psql shell on the dev database
	$(COMPOSE) exec db psql -U treenweb -d treenweb

.PHONY: seed
seed: ## Seed the dev database (admin user + sample pages)
	$(COMPOSE) exec backend pnpm --filter @treenweb/backend run seed

.PHONY: types
types: ## Regenerate backend Payload types (payload-types.ts)
	pnpm --filter @treenweb/backend run generate:types

.PHONY: env
env: ## Copy root .env into backend/ and frontend/ (needed only for host-run commands)
	@test -f .env || cp .env.example .env
	@cp .env backend/.env && echo "wrote backend/.env"
	@cp .env frontend/.env && echo "wrote frontend/.env"

.PHONY: reset
reset: ## Stop the dev Docker stack and drop its volumes
	$(COMPOSE) down -v

# ─── Housekeeping ───────────────────────────────────────────────────────────

.PHONY: clean
clean: ## Remove build artifacts and all node_modules
	rm -rf node_modules \
		{frontend,backend}/{dist,.astro,.next,.output,node_modules} \
		packages/*/{dist,node_modules} \
		tests/*/node_modules \
		coverage playwright-report test-results .lighthouseci .turbo
