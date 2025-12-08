import { Request, Response, NextFunction } from 'express';
import { ValidateTokenUseCase } from '../../../application/use-cases/auth/ValidateTokenUseCase';

/**
 * Extended Request interface with authenticated user data.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Factory function to create auth middleware.
 * Uses dependency injection for the ValidateTokenUseCase.
 */
export function createAuthMiddleware(validateTokenUseCase: ValidateTokenUseCase) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: { message: 'No token provided' } });
      return;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ error: { message: 'Invalid authorization format' } });
      return;
    }

    try {
      const user = await validateTokenUseCase.execute(token);
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }
  };
}
