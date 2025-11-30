import { User } from '../models/types';

/**
 * Repository for managing User entities.
 * In a real application, this would connect to a database like PostgreSQL.
 */
export class UserRepository {
  private users: Map<string, User> = new Map();

  /**
   * Finds a user by email.
   * @param email - The email to search for.
   * @returns The user if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  /**
   * Finds a user by ID.
   * @param id - The user ID.
   * @returns The user if found, otherwise null.
   */
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  /**
   * Saves a user (create or update).
   * @param user - The user to save.
   * @returns The saved user.
   */
  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
