import { UniqueId } from '../../../domain/value-objects';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';

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

    // Idempotent: if wedding doesn't exist, consider it deleted
    if (!wedding) {
      return;
    }

    // Check ownership (throws if unauthorized)
    wedding.ensureOwnedBy(userId);

    await this.weddingRepository.delete(weddingId);
  }
}
