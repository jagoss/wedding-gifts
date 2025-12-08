/**
 * Port interface for password hashing operations.
 * Abstracts password security from the domain layer.
 */
export interface IPasswordHasher {
  /**
   * Hashes a plain text password.
   * @param password - The plain text password.
   * @returns The hashed password.
   */
  hash(password: string): Promise<string>;

  /**
   * Compares a plain text password with a hash.
   * @param password - The plain text password.
   * @param hash - The hashed password to compare against.
   * @returns True if the password matches the hash.
   */
  compare(password: string, hash: string): Promise<boolean>;
}
