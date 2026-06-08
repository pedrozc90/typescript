.DEFAULT_GOAL := help

# ── variables ────────────────────────────────────────────────────────────────

mode ?= development

# ── help ─────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── nodejs ───────────────────────────────────────────────────────────────────
.PHONY: clear
clear: ## run on dev mode
	rm -rf node_modules package-lock.json

.PHONY: dev
dev: ## run on dev mode
	npm run start:dev

.PHONY: test
test: ## run tests
	npm test

.PHONY: coverage
coverage: ## run tests coverage
	npm run test:coverage
