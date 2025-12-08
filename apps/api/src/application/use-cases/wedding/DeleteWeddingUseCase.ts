import { UniqueId } from '../../../domain/value-objects';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';

/**
 * Input DTO for deleting a wedding.
 */
export interface DeleteWeddingInput {
  weddingId: string;
  userId: string;
}

/**
 * Use case for deleting a wedding.
 */
export class DeleteWeddingUseCase {
  constructor(private readonly weddingRepository: IWeddingRepository) {}

  /**
   * Deletes a wedding if the user is the owner.
   * @param input - Delete parameters.
   * @throws UnauthorizedError if user doesn't own the wedding.
   */
  async execute(input: DeleteWeddingInput): Promise<void> {
    const weddingId = UniqueId.fromString(input.weddingId);
    const userId = UniqueId.fromString(input.userId);

    const wedding = await this.weddingRepository.findById(weddingId);

    // Throw error if wedding doesn't exist
    if (!wedding) {
      throw new EntityNotFoundError('Wedding', input.weddingId);
    }

    // Check ownership (throws if unauthorized)
    wedding.ensureOwnedBy(userId);

    await this.weddingRepository.delete(weddingId);
  }
}
