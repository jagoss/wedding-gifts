import { Gift, GiftType, GiftStatus } from '../../../domain/entities/Gift';
import { Money, UniqueId } from '../../../domain/value-objects';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';
import { GiftOutput } from '../../dtos/GiftDtos';

/**
 * Input DTO for updating a gift.
 */
export interface UpdateGiftInput {
  giftId: string;
  title?: string;
  description?: string | null;
  estimatedPrice?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  type?: GiftType;
  status?: GiftStatus;
  maxContributions?: number | null;
}

/**
 * Use case for updating a gift.
 */
export class UpdateGiftUseCase {
  constructor(private readonly giftRepository: IGiftRepository) {}

  /**
   * Updates an existing gift.
   * @param input - Update data.
   * @returns The updated gift.
   * @throws EntityNotFoundError if gift is not found.
   */
  async execute(input: UpdateGiftInput): Promise<GiftOutput> {
    const giftId = UniqueId.fromString(input.giftId);
    const gift = await this.giftRepository.findById(giftId);

    if (!gift) {
      throw new EntityNotFoundError('Gift', input.giftId);
    }

    // Build Money if price update is provided
    let estimatedPrice: Money | null | undefined = undefined;
    if (input.estimatedPrice !== undefined) {
      estimatedPrice =
        input.estimatedPrice !== null && input.currency
          ? Money.create(input.estimatedPrice, input.currency)
          : null;
    }

    gift.update({
      title: input.title,
      description: input.description,
      estimatedPrice,
      imageUrl: input.imageUrl,
      productUrl: input.productUrl,
      type: input.type,
      status: input.status,
      maxContributions: input.maxContributions,
    });

    const saved = await this.giftRepository.save(gift);

    return this.toOutput(saved);
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
