import { Wedding } from '../models/types';

/**
 * Repository for managing Wedding entities.
 */
export class WeddingRepository {
  private weddings: Map<string, Wedding> = new Map();

  /**
   * Finds a wedding by ID.
   * @param id - The wedding ID.
   * @returns The wedding if found, otherwise null.
   */
  async findById(id: string): Promise<Wedding | null> {
    return this.weddings.get(id) || null;
  }

  /**
   * Finds a wedding by its slug.
   * @param slug - The wedding slug.
   * @returns The wedding if found, otherwise null.
   */
  async findBySlug(slug: string): Promise<Wedding | null> {
    for (const wedding of this.weddings.values()) {
      if (wedding.slug === slug) return wedding;
    }
    return null;
  }

  /**
   * Finds all weddings for a given user.
   * @param userId - The user ID.
   * @returns An array of weddings.
   */
  async findByUserId(userId: string): Promise<Wedding[]> {
    const results: Wedding[] = [];
    for (const wedding of this.weddings.values()) {
      if (wedding.userId === userId) results.push(wedding);
    }
    return results;
  }

  /**
   * Saves a wedding (create or update).
   * @param wedding - The wedding to save.
   * @returns The saved wedding.
   */
  async save(wedding: Wedding): Promise<Wedding> {
    this.weddings.set(wedding.id, wedding);
    return wedding;
  }

  /**
   * Deletes a wedding by ID.
   * @param id - The wedding ID.
   */
  async delete(id: string): Promise<void> {
    this.weddings.delete(id);
  }
}
