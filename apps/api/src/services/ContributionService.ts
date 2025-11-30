import { Contribution, ContributionStatus, ContributionType, PaymentProvider } from '../models/types';
import { ContributionRepository } from '../repositories/ContributionRepository';
import { EmailService } from './EmailService';
import { GiftRepository } from '../repositories/GiftRepository';
import { randomUUID } from 'crypto';

/**
 * Service managing contributions (payments/reservations) for gifts.
 */
export class ContributionService {
  /**
   * Creates an instance of ContributionService.
   * @param contributionRepo - The contribution repository.
   * @param giftRepo - The gift repository.
   * @param emailService - The email service.
   */
  constructor(
    private contributionRepo: ContributionRepository,
    private giftRepo: GiftRepository,
    private emailService: EmailService
  ) {}

  /**
   * Creates a new contribution.
   * @param weddingId - The wedding ID.
   * @param data - The contribution details.
   * @returns A promise resolving to the created contribution.
   * @throws Error if the gift is not found.
   */
  async createContribution(
    weddingId: string,
    data: {
      giftId: string;
      guestName: string;
      guestEmail: string;
      type: ContributionType;
      amount?: number;
      paymentMethod: PaymentProvider;
    }
  ): Promise<Contribution> {
    const gift = await this.giftRepo.findById(data.giftId);
    if (!gift) throw new Error('Gift not found');

    const contribution: Contribution = {
      id: randomUUID(),
      weddingId,
      giftId: data.giftId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      type: data.type,
      amount: data.amount,
      status: ContributionStatus.PENDING,
      paymentProvider: data.paymentMethod,
      createdAt: new Date().toISOString()
    };

    await this.contributionRepo.save(contribution);

    // Send email
    await this.emailService.sendContributionCreated(data.guestEmail, data.guestName, gift.title);

    return contribution;
  }

  /**
   * Retrieves a contribution by its ID.
   * @param id - The contribution ID.
   * @returns A promise resolving to the contribution or null.
   */
  async getContribution(id: string): Promise<Contribution | null> {
    return this.contributionRepo.findById(id);
  }
  
  /**
   * Updates the status of a contribution.
   * @param id - The contribution ID.
   * @param status - The new status.
   * @returns A promise resolving to the updated contribution.
   * @throws Error if contribution not found.
   */
  async updateStatus(id: string, status: ContributionStatus): Promise<Contribution> {
    const contribution = await this.contributionRepo.findById(id);
    if (!contribution) throw new Error('Contribution not found');
    
    contribution.status = status;
    const saved = await this.contributionRepo.save(contribution);
    
    if (status === ContributionStatus.PAID && contribution.amount) {
      await this.emailService.sendContributionPaid(contribution.guestEmail, contribution.guestName, contribution.amount);
    }
    
    return saved;
  }

  /**
   * Retrieves all contributions for a specific wedding.
   * @param weddingId - The wedding ID.
   * @returns A promise resolving to a list of contributions.
   */
  async getWeddingContributions(weddingId: string): Promise<Contribution[]> {
    return this.contributionRepo.findByWeddingId(weddingId);
  }
}
