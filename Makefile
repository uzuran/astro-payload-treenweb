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
check: ## Pre-push gate: lint + format-check + typecheck + unit tests
	pnpm check

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

.PHONY: up
up: ## Start the dev Docker stack (waits for healthy)
	$(COMPOSE) up -d --wait

.PHONY: down
down: ## Stop the dev Docker stack
	$(COMPOSE) down

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
