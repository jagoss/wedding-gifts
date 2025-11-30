# Wedding Gifts

A modern TypeScript monorepo for managing wedding registries, guest contributions, and shared gifting experiences. Built with **Clean Architecture** and **Domain-Driven Design** principles.

## Architecture

The backend follows Clean Architecture with clear separation of concerns:

```
apps/api/src/
├── domain/                 # Enterprise Business Rules
│   ├── entities/           # User, Wedding, Gift, Contribution
│   ├── value-objects/      # UniqueId, Email, Money, Slug
│   ├── repositories/       # Repository interfaces (ports)
│   ├── services/           # External service interfaces (ports)
│   └── errors/             # Domain-specific errors
│
├── application/            # Application Business Rules
│   ├── use-cases/          # Feature-specific use cases
│   │   ├── auth/           # Register, Login, ValidateToken
│   │   ├── wedding/        # CRUD operations
│   │   ├── gift/           # CRUD operations
│   │   ├── contribution/   # Create, List contributions
│   │   └── payment/        # Payment preferences, Webhooks
│   └── dtos/               # Data Transfer Objects
│
├── infrastructure/         # Frameworks & Drivers
│   ├── persistence/        # Repository implementations
│   ├── services/           # External service adapters
│   └── http/               # Controllers, middleware
│
└── main/                   # Composition Root
    ├── container.ts        # Dependency injection
    └── app.ts              # Express app factory
```

### Key Principles

- **Dependency Rule**: Dependencies point inward (Infrastructure → Application → Domain)
- **Ports & Adapters**: Use cases depend on interfaces, not implementations
- **Rich Domain Model**: Entities encapsulate business logic, not just data
- **Value Objects**: Immutable objects that enforce domain invariants

## Project Structure

```
wedding-gifts/
├── apps/
│   ├── api/                # Backend API (Express + Clean Architecture)
│   └── web/                # Frontend (Next.js)
├── packages/
│   └── shared-types/       # Shared TypeScript contracts
└── docs/                   # C4 architecture diagrams
```

## Getting Started

```bash
# Install dependencies
npm install

# Run API in development
cd apps/api
npm run dev

# Run tests
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Authenticate user |
| GET | `/weddings/me` | Get user's weddings |
| POST | `/weddings` | Create wedding |
| GET | `/public/weddings/:slug` | Get public wedding |
| POST | `/public/weddings/:slug/contributions` | Create contribution |
| POST | `/webhooks/mercadopago` | Handle payment webhooks |

## Documentation

- [`docs/c1-contexto.md`](docs/c1-contexto.md) - System context diagram
- [`docs/c2-contenedores.md`](docs/c2-contenedores.md) - Container diagram
- [`docs/c3-componentes.md`](docs/c3-componentes.md) - Component diagram (Clean Architecture)
- [`docs/c4-codigo-pagos.md`](docs/c4-codigo-pagos.md) - Code diagram (Payment module)

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **API Framework**: Express.js
- **Architecture**: Clean Architecture + DDD
- **Payment Gateway**: MercadoPago (pluggable via ports)
- **Frontend**: Next.js (planned)

## Next Steps

- [ ] Add PostgreSQL repository implementations
- [ ] Integrate real MercadoPago SDK
- [ ] Add email provider (SendGrid/Resend)
- [ ] Set up testing with Vitest
- [ ] Configure CI/CD pipeline
- [ ] Build frontend with Next.js
