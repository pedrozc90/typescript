.DEFAULT_GOAL := help

# ── variables ────────────────────────────────────────────────────────────────

mode ?= development

# ── help ─────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── docker ───────────────────────────────────────────────────────────────────

.PHONY: up
up: ## start containers
	docker compose up --detach

.PHONY: down
down: ## start containers
	docker compose down --volumes

# ── nodejs ───────────────────────────────────────────────────────────────────

.PHONY: dev
dev: ## run on dev mode
	npm run start:dev

.PHONY: test
test: ## run tests
	npm test

.PHONY: coverage
coverage: ## run tests coverage
	npm run test:coverage

# ── prisma ───────────────────────────────────────────────────────────────────

.PHONY: prisma-init
prisma-init: ## initialize prisma ORM
	npx prisma init

.PHONY: prisma-migrate
prisma-migrate: ## create prima first migration
	npx prisma migrate dev --name init

.PHONY: prisma-generate
prisma-generate: ## generate prisma client
	npx prisma generate
