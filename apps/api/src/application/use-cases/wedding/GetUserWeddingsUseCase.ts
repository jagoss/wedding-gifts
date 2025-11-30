import { UniqueId } from '../../../domain/value-objects';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { WeddingListOutput } from '../../dtos/WeddingDtos';

/**
 * Use case for retrieving all weddings belonging to a user.
 */
export class GetUserWeddingsUseCase {
  constructor(private readonly weddingRepository: IWeddingRepository) {}

  /**
   * Retrieves all weddings for the authenticated user.
   * @param userId - The user's unique identifier.
   * @returns List of user's weddings.
   */
  async execute(userId: string): Promise<WeddingListOutput[]> {
    const id = UniqueId.fromString(userId);
    const weddings = await this.weddingRepository.findByUserId(id);

    return weddings.map((wedding) => ({
      id: wedding.id.value,
      title: wedding.title,
      slug: wedding.slug.value,
      date: wedding.date,
      location: wedding.location,
    }));
  }
}
