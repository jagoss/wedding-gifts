/**
 * Domain Layer - Enterprise Business Rules
 *
 * This layer contains:
 * - Entities: Core business objects with behavior
 * - Value Objects: Immutable objects representing concepts
 * - Repository Interfaces: Ports for data persistence
 * - Service Interfaces: Ports for external services
 * - Domain Errors: Business rule violation errors
 */

export * from './entities';
export * from './value-objects';
export * from './repositories';
export * from './services';
export * from './errors/DomainError';
