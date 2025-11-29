# Wedding Gifts

This repository seeds the "Wedding Registry" platform: a modern TypeScript monorepo for managing couple-facing registry creation, guest contributions, and shared gifting experiences. It lays out the initial folder structure for the web experience, API services, shared domain contracts, and documentation so future work can grow in a consistent way.

## Project Structure
- `wedding-registry/apps/web/`: Frontend workspace for the public site and couple dashboard.
  - `src/pages/`, `src/components/`, `src/lib/`, `src/styles/`: Next.js-style layout for routing, UI building blocks, utilities, and styling primitives.
- `wedding-registry/apps/api/`: Backend workspace for domain services.
  - `src/config/`: Environment and application configuration.
  - `src/modules/`: Domain modules for auth, weddings, gifts, contributions, payments, and external integrations.
  - `src/infra/`: Infrastructure adapters for the database, HTTP transport, and email delivery.
  - `src/shared/`: Cross-cutting helpers and shared utilities.
- `wedding-registry/packages/shared-types/`: Shared TypeScript contracts for API <-> web communication.
- `wedding-registry/docs/`: Architecture and design references.

## Next Steps
- Choose and configure the package manager (npm, Yarn, or pnpm) plus workspace tooling.
- Scaffold application entrypoints for the web app (e.g., Next.js) and API (e.g., NestJS/Express/Fastify).
- Set up linting, formatting, and testing baselines (ESLint, Prettier, Vitest/Jest) across workspaces.
- Configure infrastructure services such as the database connection, email provider, and payment gateway sandbox credentials.
- Establish CI to enforce checks and publish preview builds for the web frontend.

For a high-level system view, see [`wedding-registry/docs/architecture.md`](wedding-registry/docs/architecture.md).
