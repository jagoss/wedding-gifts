import { Wedding, BankAccountDetails } from '../../../domain/entities/Wedding';
import { UniqueId, Slug } from '../../../domain/value-objects';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { ConflictError } from '../../../domain/errors/DomainError';
import { WeddingOutput } from '../../dtos/WeddingDtos';

/**
 * Input DTO for creating a wedding.
 */
export interface CreateWeddingInput {
  userId: string;
  title: string;
  slug: string;
  date?: string | null;
  location?: string | null;
  message?: string | null;
  heroImageUrl?: string | null;
  bankAccounts?: BankAccountDetails[];
}

/**
 * Use case for creating a new wedding.
 */
export class CreateWeddingUseCase {
  constructor(private readonly weddingRepository: IWeddingRepository) {}

  /**
   * Creates a new wedding for the authenticated user.
   * @param input - Wedding creation data.
   * @returns The created wedding.
   * @throws ConflictError if slug is already taken.
   */
  async execute(input: CreateWeddingInput): Promise<WeddingOutput> {
    const slug = Slug.create(input.slug);
    const userId = UniqueId.fromString(input.userId);

    // Check if slug is already taken
    const slugExists = await this.weddingRepository.existsBySlug(slug);
    if (slugExists) {
      throw new ConflictError('This slug is already taken');
    }

    // Create wedding entity
    const wedding = Wedding.create({
      userId,
      title: input.title,
      slug,
      date: input.date,
      location: input.location,
      message: input.message,
      heroImageUrl: input.heroImageUrl,
      bankAccounts: input.bankAccounts,
    });

    // Persist
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
