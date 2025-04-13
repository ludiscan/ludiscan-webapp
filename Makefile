.PHONY: build-production
build-production: ## Build the production docker image.
	docker compose -f docker/compose.yaml build

.PHONY: start-production
start-production: ## Start the production docker container.
	docker compose -f docker/compose.yaml up -d

.PHONY: stop-production
stop-production: ## Stop the production docker container.
	docker compose -f docker/compose.yaml down
