import { UniqueId } from '../../../domain/value-objects';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';

/**
 * Use case for deleting a gift.
 */
export class DeleteGiftUseCase {
  constructor(
    private readonly giftRepository: IGiftRepository,
    private readonly weddingRepository: IWeddingRepository
  ) {}

  /**
   * Deletes a gift.
   * @param input - Delete parameters.
   * @throws EntityNotFoundError if gift is not found.
   */
  async execute(input: { giftId: string; userId: string }): Promise<void> {
    const id = UniqueId.fromString(input.giftId);
    const userId = UniqueId.fromString(input.userId);

    // Check if gift exists
    const gift = await this.giftRepository.findById(id);
    if (!gift) {
      throw new EntityNotFoundError('Gift', input.giftId);
    }

    const wedding = await this.weddingRepository.findById(gift.weddingId);
    if (!wedding) {
      throw new EntityNotFoundError('Wedding', gift.weddingId.value);
    }

    // Enforce ownership
    wedding.ensureOwnedBy(userId);

    await this.giftRepository.delete(id);
  }
}
