import { User } from '../models/types';
import { UserRepository } from '../repositories/UserRepository';
import { randomUUID } from 'crypto';

/**
 * Service responsible for authentication-related operations such as registration and login.
 */
export class AuthService {
  /**
   * Creates an instance of AuthService.
   * @param userRepo - The user repository.
   */
  constructor(private userRepo: UserRepository) {}

  /**
   * Registers a new user.
   * @param name - The user's name.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the created user.
   * @throws Error if the user already exists.
   */
  async register(name: string, email: string, password: string): Promise<User> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    // In a real app, hash the password!
    const user: User = {
      id: randomUUID(),
      name,
      email,
      passwordHash: password // TODO: Hash this
    };

    return this.userRepo.save(user);
  }

  /**
   * Authenticates a user.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns A promise resolving to an object containing the user and an access token.
   * @throws Error if credentials are invalid.
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.passwordHash !== password) {
      throw new Error('Invalid credentials');
    }

    // In a real app, generate a JWT
    const token = `mock-token-for-${user.id}`;
    return { user, token };
  }
  
  /**
   * Validates an access token.
   * @param token - The access token to validate.
   * @returns A promise resolving to the user if the token is valid, or null otherwise.
   */
  async validateToken(token: string): Promise<User | null> {
    // Mock validation
    if (!token.startsWith('mock-token-for-')) return null;
    const userId = token.replace('mock-token-for-', '');
    return this.userRepo.findById(userId);
  }
}
