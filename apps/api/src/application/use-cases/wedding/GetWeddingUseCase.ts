import { Wedding } from '../../../domain/entities/Wedding';
import { UniqueId } from '../../../domain/value-objects';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';
import { WeddingOutput } from '../../dtos/WeddingDtos';

/**
 * Use case for retrieving a wedding by ID.
 */
export class GetWeddingUseCase {
  constructor(private readonly weddingRepository: IWeddingRepository) {}

  /**
   * Retrieves a wedding by its ID.
   * @param weddingId - The wedding's unique identifier.
   * @returns The wedding data.
   * @throws EntityNotFoundError if wedding is not found.
   */
  async execute(weddingId: string): Promise<WeddingOutput> {
    const id = UniqueId.fromString(weddingId);
    const wedding = await this.weddingRepository.findById(id);

    if (!wedding) {
      throw new EntityNotFoundError('Wedding', weddingId);
    }

    return this.toOutput(wedding);
  }

  private toOutput(wedding: Wedding): WeddingOutput {
    return {
      id: wedding.id.value,
      userId: wedding.userId.value,
      title: wedding.title,
      slug: wedding.slug.value,
      date: wedding.date,
      location: wedding.location,
      message: wedding.message,
      heroImageUrl: wedding.heroImageUrl,
      bankAccounts: wedding.bankAccounts,
    };
  }
}
