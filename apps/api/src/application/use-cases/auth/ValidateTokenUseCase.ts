import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITokenService } from '../../../domain/services/ITokenService';
import { UniqueId } from '../../../domain/value-objects/UniqueId';
import { AuthenticationError } from '../../../domain/errors/DomainError';

/**
 * Output DTO for token validation.
 */
export interface ValidateTokenOutput {
  id: string;
  name: string;
  email: string;
}

/**
 * Use case for validating an access token.
 * Single Responsibility: Token verification and user retrieval.
 */
export class ValidateTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  /**
   * Validates a token and returns the associated user.
   * @param token - The access token to validate.
   * @returns The user's public information.
   * @throws AuthenticationError if token is invalid or user not found.
   */
  async execute(token: string): Promise<ValidateTokenOutput> {
    const payload = this.tokenService.verifyToken(token);
    if (!payload) {
      throw new AuthenticationError('Invalid or expired token');
    }

    const userId = UniqueId.fromString(payload.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return {
      id: user.id.value,
      name: user.name,
      email: user.email.value,
    };
  }
}
