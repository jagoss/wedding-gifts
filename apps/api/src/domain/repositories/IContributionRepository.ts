import { Contribution } from '../entities/Contribution';
import { UniqueId } from '../value-objects/UniqueId';

/**
 * Repository interface for Contribution persistence operations.
 * Defines the contract that any Contribution repository implementation must fulfill.
 */
export interface IContributionRepository {
  /**
   * Finds a contribution by its unique identifier.
   * @param id - The contribution's unique ID.
   * @returns The contribution if found, null otherwise.
   */
  findById(id: UniqueId): Promise<Contribution | null>;

  /**
   * Finds all contributions for a specific wedding.
   * @param weddingId - The wedding's unique ID.
   * @returns Array of contributions for the wedding.
   */
  findByWeddingId(weddingId: UniqueId): Promise<Contribution[]>;

  /**
   * Finds all contributions for a specific gift.
   * @param giftId - The gift's unique ID.
   * @returns Array of contributions for the gift.
   */
  findByGiftId(giftId: UniqueId): Promise<Contribution[]>;

  /**
   * Finds a contribution by the payment provider's reference ID.
   * @param paymentProviderId - The external payment ID.
   * @returns The contribution if found, null otherwise.
   */
  findByPaymentProviderId(paymentProviderId: string): Promise<Contribution | null>;

  /**
   * Persists a contribution (create or update).
   * @param contribution - The contribution entity to save.
   * @returns The persisted contribution.
   */
  save(contribution: Contribution): Promise<Contribution>;
}
