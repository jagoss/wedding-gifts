import { Email } from '../../../domain/value-objects/Email';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../../../domain/services/IPasswordHasher';
import { ITokenService } from '../../../domain/services/ITokenService';
import { AuthenticationError, ValidationError } from '../../../domain/errors/DomainError';

/**
 * Input DTO for user login.
 */
export interface LoginUserInput {
  email: string;
  password: string;
}

/**
 * Output DTO for user login.
 */
export interface LoginUserOutput {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Use case for user authentication.
 * Single Responsibility: Handles user login flow.
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  /**
   * Executes the user login.
   * @param input - Login credentials.
   * @returns Access token and user information.
   * @throws AuthenticationError if credentials are invalid.
   */
  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Validate password
    if (!input.password || input.password.trim() === '') {
      throw new ValidationError('Password is required');
    }

    const email = Email.create(input.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate access token
    const accessToken = this.tokenService.generateToken({
      userId: user.id.value,
    });

    return {
      accessToken,
      user: {
        id: user.id.value,
        name: user.name,
        email: user.email.value,
      },
    };
  }
}
