import { UniqueId } from '../../../domain/value-objects';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';

/**
 * Use case for deleting a gift.
 */
export class DeleteGiftUseCase {
  constructor(private readonly giftRepository: IGiftRepository) {}

  /**
   * Deletes a gift.
   * @param giftId - The gift's unique identifier.
   */
  async execute(giftId: string): Promise<void> {
    const id = UniqueId.fromString(giftId);
    await this.giftRepository.delete(id);
  }
}
