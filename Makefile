########################
### Makefile Helpers ###
########################

.PHONY: list
list: ## List all make targets
	@${MAKE} -pRrn : -f $(MAKEFILE_LIST) 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | sort

.PHONY: help
.DEFAULT_GOAL := help
help: ## Prints all the targets in all the Makefiles
	@grep -h -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-60s\033[0m %s\n", $$1, $$2}'


#############################
#### Portal Install & Run ###
#############################

.PHONY: portal_install_and_run
portal_install_and_run: check_deps_all ## Run Portal locally after ensuring all dependencies are installed & built
	pnpm install
	pnpm build
	pnpm dev

.PHONY: portal_format
portal_format: check_deps_all ## Generate types and format the code
	pnpm run generate:types
	pnpm run format
	pnpm run lint:fix
	pnpm run typecheck

.PHONY: portal_test
portal_test: ## Run unit tests
	pnpm run test:unit:run

#############################
#### Development Helpers ####
#############################

.PHONY: todos
todos: ## Show all TODO items in the codebase
	@echo "📝 TODOs found in codebase:"
	@echo "=========================="
	@rg -n "TODO|FIXME|XXX|HACK" --type js --type ts --type json --type md --type yaml -g "*.tsx" -g "*.jsx" -g "*.yml" . || echo "No TODOs found!"

#############################
#### Environment Checkers ###
#############################

.PHONY: check_deps_all
# Internal helper target - ensure everything is installed
check_deps_all: check_version_pnpm check_version_node check_version_stripe

.PHONY: check_version_pnpm
# Internal helper target - check pnpm version
check_version_pnpm:
	@version=$$(pnpm --version 2>/dev/null); \
	if [ "$$version" = "" ]; then \
		echo "Error: pnpm not found."; \
		echo "Please install it via npm: npm install -g pnpm" ; \
		echo "Or via Homebrew: brew install pnpm" ; \
		exit 1 ; \
	fi ; \
	if [ "$$(printf "10.0.0\n$$version" | sort -V | head -n1)" != "10.0.0" ]; then \
		echo "Error: pnpm version $$version is less than 10.0.0. Please update pnpm." ; \
		echo "Run: npm install -g pnpm@latest or brew upgrade pnpm" ; \
		exit 1 ; \
	fi

.PHONY: check_version_node
# Internal helper target - check node version
check_version_node:
	@version=$$(node --version 2>/dev/null | sed 's/^v//'); \
	if [ "$$version" = "" ]; then \
		echo "Error: Node.js not found."; \
		echo "Please install Node.js >= 22.x from https://nodejs.org/" ; \
		exit 1 ; \
	fi ; \
	major_version=$$(echo $$version | cut -d. -f1); \
	if [ "$$major_version" -lt "22" ]; then \
		echo "Error: Node.js version $$version is less than 22.x. Please update Node.js." ; \
		echo "Download from: https://nodejs.org/" ; \
		exit 1 ; \
	fi

.PHONY: check_version_stripe
# Internal helper target - check stripe CLI
check_version_stripe:
	@version=$$(stripe --version 2>/dev/null | awk '{print $$3}'); \
	if [ "$$version" = "" ]; then \
		echo "Error: Stripe CLI not found."; \
		echo "Please install it via Homebrew: brew install stripe/stripe-cli/stripe" ; \
		echo "Or download from: https://docs.stripe.com/stripe-cli" ; \
		exit 1 ; \
	fi ; \
	echo "Stripe CLI version $$version found."