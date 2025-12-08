/**
 * Infrastructure Layer - Frameworks & Drivers
 *
 * This layer contains:
 * - Persistence: Repository implementations
 * - Services: External service adapters
 * - HTTP: Express controllers and routes
 *
 * Infrastructure implementations depend on domain interfaces (ports),
 * following the Dependency Inversion Principle.
 */

export * from './persistence';
export * from './services';
export * from './http';
