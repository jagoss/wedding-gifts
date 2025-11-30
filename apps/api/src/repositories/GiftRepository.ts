import { Gift } from '../models/types';

/**
 * Repository for managing Gift entities.
 */
export class GiftRepository {
  private gifts: Map<string, Gift> = new Map();

  /**
   * Finds a gift by ID.
   * @param id - The gift ID.
   * @returns The gift if found, otherwise null.
   */
  async findById(id: string): Promise<Gift | null> {
    return this.gifts.get(id) || null;
  }

  /**
   * Finds all gifts for a given wedding.
   * @param weddingId - The wedding ID.
   * @returns An array of gifts.
   */
  async findByWeddingId(weddingId: string): Promise<Gift[]> {
    const results: Gift[] = [];
    for (const gift of this.gifts.values()) {
      if (gift.weddingId === weddingId) results.push(gift);
    }
    return results;
  }

  /**
   * Saves a gift (create or update).
   * @param gift - The gift to save.
   * @returns The saved gift.
   */
  async save(gift: Gift): Promise<Gift> {
    this.gifts.set(gift.id, gift);
    return gift;
  }

  /**
   * Deletes a gift by ID.
   * @param id - The gift ID.
   */
  async delete(id: string): Promise<void> {
    this.gifts.delete(id);
  }
}
