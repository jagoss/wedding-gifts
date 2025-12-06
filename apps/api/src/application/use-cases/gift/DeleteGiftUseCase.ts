import { UniqueId } from '../../../domain/value-objects';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';

/**
 * Use case for deleting a gift.
 */
export class DeleteGiftUseCase {
  constructor(private readonly giftRepository: IGiftRepository) {}

  /**
   * Deletes a gift.
   * @param giftId - The gift's unique identifier.
   * @throws EntityNotFoundError if gift is not found.
   */
  async execute(giftId: string): Promise<void> {
    const id = UniqueId.fromString(giftId);
    
    // Check if gift exists
    const gift = await this.giftRepository.findById(id);
    if (!gift) {
      throw new EntityNotFoundError('Gift', giftId);
    }
    
    await this.giftRepository.delete(id);
  }
}
