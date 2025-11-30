import { UniqueId, Slug } from '../value-objects';
import { ValidationError, UnauthorizedError } from '../errors/DomainError';

/**
 * Bank account type enumeration.
 */
export enum BankAccountType {
  MERCADOPAGO = 'MERCADOPAGO',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
}

/**
 * Value object representing bank account details.
 */
export interface BankAccountDetails {
  id: string;
  type: BankAccountType;
  label: string;
  details: Record<string, unknown>;
}

/**
 * Props for creating a Wedding entity.
 */
export interface WeddingProps {
  id: UniqueId;
  userId: UniqueId;
  title: string;
  slug: Slug;
  date?: string | null;
  location?: string | null;
  message?: string | null;
  heroImageUrl?: string | null;
  bankAccounts: BankAccountDetails[];
}

/**
 * Wedding aggregate root.
 * Manages wedding event details and related bank accounts.
 */
export class Wedding {
  private readonly _id: UniqueId;
  private readonly _userId: UniqueId;
  private _title: string;
  private _slug: Slug;
  private _date: string | null;
  private _location: string | null;
  private _message: string | null;
  private _heroImageUrl: string | null;
  private _bankAccounts: BankAccountDetails[];

  private constructor(props: WeddingProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._title = props.title;
    this._slug = props.slug;
    this._date = props.date ?? null;
    this._location = props.location ?? null;
    this._message = props.message ?? null;
    this._heroImageUrl = props.heroImageUrl ?? null;
    this._bankAccounts = props.bankAccounts;
  }

  /**
   * Factory method to create a new Wedding.
   */
  static create(params: {
    userId: UniqueId;
    title: string;
    slug: Slug;
    date?: string | null;
    location?: string | null;
    message?: string | null;
    heroImageUrl?: string | null;
    bankAccounts?: BankAccountDetails[];
  }): Wedding {
    if (!params.title || params.title.trim() === '') {
      throw new ValidationError('Wedding title is required');
    }

    return new Wedding({
      id: UniqueId.create(),
      userId: params.userId,
      title: params.title.trim(),
      slug: params.slug,
      date: params.date,
      location: params.location,
      message: params.message,
      heroImageUrl: params.heroImageUrl,
      bankAccounts: params.bankAccounts ?? [],
    });
  }

  /**
   * Reconstructs a Wedding from persistence.
   */
  static fromPersistence(data: {
    id: string;
    userId: string;
    title: string;
    slug: string;
    date?: string | null;
    location?: string | null;
    message?: string | null;
    heroImageUrl?: string | null;
    bankAccounts: BankAccountDetails[];
  }): Wedding {
    return new Wedding({
      id: UniqueId.fromString(data.id),
      userId: UniqueId.fromString(data.userId),
      title: data.title,
      slug: Slug.fromPersistence(data.slug),
      date: data.date,
      location: data.location,
      message: data.message,
      heroImageUrl: data.heroImageUrl,
      bankAccounts: data.bankAccounts,
    });
  }

  // Getters
  get id(): UniqueId {
    return this._id;
  }

  get userId(): UniqueId {
    return this._userId;
  }

  get title(): string {
    return this._title;
  }

  get slug(): Slug {
    return this._slug;
  }

  get date(): string | null {
    return this._date;
  }

  get location(): string | null {
    return this._location;
  }

  get message(): string | null {
    return this._message;
  }

  get heroImageUrl(): string | null {
    return this._heroImageUrl;
  }

  get bankAccounts(): BankAccountDetails[] {
    return [...this._bankAccounts];
  }

  /**
   * Checks if a user is the owner of this wedding.
   */
  isOwnedBy(userId: UniqueId): boolean {
    return this._userId.equals(userId);
  }

  /**
   * Ensures the user is the owner, throws if not.
   */
  ensureOwnedBy(userId: UniqueId): void {
    if (!this.isOwnedBy(userId)) {
      throw new UnauthorizedError('You do not own this wedding');
    }
  }

  /**
   * Updates wedding details.
   * Only the owner can update.
   */
  update(
    userId: UniqueId,
    data: {
      title?: string;
      date?: string | null;
      location?: string | null;
      message?: string | null;
      heroImageUrl?: string | null;
      bankAccounts?: BankAccountDetails[];
    }
  ): void {
    this.ensureOwnedBy(userId);

    if (data.title !== undefined) {
      if (!data.title || data.title.trim() === '') {
        throw new ValidationError('Wedding title cannot be empty');
      }
      this._title = data.title.trim();
    }
    if (data.date !== undefined) {
      this._date = data.date;
    }
    if (data.location !== undefined) {
      this._location = data.location;
    }
    if (data.message !== undefined) {
      this._message = data.message;
    }
    if (data.heroImageUrl !== undefined) {
      this._heroImageUrl = data.heroImageUrl;
    }
    if (data.bankAccounts !== undefined) {
      this._bankAccounts = data.bankAccounts;
    }
  }

  /**
   * Converts entity to persistence format.
   */
  toPersistence(): {
    id: string;
    userId: string;
    title: string;
    slug: string;
    date: string | null;
    location: string | null;
    message: string | null;
    heroImageUrl: string | null;
    bankAccounts: BankAccountDetails[];
  } {
    return {
      id: this._id.value,
      userId: this._userId.value,
      title: this._title,
      slug: this._slug.value,
      date: this._date,
      location: this._location,
      message: this._message,
      heroImageUrl: this._heroImageUrl,
      bankAccounts: this._bankAccounts,
    };
  }
}
