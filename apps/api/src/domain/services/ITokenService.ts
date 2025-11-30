/**
 * Token payload containing user information.
 */
export interface TokenPayload {
  userId: string;
}

/**
 * Port interface for token service operations.
 * Abstracts JWT or other token mechanisms from the domain layer.
 */
export interface ITokenService {
  /**
   * Generates an access token for a user.
   * @param payload - The token payload.
   * @returns The generated token string.
   */
  generateToken(payload: TokenPayload): string;

  /**
   * Verifies and decodes a token.
   * @param token - The token string to verify.
   * @returns The decoded payload if valid, null otherwise.
   */
  verifyToken(token: string): TokenPayload | null;
}
