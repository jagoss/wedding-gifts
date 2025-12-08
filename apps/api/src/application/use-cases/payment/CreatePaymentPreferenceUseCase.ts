import { UniqueId } from '../../../domain/value-objects';
import { IContributionRepository } from '../../../domain/repositories/IContributionRepository';
import { IPaymentGateway } from '../../../domain/services/IPaymentGateway';
import { EntityNotFoundError, ValidationError } from '../../../domain/errors/DomainError';

/**
 * Input DTO for creating a payment preference.
 */
export interface CreatePaymentPreferenceInput {
  contributionId: string;
  weddingId: string;
}

/**
 * Output DTO for payment preference.
 */
export interface PaymentPreferenceOutput {
  preferenceId: string;
  checkoutUrl: string;
}

/**
 * Use case for creating a payment preference for an existing contribution.
 */
export class CreatePaymentPreferenceUseCase {
  constructor(
    private readonly contributionRepository: IContributionRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  /**
   * Creates a payment preference for a contribution.
   * @param input - Payment preference input.
   * @returns The preference ID and checkout URL.
   */
  async execute(input: CreatePaymentPreferenceInput): Promise<PaymentPreferenceOutput> {
    const contributionId = UniqueId.fromString(input.contributionId);
    const contribution = await this.contributionRepository.findById(contributionId);

    if (!contribution) {
      throw new EntityNotFoundError('Contribution', input.contributionId);
    }

    if (!contribution.amount) {
      throw new ValidationError('Contribution has no amount');
    }

    const preference = await this.paymentGateway.createPreference({
      contributionId: contribution.id.value,
      weddingId: input.weddingId,
      amount: contribution.amount.amount,
      currency: contribution.amount.currency,
      description: `Contribution from ${contribution.guestName}`,
      payerEmail: contribution.guestEmail.value,
      payerName: contribution.guestName,
    });

    return {
      preferenceId: preference.preferenceId,
      checkoutUrl: preference.checkoutUrl,
    };
  }
}
