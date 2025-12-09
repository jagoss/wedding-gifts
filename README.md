# Wedding Gifts

A modern TypeScript monorepo for managing wedding registries, guest contributions, and shared gifting experiences. Built with **Clean Architecture** and **Domain-Driven Design** principles.

## Architecture

The backend follows Clean Architecture with clear separation of concerns:

```txt
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

```txt
wedding-gifts/
├── apps/
│   ├── api/                # Backend API (Express + Clean Architecture)
│   └── web/                # Frontend (Next.js)
├── packages/
│   └── shared-types/       # Shared TypeScript contracts
└── docs/                   # C4 architecture diagrams
```

## Getting Started

### Option 1: Kubernetes/Minikube Deployment (Recommended)

Deploy the complete stack (MySQL + API + Web) to Minikube with a single command:

```powershell
.\deploy-minikube.ps1
```

This will automatically:

- 🚀 Start Minikube
- 🐳 Build Docker images
- ☸️  Deploy all services
- 🌱 Seed demo data
- 🌐 Start port-forwarding for easy access

**Access your services**:

- API: `http://localhost:8080`
- Web: `http://localhost:3000`

**Restart port-forwarding** (if closed):

```powershell
.\start-services.ps1
# Or using npm:
npm run k8s:start
```

**Quick cleanup**:

```powershell
.\cleanup-minikube.ps1 -DeleteNamespace
```

📖 **Full documentation**: See [MINIKUBE-DEPLOYMENT.md](MINIKUBE-DEPLOYMENT.md)

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Run API in development
cd apps/api
npm run dev

# Run tests
npm test
```

### Local data storage (SQLite/NeDB files)

- La API usa almacenamiento basado en archivos (NeDB) por defecto.
- Configura la ruta con `DB_FILE` (o `DATABASE_FILE`/`DATABASE_URL`). Ejemplo en Linux/Mac:

```bash
export DB_FILE=./apps/api/data
```

En Windows (PowerShell):

```powershell
$env:DB_FILE="./apps/api/data"
```

Si no se define, usa `apps/api/data` dentro del repo.

> Nota: `better-sqlite3` está en `optionalDependencies`. En Windows con Node 24 puede fallar la compilación (C++20 requerido). Si falla, el runtime continúa con NeDB; no es obligatorio para la demo.

### MySQL + Sequelize (nuevo)

- Variables en `apps/api`:
  - `DB_HOST` (ej. 127.0.0.1)
  - `DB_PORT` (ej. 3306)
  - `DB_USER`, `DB_PASS`
  - `DB_NAME` (ej. `wedding_gifts`)
  - `DB_LOGGING` (true/false)
- Migraciones y seed (requiere MySQL en marcha):

```bash
cd apps/api
npm run db:migrate
npm run db:seed
```

Para demo manual sin CLI: `npm run seed:demo --workspace @wedding-registry/api` también usa Sequelize (requiere DB disponible).

### Semilla de demo (`demo-wedding`)

Ejecuta el seed para crear usuario admin, la boda `demo-wedding` y regalos de prueba:

```bash
npm run seed:demo --workspace @wedding-registry/api
```

Variables opcionales para el seed:

- `SEED_ADMIN_EMAIL` (default: demo.admin@example.com)
- `SEED_ADMIN_PASSWORD` (default: demo1234)
- `SEED_ADMIN_NAME` (default: Demo Admin)

Después del seed, el endpoint público `/public/weddings/demo-wedding` debería devolver datos para que el frontend de demo funcione.

## Testing the API

The project includes a comprehensive HTTP test file with all endpoints documented: [`apps/api/api-tests.http`](apps/api/api-tests.http)

### Prerequisites

Install a REST Client extension for your IDE:

- **VS Code**: [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) by Huachao Mao
- **JetBrains IDEs** (IntelliJ, WebStorm): Built-in HTTP Client

### How to Use

1. **Start the API server**:

   ```bash
   cd apps/api
   npm run dev
   ```

2. **Open the test file**: `apps/api/api-tests.http`

3. **Run requests sequentially**:
   - Click "Send Request" above any `###` request separator
   - Start with authentication endpoints to get an access token
   - Update variables (`@accessToken`, `@weddingId`, etc.) after successful requests

4. **Test workflow example**:

   ```txt
   1. Register User → Copy user details
   2. Login → Copy accessToken and update @accessToken variable
   3. Create Wedding → Copy wedding id and update @weddingId variable
   4. Create Gift → Copy gift id and update @giftId variable
   5. Create Public Contribution → Copy contribution id
   6. Test other endpoints with the created resources
   ```

### What's Included

The test file covers **75+ test scenarios** including:

- ✅ Success cases for all endpoints
- ❌ Error scenarios (400, 401, 403, 404, 409)
- 🔒 Authentication and authorization tests
- 📝 Validation error tests
- 💳 Payment integration tests (MercadoPago webhooks)

Each request includes:

- Clear documentation of what it tests
- Expected HTTP status codes
- Example request bodies
- Comments explaining the scenario

### Automated Testing (Run All Tests)

To run all API tests sequentially in one command:

```bash
cd apps/api
node run-api-tests.js
```

This automated script will:

- ✅ Execute all endpoints in the correct order
- 🔄 Automatically extract and reuse tokens/IDs from responses
- 📊 Display colored pass/fail results for each test
- 📈 Show a comprehensive test summary with pass rate
- ⚡ Complete in seconds

**Benefits**:

- No manual intervention needed
- Perfect for CI/CD pipelines
- Quick validation after code changes
- Comprehensive coverage report

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
