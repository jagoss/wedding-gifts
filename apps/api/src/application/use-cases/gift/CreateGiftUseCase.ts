import { Gift, GiftType } from '../../../domain/entities/Gift';
import { Money, UniqueId } from '../../../domain/value-objects';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';
import { GiftOutput } from '../../dtos/GiftDtos';

/**
 * Input DTO for creating a gift.
 */
export interface CreateGiftInput {
  userId: string;
  weddingId: string;
  title: string;
  type: GiftType;
  description?: string | null;
  estimatedPrice?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  maxContributions?: number | null;
}

/**
 * Use case for creating a new gift in a wedding registry.
 */
export class CreateGiftUseCase {
  constructor(
    private readonly giftRepository: IGiftRepository,
    private readonly weddingRepository: IWeddingRepository
  ) {}

  /**
   * Creates a new gift for a wedding.
   * @param input - Gift creation data.
   * @returns The created gift.
   */
  async execute(input: CreateGiftInput): Promise<GiftOutput> {
    const weddingId = UniqueId.fromString(input.weddingId);
    const userId = UniqueId.fromString(input.userId);

    // Verify wedding exists
    const wedding = await this.weddingRepository.findById(weddingId);
    if (!wedding) {
      throw new EntityNotFoundError('Wedding', input.weddingId);
    }

    // Enforce ownership
    wedding.ensureOwnedBy(userId);

    // Build Money value object if price is provided
    const estimatedPrice =
      input.estimatedPrice !== null &&
      input.estimatedPrice !== undefined &&
      input.currency
        ? Money.create(input.estimatedPrice, input.currency)
        : null;

    const gift = Gift.create({
      weddingId,
      title: input.title,
      type: input.type,
      description: input.description,
      estimatedPrice,
      imageUrl: input.imageUrl,
      productUrl: input.productUrl,
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
