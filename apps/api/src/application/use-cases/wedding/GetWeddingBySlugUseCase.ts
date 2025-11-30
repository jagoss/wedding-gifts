import { Slug } from '../../../domain/value-objects';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';
import { GiftStatus } from '../../../domain/entities/Gift';
import { PublicWeddingOutput } from '../../dtos/WeddingDtos';

/**
 * Use case for retrieving a wedding by slug (public access).
 */
export class GetWeddingBySlugUseCase {
  constructor(
    private readonly weddingRepository: IWeddingRepository,
    private readonly giftRepository: IGiftRepository
  ) {}

  /**
   * Retrieves a wedding by its public slug.
   * @param slugValue - The wedding's URL slug.
   * @returns Public wedding data with gifts.
   * @throws EntityNotFoundError if wedding is not found.
   */
  async execute(slugValue: string): Promise<PublicWeddingOutput> {
    const slug = Slug.fromPersistence(slugValue);
    const wedding = await this.weddingRepository.findBySlug(slug);

    if (!wedding) {
      throw new EntityNotFoundError('Wedding', slugValue);
    }

    // Get gifts for this wedding (exclude hidden ones for public view)
    const gifts = await this.giftRepository.findByWeddingId(wedding.id);
    const publicGifts = gifts.filter((g) => g.status !== GiftStatus.HIDDEN);

    return {
      wedding: {
        id: wedding.id.value,
        title: wedding.title,
        slug: wedding.slug.value,
        date: wedding.date,
        location: wedding.location,
        message: wedding.message,
        heroImageUrl: wedding.heroImageUrl,
      },
      gifts: publicGifts.map((g) => ({
        id: g.id.value,
        title: g.title,
        description: g.description,
        estimatedPrice: g.estimatedPrice?.amount ?? null,
        currency: g.estimatedPrice?.currency ?? null,
        imageUrl: g.imageUrl,
        productUrl: g.productUrl,
        type: g.type,
        status: g.status,
      })),
    };
  }
}
