# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start

```bash
# Install dependencies, build, and run the portal
make portal_install_and_run
```

### Core Development Commands

```bash
# Install dependencies (requires pnpm >= 10.0.0, node >= 22.x)
pnpm install

# Build the application
pnpm build

# Run development server (includes type generation)
pnpm dev

# Run production server
pnpm start
```

### Code Quality Commands

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Run unit tests with coverage
pnpm test:unit:run

# Run unit tests for changed files
pnpm test:unit:changed

# Run E2E tests (development mode)
pnpm test:e2e:dev

# Run E2E tests (headless)
pnpm test:e2e:run
```

### GraphQL Code Generation

```bash
# Generate all types
pnpm generate:types

# Generate Portal GraphQL types specifically
pnpm generate:types:portal
```

## High-Level Architecture

### Technology Stack

- **Framework**: Remix (React-based SSR framework) with Vite
- **UI Library**: Mantine v7
- **Language**: TypeScript
- **Styling**: CSS Modules, PostCSS with Mantine presets
- **State Management**: React Context + useReducer patterns
- **Data Fetching**: GraphQL via graphql-request
- **Authentication**: Auth0 via remix-auth
- **Payments**: Stripe integration
- **Notifications**: Novu
- **Testing**: Vitest (unit), Cypress (E2E)
- **Package Manager**: pnpm (>=10.0.0)

### Project Structure

#### Core Application (`/app`)

- **routes/**: Remix file-based routing with nested layouts
  - Account management: `account.$accountId.*`
  - Application management: `account.$accountId.$appId.*`
  - User management: `user.*`
  - API routes: `api.*` (Stripe webhooks, auth callbacks, etc.)
- **models/**: Data layer

  - `portal/`: GraphQL schema, server functions, and SDK
  - `stripe/`: Stripe integration logic

- **components/**: Reusable UI components

  - Each component follows index barrel export pattern
  - CSS Modules for component-specific styles

- **utils/**: Shared utilities and helpers

- **root/**: Root-level providers and document setup

### Key Architectural Patterns

1. **Nested Routing**: Routes like `account.$accountId.billing._index` create nested UI with shared layouts

2. **Data Loading**: Remix loaders fetch data server-side before rendering

   - Portal API calls via GraphQL in `app/models/portal/`
   - DWH (Data Warehouse) integration for analytics

3. **State Management**:

   - Component-level: `useReducer` patterns (e.g., ChainSandbox, Security settings)
   - Global: Auth via Remix Auth, color scheme via cookies

4. **Code Organization**:

   - Components use barrel exports (`index.ts`)
   - Route modules export: `loader`, `action`, default component
   - Modals managed via Mantine's modals manager

5. **Authentication Flow**:

   - Auth0 integration via `remix-auth-auth0`
   - Protected routes check authentication in loaders
   - Account/User context separation

6. **Multi-tenancy**:
   - Account-based isolation (`$accountId` param)
   - Applications scoped to accounts (`$appId` within `$accountId`)

### Environment Configuration

- Development uses `.env` file (get from 1Password)
- Default backend: PRODUCTION environment
- Local backend option: Run on `localhost:4200`
- Stripe webhook testing requires Stripe CLI forwarding

### Build & Deployment

- Vercel deployment for preview and production
- Preview deployments on feature branches
- Production deployment on `main` branch
- Stage deployment on `stage` branch
