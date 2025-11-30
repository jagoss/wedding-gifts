import { ITokenService, TokenPayload } from '../../domain/services/ITokenService';

/**
 * Mock token service implementation.
 * WARNING: This is NOT secure for production use.
 * In production, use proper JWT with signing.
 */
export class MockTokenService implements ITokenService {
  private readonly prefix = 'mock-token-for-';

  generateToken(payload: TokenPayload): string {
    // TODO: Replace with proper JWT generation for production
    return `${this.prefix}${payload.userId}`;
  }

  verifyToken(token: string): TokenPayload | null {
    // TODO: Replace with proper JWT verification for production
    if (!token.startsWith(this.prefix)) {
      return null;
    }

    const userId = token.replace(this.prefix, '');
    if (!userId) {
      return null;
    }

    return { userId };
  }
}
