import { Response } from 'express';
import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  AuthenticationError,
} from '../../domain/errors/DomainError';

/**
 * HTTP error response structure.
 */
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
  };
}

/**
 * Maps domain errors to HTTP status codes and sends appropriate response.
 * Centralizes error handling for all controllers.
 */
export function handleHttpError(res: Response, error: unknown): void {
  if (error instanceof EntityNotFoundError) {
    res.status(404).json(toErrorResponse(error.message));
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json(toErrorResponse(error.message));
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(403).json(toErrorResponse(error.message));
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(401).json(toErrorResponse(error.message));
    return;
  }

  if (error instanceof ConflictError) {
    res.status(409).json(toErrorResponse(error.message));
    return;
  }

  if (error instanceof DomainError) {
    res.status(400).json(toErrorResponse(error.message));
    return;
  }

  // Unknown error
  console.error('[HTTP] Unexpected error:', error);
  res.status(500).json(toErrorResponse('Internal server error'));
}

function toErrorResponse(message: string): ErrorResponse {
  return { error: { message } };
}
