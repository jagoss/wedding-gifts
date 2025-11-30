import { Gift } from '../entities/Gift';
import { UniqueId } from '../value-objects/UniqueId';

/**
 * Repository interface for Gift persistence operations.
 * Defines the contract that any Gift repository implementation must fulfill.
 */
export interface IGiftRepository {
  /**
   * Finds a gift by its unique identifier.
   * @param id - The gift's unique ID.
   * @returns The gift if found, null otherwise.
   */
  findById(id: UniqueId): Promise<Gift | null>;

  /**
   * Finds all gifts belonging to a specific wedding.
   * @param weddingId - The wedding's unique ID.
   * @returns Array of gifts for the wedding.
   */
  findByWeddingId(weddingId: UniqueId): Promise<Gift[]>;

  /**
   * Persists a gift (create or update).
   * @param gift - The gift entity to save.
   * @returns The persisted gift.
   */
  save(gift: Gift): Promise<Gift>;

  /**
   * Deletes a gift by its unique identifier.
   * @param id - The gift's unique ID.
   */
  delete(id: UniqueId): Promise<void>;
}
