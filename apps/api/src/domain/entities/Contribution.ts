import { UniqueId, Money, Email } from '../value-objects';
import { ValidationError } from '../errors/DomainError';

/**
 * Contribution type enumeration.
 */
export enum ContributionType {
  CONTRIBUTION = 'CONTRIBUTION',
  RESERVATION = 'RESERVATION',
}

/**
 * Contribution status enumeration.
 */
export enum ContributionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

/**
 * Payment provider enumeration.
 */
export enum PaymentProvider {
  MERCADOPAGO = 'MERCADOPAGO',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

/**
 * Props for creating a Contribution entity.
 */
export interface ContributionProps {
  id: UniqueId;
  weddingId: UniqueId;
  giftId: UniqueId;
  guestName: string;
  guestEmail: Email;
  type: ContributionType;
  amount: Money | null;
  status: ContributionStatus;
  paymentProvider: PaymentProvider | null;
  paymentProviderId: string | null;
  createdAt: Date;
}

/**
 * Contribution entity representing a guest's gift contribution.
 * Tracks payment status and provider details.
 */
export class Contribution {
  private readonly _id: UniqueId;
  private readonly _weddingId: UniqueId;
  private readonly _giftId: UniqueId;
  private readonly _guestName: string;
  private readonly _guestEmail: Email;
  private readonly _type: ContributionType;
  private readonly _amount: Money | null;
  private _status: ContributionStatus;
  private readonly _paymentProvider: PaymentProvider | null;
  private _paymentProviderId: string | null;
  private readonly _createdAt: Date;

  private constructor(props: ContributionProps) {
    this._id = props.id;
    this._weddingId = props.weddingId;
    this._giftId = props.giftId;
    this._guestName = props.guestName;
    this._guestEmail = props.guestEmail;
    this._type = props.type;
    this._amount = props.amount;
    this._status = props.status;
    this._paymentProvider = props.paymentProvider;
    this._paymentProviderId = props.paymentProviderId;
    this._createdAt = props.createdAt;
  }

  /**
   * Factory method to create a new Contribution.
   */
  static create(params: {
    weddingId: UniqueId;
    giftId: UniqueId;
    guestName: string;
    guestEmail: Email;
    type: ContributionType;
    amount?: Money | null;
    paymentProvider?: PaymentProvider | null;
  }): Contribution {
    if (!params.guestName || params.guestName.trim() === '') {
      throw new ValidationError('Guest name is required');
    }

    // Validate amount is provided for monetary contributions
    if (params.type === ContributionType.CONTRIBUTION && !params.amount) {
      throw new ValidationError('Amount is required for contributions');
    }

    return new Contribution({
      id: UniqueId.create(),
      weddingId: params.weddingId,
      giftId: params.giftId,
      guestName: params.guestName.trim(),
      guestEmail: params.guestEmail,
      type: params.type,
      amount: params.amount ?? null,
      status: ContributionStatus.PENDING,
      paymentProvider: params.paymentProvider ?? null,
      paymentProviderId: null,
      createdAt: new Date(),
    });
  }

  /**
   * Reconstructs a Contribution from persistence.
   */
  static fromPersistence(data: {
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
    paymentProviderId: string | null;
    createdAt: string;
  }): Contribution {
    const amount =
      data.amount !== null && data.currency
        ? Money.create(data.amount, data.currency)
        : null;

    return new Contribution({
      id: UniqueId.fromString(data.id),
      weddingId: UniqueId.fromString(data.weddingId),
      giftId: UniqueId.fromString(data.giftId),
      guestName: data.guestName,
      guestEmail: Email.fromPersistence(data.guestEmail),
      type: data.type,
      amount,
      status: data.status,
      paymentProvider: data.paymentProvider,
      paymentProviderId: data.paymentProviderId,
      createdAt: new Date(data.createdAt),
    });
  }

  // Getters
  get id(): UniqueId {
    return this._id;
  }

  get weddingId(): UniqueId {
    return this._weddingId;
  }

  get giftId(): UniqueId {
    return this._giftId;
  }

  get guestName(): string {
    return this._guestName;
  }

  get guestEmail(): Email {
    return this._guestEmail;
  }

  get type(): ContributionType {
    return this._type;
  }

  get amount(): Money | null {
    return this._amount;
  }

  get status(): ContributionStatus {
    return this._status;
  }

  get paymentProvider(): PaymentProvider | null {
    return this._paymentProvider;
  }

  get paymentProviderId(): string | null {
    return this._paymentProviderId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Checks if contribution is pending payment.
   */
  isPending(): boolean {
    return this._status === ContributionStatus.PENDING;
  }

  /**
   * Checks if contribution has been paid.
   */
  isPaid(): boolean {
    return this._status === ContributionStatus.PAID;
  }

  /**
   * Marks the contribution as paid.
   * @param paymentProviderId - Optional payment ID from the provider.
   */
  markAsPaid(paymentProviderId?: string): void {
    if (this._status === ContributionStatus.PAID) {
      return; // Idempotent
    }
    this._status = ContributionStatus.PAID;
    if (paymentProviderId) {
      this._paymentProviderId = paymentProviderId;
    }
  }

  /**
   * Marks the contribution as rejected.
   */
  reject(): void {
    if (this._status === ContributionStatus.REJECTED) {
      return; // Idempotent
    }
    this._status = ContributionStatus.REJECTED;
  }

  /**
   * Sets the payment provider ID.
   */
  setPaymentProviderId(paymentProviderId: string): void {
    this._paymentProviderId = paymentProviderId;
  }

  /**
   * Converts to persistence format.
   */
  toPersistence(): {
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
    paymentProviderId: string | null;
    createdAt: string;
  } {
    return {
      id: this._id.value,
      weddingId: this._weddingId.value,
      giftId: this._giftId.value,
      guestName: this._guestName,
      guestEmail: this._guestEmail.value,
      type: this._type,
      amount: this._amount?.amount ?? null,
      currency: this._amount?.currency ?? null,
      status: this._status,
      paymentProvider: this._paymentProvider,
      paymentProviderId: this._paymentProviderId,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
