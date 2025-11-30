import { Gift } from '../../../domain/entities/Gift';
import { UniqueId } from '../../../domain/value-objects';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { GiftOutput } from '../../dtos/GiftDtos';

/**
 * Use case for retrieving all gifts for a wedding.
 */
export class GetWeddingGiftsUseCase {
  constructor(private readonly giftRepository: IGiftRepository) {}

  /**
   * Retrieves all gifts for a wedding.
   * @param weddingId - The wedding's unique identifier.
   * @returns List of gifts.
   */
  async execute(weddingId: string): Promise<GiftOutput[]> {
    const id = UniqueId.fromString(weddingId);
    const gifts = await this.giftRepository.findByWeddingId(id);

    return gifts.map((gift) => this.toOutput(gift));
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
