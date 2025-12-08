import { Gift } from '../../domain/entities/Gift';
import { UniqueId } from '../../domain/value-objects/UniqueId';
import { IGiftRepository } from '../../domain/repositories/IGiftRepository';

/**
 * In-memory implementation of the Gift repository.
 * Suitable for development and testing purposes.
 */
export class InMemoryGiftRepository implements IGiftRepository {
  private gifts: Map<string, ReturnType<Gift['toPersistence']>> = new Map();

  async findById(id: UniqueId): Promise<Gift | null> {
    const data = this.gifts.get(id.value);
    if (!data) return null;
    return Gift.fromPersistence(data);
  }

  async findByWeddingId(weddingId: UniqueId): Promise<Gift[]> {
    const results: Gift[] = [];
    for (const data of this.gifts.values()) {
      if (data.weddingId === weddingId.value) {
        results.push(Gift.fromPersistence(data));
      }
    }
    return results;
  }

  async save(gift: Gift): Promise<Gift> {
    const data = gift.toPersistence();
    this.gifts.set(data.id, data);
    return gift;
  }

  async delete(id: UniqueId): Promise<void> {
    this.gifts.delete(id.value);
  }
}
