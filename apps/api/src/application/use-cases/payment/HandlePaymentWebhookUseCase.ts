import { IContributionRepository } from '../../../domain/repositories/IContributionRepository';
import { IPaymentGateway } from '../../../domain/services/IPaymentGateway';
import { IEmailService } from '../../../domain/services/IEmailService';
import { UniqueId } from '../../../domain/value-objects';
import { ContributionStatus } from '../../../domain/entities/Contribution';
import { ValidationError } from '../../../domain/errors/DomainError';

/**
 * Input DTO for payment webhook.
 */
export interface PaymentWebhookInput {
  type: string;
  data?: {
    id?: string;
  };
}

/**
 * Use case for handling payment provider webhooks.
 */
export class HandlePaymentWebhookUseCase {
  constructor(
    private readonly contributionRepository: IContributionRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService
  ) {}

  /**
   * Handles an incoming payment webhook notification.
   * @param input - Webhook payload.
   */
  async execute(input: PaymentWebhookInput): Promise<void> {
    // Validate webhook payload structure
    if (!input.type) {
      throw new ValidationError('Webhook type is required');
    }

    // Only process payment notifications
    if (input.type !== 'payment') {
      console.log('[PaymentWebhook] Ignoring non-payment notification', input.type);
      return;
    }

    if (!input.data?.id) {
      throw new ValidationError('Payment ID is required in webhook data');
    }

    const paymentId = input.data.id;

    // Get payment details from provider
    const paymentDetails = await this.paymentGateway.getPaymentDetails(paymentId);
    if (!paymentDetails) {
      console.log('[PaymentWebhook] Payment not found', paymentId);
      return;
    }

    // Find contribution by external reference (our contribution ID)
    const contributionId = UniqueId.fromString(paymentDetails.externalReference);
    const contribution = await this.contributionRepository.findById(contributionId);

    if (!contribution) {
      console.log('[PaymentWebhook] Contribution not found', paymentDetails.externalReference);
      return;
    }

    // Update contribution status based on payment status
    if (paymentDetails.status === 'approved') {
      contribution.markAsPaid(paymentId);
      await this.contributionRepository.save(contribution);

      // Send confirmation email
      if (contribution.amount) {
        await this.emailService.sendContributionPaid(
          contribution.guestEmail.value,
          contribution.guestName,
          contribution.amount.amount
        );
      }
    } else if (paymentDetails.status === 'rejected') {
      contribution.reject();
      await this.contributionRepository.save(contribution);
    }

    console.log(
      '[PaymentWebhook] Processed payment',
      paymentId,
      'status:',
      paymentDetails.status
    );
  }
}
