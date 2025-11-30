import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { UniqueId } from '../value-objects/UniqueId';

/**
 * Repository interface for User persistence operations.
 * Defines the contract that any User repository implementation must fulfill.
 */
export interface IUserRepository {
  /**
   * Finds a user by their unique identifier.
   * @param id - The user's unique ID.
   * @returns The user if found, null otherwise.
   */
  findById(id: UniqueId): Promise<User | null>;

  /**
   * Finds a user by their email address.
   * @param email - The user's email.
   * @returns The user if found, null otherwise.
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Persists a user (create or update).
   * @param user - The user entity to save.
   * @returns The persisted user.
   */
  save(user: User): Promise<User>;
}
