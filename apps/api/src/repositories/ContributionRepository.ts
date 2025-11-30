import { Contribution, ContributionStatus } from '../models/types';

/**
 * Repository for managing Contribution entities.
 */
export class ContributionRepository {
  private contributions: Map<string, Contribution> = new Map();

  /**
   * Finds a contribution by ID.
   * @param id - The contribution ID.
   * @returns The contribution if found, otherwise null.
   */
  async findById(id: string): Promise<Contribution | null> {
    return this.contributions.get(id) || null;
  }

  /**
   * Finds all contributions for a specific wedding.
   * @param weddingId - The wedding ID.
   * @returns An array of contributions.
   */
  async findByWeddingId(weddingId: string): Promise<Contribution[]> {
    const results: Contribution[] = [];
    for (const c of this.contributions.values()) {
      if (c.weddingId === weddingId) results.push(c);
    }
    return results;
  }

  /**
   * Finds all contributions for a specific gift.
   * @param giftId - The gift ID.
   * @returns An array of contributions.
   */
  async findByGiftId(giftId: string): Promise<Contribution[]> {
    const results: Contribution[] = [];
    for (const c of this.contributions.values()) {
      if (c.giftId === giftId) results.push(c);
    }
    return results;
  }
  
  /**
   * Finds a contribution by the payment provider's ID.
   * @param paymentId - The payment ID from the provider.
   * @returns The contribution if found, otherwise null.
   */
  async findByPaymentId(paymentId: string): Promise<Contribution | null> {
    for (const c of this.contributions.values()) {
      if (c.paymentProviderId === paymentId) return c;
    }
    return null;
  }

  /**
   * Saves a contribution (create or update).
   * @param contribution - The contribution to save.
   * @returns The saved contribution.
   */
  async save(contribution: Contribution): Promise<Contribution> {
    this.contributions.set(contribution.id, contribution);
    return contribution;
  }
}
