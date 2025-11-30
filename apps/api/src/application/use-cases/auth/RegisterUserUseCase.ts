import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../../../domain/services/IPasswordHasher';
import { ConflictError } from '../../../domain/errors/DomainError';

/**
 * Input DTO for user registration.
 */
export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

/**
 * Output DTO for user registration.
 */
export interface RegisterUserOutput {
  id: string;
  name: string;
  email: string;
}

/**
 * Use case for registering a new user.
 * Single Responsibility: Handles user registration flow.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  /**
   * Executes the user registration.
   * @param input - Registration data.
   * @returns The registered user's public information.
   * @throws ConflictError if email is already registered.
   */
  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await this.passwordHasher.hash(input.password);

    // Create the user entity
    const user = User.create(input.name, email, passwordHash);

    // Persist the user
    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id.value,
      name: savedUser.name,
      email: savedUser.email.value,
    };
  }
}
