import { Contribution } from '../../../domain/entities/Contribution';
import { UniqueId } from '../../../domain/value-objects';
import { IContributionRepository } from '../../../domain/repositories/IContributionRepository';
import { ContributionOutput } from '../../dtos/ContributionDtos';

/**
 * Use case for retrieving all contributions for a wedding (admin).
 */
export class GetWeddingContributionsUseCase {
  constructor(private readonly contributionRepository: IContributionRepository) {}

  /**
   * Retrieves all contributions for a wedding.
   * @param weddingId - The wedding's unique identifier.
   * @returns List of contributions.
   */
  async execute(weddingId: string): Promise<ContributionOutput[]> {
    const id = UniqueId.fromString(weddingId);
    const contributions = await this.contributionRepository.findByWeddingId(id);

    return contributions.map((c) => this.toOutput(c));
  }

  private toOutput(contribution: Contribution): ContributionOutput {
    return {
      id: contribution.id.value,
      weddingId: contribution.weddingId.value,
      giftId: contribution.giftId.value,
      guestName: contribution.guestName,
      guestEmail: contribution.guestEmail.value,
      type: contribution.type,
      amount: contribution.amount?.amount ?? null,
      currency: contribution.amount?.currency ?? null,
      status: contribution.status,
      paymentProvider: contribution.paymentProvider,
      createdAt: contribution.createdAt.toISOString(),
    };
  }
}
