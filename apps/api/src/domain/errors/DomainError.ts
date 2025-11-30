/**
 * Base class for all domain-specific errors.
 * Allows distinguishing domain rule violations from infrastructure failures.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when an entity is not found.
 */
export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} not found: ${identifier}`);
  }
}

/**
 * Thrown when a business rule validation fails.
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when the user is not authorized to perform an action.
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}

/**
 * Thrown when there's a conflict (e.g., duplicate slug).
 */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when authentication fails.
 */
export class AuthenticationError extends DomainError {
  constructor(message: string = 'Invalid credentials') {
    super(message);
  }
}
