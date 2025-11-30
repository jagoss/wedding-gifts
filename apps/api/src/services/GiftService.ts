import { Gift, GiftType, GiftStatus } from '../models/types';
import { GiftRepository } from '../repositories/GiftRepository';
import { randomUUID } from 'crypto';

/**
 * Service managing gifts within weddings.
 */
export class GiftService {
  /**
   * Creates an instance of GiftService.
   * @param giftRepo - The gift repository.
   */
  constructor(private giftRepo: GiftRepository) {}

  /**
   * Retrieves all gifts for a specific wedding.
   * @param weddingId - The wedding ID.
   * @returns A promise resolving to a list of gifts.
   */
  async getWeddingGifts(weddingId: string): Promise<Gift[]> {
    return this.giftRepo.findByWeddingId(weddingId);
  }

  /**
   * Creates a new gift for a wedding.
   * @param weddingId - The wedding ID.
   * @param data - The gift data.
   * @returns A promise resolving to the created gift.
   * @throws Error if title or type is missing.
   */
  async createGift(weddingId: string, data: Partial<Gift>): Promise<Gift> {
    if (!data.title || !data.type) {
      throw new Error('Title and type are required');
    }

    const gift: Gift = {
      id: randomUUID(),
      weddingId,
      title: data.title,
      description: data.description,
      estimatedPrice: data.estimatedPrice,
      currency: data.currency,
      imageUrl: data.imageUrl,
      productUrl: data.productUrl,
      type: data.type,
      status: GiftStatus.AVAILABLE,
      maxContributions: data.maxContributions
    };

    return this.giftRepo.save(gift);
  }

  /**
   * Updates a gift's details.
   * @param id - The gift ID.
   * @param data - The data to update.
   * @returns A promise resolving to the updated gift.
   * @throws Error if gift not found.
   */
  async updateGift(id: string, data: Partial<Gift>): Promise<Gift> {
    const gift = await this.giftRepo.findById(id);
    if (!gift) throw new Error('Gift not found');

    const updated: Gift = {
      ...gift,
      ...data,
      id: gift.id,
      weddingId: gift.weddingId
    };

    return this.giftRepo.save(updated);
  }

  /**
   * Deletes a gift.
   * @param id - The gift ID.
   * @returns A promise that resolves when the gift is deleted.
   */
  async deleteGift(id: string): Promise<void> {
    await this.giftRepo.delete(id);
  }
  
  /**
   * Retrieves a gift by its ID.
   * @param id - The gift ID.
   * @returns A promise resolving to the gift or null.
   */
  async getGift(id: string): Promise<Gift | null> {
    return this.giftRepo.findById(id);
  }
}
