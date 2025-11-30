import {
  Contribution,
  ContributionType,
  PaymentProvider,
} from '../../../domain/entities/Contribution';
import { Email, Money, UniqueId } from '../../../domain/value-objects';
import { IContributionRepository } from '../../../domain/repositories/IContributionRepository';
import { IGiftRepository } from '../../../domain/repositories/IGiftRepository';
import { IWeddingRepository } from '../../../domain/repositories/IWeddingRepository';
import { IEmailService } from '../../../domain/services/IEmailService';
import { IPaymentGateway } from '../../../domain/services/IPaymentGateway';
import { Slug } from '../../../domain/value-objects/Slug';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';
import { CreateContributionResponse } from '../../dtos/ContributionDtos';

/**
 * Input DTO for creating a public contribution.
 */
export interface CreateContributionInput {
  weddingSlug: string;
  giftId: string;
  guestName: string;
  guestEmail: string;
  type: ContributionType;
  amount?: number | null;
  currency?: string | null;
  paymentMethod: PaymentProvider;
}

/**
 * Use case for creating a public contribution to a wedding gift.
 */
export class CreateContributionUseCase {
  constructor(
    private readonly weddingRepository: IWeddingRepository,
    private readonly giftRepository: IGiftRepository,
    private readonly contributionRepository: IContributionRepository,
    private readonly emailService: IEmailService,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  /**
   * Creates a contribution for a wedding gift.
   * @param input - Contribution data.
   * @returns The contribution ID, status, and payment info if applicable.
   */
  async execute(input: CreateContributionInput): Promise<CreateContributionResponse> {
    // Find wedding by slug
    const slug = Slug.fromPersistence(input.weddingSlug);
    const wedding = await this.weddingRepository.findBySlug(slug);
    if (!wedding) {
      throw new EntityNotFoundError('Wedding', input.weddingSlug);
    }

    // Validate gift exists and belongs to wedding
    const giftId = UniqueId.fromString(input.giftId);
    const gift = await this.giftRepository.findById(giftId);
    if (!gift || !gift.weddingId.equals(wedding.id)) {
      throw new EntityNotFoundError('Gift', input.giftId);
    }

    // Build amount if provided
    const amount =
      input.amount !== null && input.amount !== undefined && input.currency
        ? Money.create(input.amount, input.currency)
        : null;

    // Create contribution entity
    const contribution = Contribution.create({
      weddingId: wedding.id,
      giftId: gift.id,
      guestName: input.guestName,
      guestEmail: Email.create(input.guestEmail),
      type: input.type,
      amount,
      paymentProvider: input.paymentMethod,
    });

    // Persist contribution
    await this.contributionRepository.save(contribution);

    // Send confirmation email
    await this.emailService.sendContributionCreated(
      input.guestEmail,
      input.guestName,
      gift.title
    );

    // Create payment preference if MercadoPago
    let paymentResponse = null;
    if (input.paymentMethod === PaymentProvider.MERCADOPAGO && amount) {
      const preference = await this.paymentGateway.createPreference({
        contributionId: contribution.id.value,
        weddingId: wedding.id.value,
        amount: amount.amount,
        currency: amount.currency,
        description: `Contribution to ${gift.title}`,
        payerEmail: input.guestEmail,
        payerName: input.guestName,
      });

      paymentResponse = {
        provider: 'MERCADOPAGO',
        preferenceId: preference.preferenceId,
        checkoutUrl: preference.checkoutUrl,
      };
    }

    return {
      contributionId: contribution.id.value,
      status: contribution.status,
      payment: paymentResponse,
    };
  }
}
