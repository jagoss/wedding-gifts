import { Wedding } from '../entities/Wedding';
import { UniqueId } from '../value-objects/UniqueId';
import { Slug } from '../value-objects/Slug';

/**
 * Repository interface for Wedding persistence operations.
 * Defines the contract that any Wedding repository implementation must fulfill.
 */
export interface IWeddingRepository {
  /**
   * Finds a wedding by its unique identifier.
   * @param id - The wedding's unique ID.
   * @returns The wedding if found, null otherwise.
   */
  findById(id: UniqueId): Promise<Wedding | null>;

  /**
   * Finds a wedding by its public slug.
   * @param slug - The wedding's URL slug.
   * @returns The wedding if found, null otherwise.
   */
  findBySlug(slug: Slug): Promise<Wedding | null>;

  /**
   * Finds all weddings belonging to a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of weddings owned by the user.
   */
  findByUserId(userId: UniqueId): Promise<Wedding[]>;

  /**
   * Checks if a slug is already in use.
   * @param slug - The slug to check.
   * @returns True if the slug exists, false otherwise.
   */
  existsBySlug(slug: Slug): Promise<boolean>;

  /**
   * Persists a wedding (create or update).
   * @param wedding - The wedding entity to save.
   * @returns The persisted wedding.
   */
  save(wedding: Wedding): Promise<Wedding>;

  /**
   * Deletes a wedding by its unique identifier.
   * @param id - The wedding's unique ID.
   */
  delete(id: UniqueId): Promise<void>;
}
