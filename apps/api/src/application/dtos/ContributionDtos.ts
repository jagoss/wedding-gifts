import {
  ContributionType,
  ContributionStatus,
  PaymentProvider,
} from '../../domain/entities/Contribution';

/**
 * Full contribution output DTO.
 */
export interface ContributionOutput {
  id: string;
  weddingId: string;
  giftId: string;
  guestName: string;
  guestEmail: string;
  type: ContributionType;
  amount: number | null;
  currency: string | null;
  status: ContributionStatus;
  paymentProvider: PaymentProvider | null;
  createdAt: string;
}

/**
 * Response when creating a contribution with payment.
 */
export interface CreateContributionResponse {
  contributionId: string;
  status: ContributionStatus;
  payment: {
    provider: string;
    preferenceId: string;
    checkoutUrl: string;
  } | null;
}
