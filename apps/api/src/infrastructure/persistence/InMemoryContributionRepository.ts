import { Contribution } from '../../domain/entities/Contribution';
import { UniqueId } from '../../domain/value-objects/UniqueId';
import { IContributionRepository } from '../../domain/repositories/IContributionRepository';

/**
 * In-memory implementation of the Contribution repository.
 * Suitable for development and testing purposes.
 */
export class InMemoryContributionRepository implements IContributionRepository {
  private contributions: Map<string, ReturnType<Contribution['toPersistence']>> = new Map();

  async findById(id: UniqueId): Promise<Contribution | null> {
    const data = this.contributions.get(id.value);
    if (!data) return null;
    return Contribution.fromPersistence(data);
  }

  async findByWeddingId(weddingId: UniqueId): Promise<Contribution[]> {
    const results: Contribution[] = [];
    for (const data of this.contributions.values()) {
      if (data.weddingId === weddingId.value) {
        results.push(Contribution.fromPersistence(data));
      }
    }
    return results;
  }

  async findByGiftId(giftId: UniqueId): Promise<Contribution[]> {
    const results: Contribution[] = [];
    for (const data of this.contributions.values()) {
      if (data.giftId === giftId.value) {
        results.push(Contribution.fromPersistence(data));
      }
    }
    return results;
  }

  async findByPaymentProviderId(paymentProviderId: string): Promise<Contribution | null> {
    for (const data of this.contributions.values()) {
      if (data.paymentProviderId === paymentProviderId) {
        return Contribution.fromPersistence(data);
      }
    }
    return null;
  }

  async save(contribution: Contribution): Promise<Contribution> {
    const data = contribution.toPersistence();
    this.contributions.set(data.id, data);
    return contribution;
  }
}
