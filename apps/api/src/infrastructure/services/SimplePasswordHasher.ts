import { IPasswordHasher } from '../../domain/services/IPasswordHasher';

/**
 * Simple password hasher implementation.
 * WARNING: This is NOT secure for production use.
 * In production, use bcrypt or argon2.
 */
export class SimplePasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    // TODO: Replace with bcrypt.hash(password, 10) for production
    return `hashed_${password}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    // TODO: Replace with bcrypt.compare(password, hash) for production
    return hash === `hashed_${password}`;
  }
}
