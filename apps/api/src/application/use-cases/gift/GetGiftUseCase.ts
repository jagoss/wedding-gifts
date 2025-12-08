import { Gift } from '../../../domain/entities/Gift';
import { UniqueId } from '../../../domain/value-objects';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';
import { GiftOutput } from '../../dtos/GiftDtos';

/**
 * Use case for retrieving a gift by ID.
 */
export class GetGiftUseCase {
  constructor(private readonly giftRepository: IGiftRepository) {}

  /**
   * Retrieves a gift by its ID.
   * @param giftId - The gift's unique identifier.
   * @returns The gift data.
   * @throws EntityNotFoundError if gift is not found.
   */
  async execute(giftId: string): Promise<GiftOutput> {
    const id = UniqueId.fromString(giftId);
    const gift = await this.giftRepository.findById(id);

    if (!gift) {
      throw new EntityNotFoundError('Gift', giftId);
    }

    return this.toOutput(gift);
  }

  private toOutput(gift: Gift): GiftOutput {
    return {
      id: gift.id.value,
      weddingId: gift.weddingId.value,
      title: gift.title,
      description: gift.description,
      estimatedPrice: gift.estimatedPrice?.amount ?? null,
      currency: gift.estimatedPrice?.currency ?? null,
      imageUrl: gift.imageUrl,
      productUrl: gift.productUrl,
      type: gift.type,
      status: gift.status,
      maxContributions: gift.maxContributions,
    };
  }
}
