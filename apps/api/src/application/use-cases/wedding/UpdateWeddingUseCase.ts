import { Wedding, BankAccountDetails } from '../../../domain/entities/Wedding';
import { UniqueId } from '../../../domain/value-objects';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';
import { WeddingOutput } from '../../dtos/WeddingDtos';

/**
 * Input DTO for updating a wedding.
 */
export interface UpdateWeddingInput {
  weddingId: string;
  userId: string;
  title?: string;
  date?: string | null;
  location?: string | null;
  message?: string | null;
  heroImageUrl?: string | null;
  bankAccounts?: BankAccountDetails[];
}

/**
 * Use case for updating a wedding.
 */
export class UpdateWeddingUseCase {
  constructor(private readonly weddingRepository: IWeddingRepository) {}

  /**
   * Updates an existing wedding.
   * @param input - Update data.
   * @returns The updated wedding.
   * @throws EntityNotFoundError if wedding is not found.
   * @throws UnauthorizedError if user doesn't own the wedding.
   */
  async execute(input: UpdateWeddingInput): Promise<WeddingOutput> {
    const weddingId = UniqueId.fromString(input.weddingId);
    const userId = UniqueId.fromString(input.userId);

    const wedding = await this.weddingRepository.findById(weddingId);
    if (!wedding) {
      throw new EntityNotFoundError('Wedding', input.weddingId);
    }

    // Domain entity handles authorization check
    wedding.update(userId, {
      title: input.title,
      date: input.date,
      location: input.location,
      message: input.message,
      heroImageUrl: input.heroImageUrl,
      bankAccounts: input.bankAccounts,
    });

    const saved = await this.weddingRepository.save(wedding);

    return this.toOutput(saved);
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
