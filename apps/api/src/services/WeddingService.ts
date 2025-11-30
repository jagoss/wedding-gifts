import { Wedding, BankAccount } from '../models/types';
import { WeddingRepository } from '../repositories/WeddingRepository';
import { randomUUID } from 'crypto';

/**
 * Service managing wedding events.
 */
export class WeddingService {
  /**
   * Creates an instance of WeddingService.
   * @param weddingRepo - The wedding repository.
   */
  constructor(private weddingRepo: WeddingRepository) {}

  /**
   * Creates a new wedding.
   * @param userId - The ID of the user creating the wedding.
   * @param data - The wedding data.
   * @returns A promise resolving to the created wedding.
   * @throws Error if title or slug is missing, or if slug is taken.
   */
  async createWedding(userId: string, data: Partial<Wedding>): Promise<Wedding> {
    if (!data.title || !data.slug) {
      throw new Error('Title and slug are required');
    }

    const existing = await this.weddingRepo.findBySlug(data.slug);
    if (existing) {
      throw new Error('Slug already taken');
    }

    const wedding: Wedding = {
      id: randomUUID(),
      userId,
      title: data.title,
      slug: data.slug,
      date: data.date,
      location: data.location,
      message: data.message,
      heroImageUrl: data.heroImageUrl,
      bankAccounts: data.bankAccounts || []
    };

    return this.weddingRepo.save(wedding);
  }

  /**
   * Retrieves a wedding by its ID.
   * @param id - The wedding ID.
   * @returns A promise resolving to the wedding or null.
   */
  async getWeddingById(id: string): Promise<Wedding | null> {
    return this.weddingRepo.findById(id);
  }

  /**
   * Retrieves a wedding by its slug.
   * @param slug - The wedding slug.
   * @returns A promise resolving to the wedding or null.
   */
  async getWeddingBySlug(slug: string): Promise<Wedding | null> {
    return this.weddingRepo.findBySlug(slug);
  }

  /**
   * Retrieves all weddings belonging to a specific user.
   * @param userId - The user ID.
   * @returns A promise resolving to a list of weddings.
   */
  async getUserWeddings(userId: string): Promise<Wedding[]> {
    return this.weddingRepo.findByUserId(userId);
  }

  /**
   * Updates a wedding's details.
   * @param id - The wedding ID.
   * @param userId - The ID of the user attempting the update (for authorization).
   * @param data - The data to update.
   * @returns A promise resolving to the updated wedding.
   * @throws Error if wedding not found or user unauthorized.
   */
  async updateWedding(id: string, userId: string, data: Partial<Wedding>): Promise<Wedding> {
    const wedding = await this.weddingRepo.findById(id);
    if (!wedding) throw new Error('Wedding not found');
    if (wedding.userId !== userId) throw new Error('Unauthorized');

    const updated: Wedding = {
      ...wedding,
      ...data,
      id: wedding.id, // protect id
      userId: wedding.userId // protect owner
    };

    return this.weddingRepo.save(updated);
  }
  
  /**
   * Deletes a wedding.
   * @param id - The wedding ID.
   * @param userId - The ID of the user attempting the delete (for authorization).
   * @returns A promise that resolves when the wedding is deleted.
   * @throws Error if user unauthorized.
   */
  async deleteWedding(id: string, userId: string): Promise<void> {
    const wedding = await this.weddingRepo.findById(id);
    if (!wedding) return; // Idempotent
    if (wedding.userId !== userId) throw new Error('Unauthorized');
    
    await this.weddingRepo.delete(id);
  }
}
