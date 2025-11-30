import { Wedding } from '../../domain/entities/Wedding';
import { UniqueId } from '../../domain/value-objects/UniqueId';
import { Slug } from '../../domain/value-objects/Slug';
import { IWeddingRepository } from '../../domain/repositories/IWeddingRepository';

/**
 * In-memory implementation of the Wedding repository.
 * Suitable for development and testing purposes.
 */
export class InMemoryWeddingRepository implements IWeddingRepository {
  private weddings: Map<string, ReturnType<Wedding['toPersistence']>> = new Map();

  async findById(id: UniqueId): Promise<Wedding | null> {
    const data = this.weddings.get(id.value);
    if (!data) return null;
    return Wedding.fromPersistence(data);
  }

  async findBySlug(slug: Slug): Promise<Wedding | null> {
    for (const data of this.weddings.values()) {
      if (data.slug === slug.value) {
        return Wedding.fromPersistence(data);
      }
    }
    return null;
  }

  async findByUserId(userId: UniqueId): Promise<Wedding[]> {
    const results: Wedding[] = [];
    for (const data of this.weddings.values()) {
      if (data.userId === userId.value) {
        results.push(Wedding.fromPersistence(data));
      }
    }
    return results;
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    for (const data of this.weddings.values()) {
      if (data.slug === slug.value) {
        return true;
      }
    }
    return false;
  }

  async save(wedding: Wedding): Promise<Wedding> {
    const data = wedding.toPersistence();
    this.weddings.set(data.id, data);
    return wedding;
  }

  async delete(id: UniqueId): Promise<void> {
    this.weddings.delete(id.value);
  }
}
