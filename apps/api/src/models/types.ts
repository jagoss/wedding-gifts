
/**
 * Represents the type of bank account associated with a wedding.
 */
export enum BankAccountType {
  MERCADOPAGO = 'MERCADOPAGO',
  BANK_ACCOUNT = 'BANK_ACCOUNT'
}

/**
 * Interface representing a bank account details.
 */
export interface BankAccount {
  id: string;
  type: BankAccountType;
  label: string;
  details: Record<string, any>;
}

/**
 * Represents a wedding event managed by the system.
 */
export interface Wedding {
  id: string;
  slug: string;
  title: string;
  date?: string | null;
  location?: string | null;
  message?: string | null;
  heroImageUrl?: string | null;
  bankAccounts: BankAccount[];
  userId: string; // owner
}

/**
 * Enumeration of available gift types.
 */
export enum GiftType {
  PRODUCT = 'PRODUCT',
  EXPERIENCE = 'EXPERIENCE',
  FUND = 'FUND'
}

/**
 * Enumeration of gift statuses.
 */
export enum GiftStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  PURCHASED = 'PURCHASED',
  HIDDEN = 'HIDDEN'
}

/**
 * Represents a gift item in a wedding registry.
 */
export interface Gift {
  id: string;
  weddingId: string;
  title: string;
  description?: string | null;
  estimatedPrice?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  type: GiftType;
  status: GiftStatus;
  maxContributions?: number | null;
}

/**
 * Type of contribution made by a guest.
 */
export enum ContributionType {
  CONTRIBUTION = 'CONTRIBUTION',
  RESERVATION = 'RESERVATION'
}

/**
 * Status of a contribution.
 */
export enum ContributionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

/**
 * Supported payment providers.
 */
export enum PaymentProvider {
  MERCADOPAGO = 'MERCADOPAGO',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

/**
 * Represents a monetary contribution or reservation made by a guest for a specific gift.
 */
export interface Contribution {
  id: string;
  weddingId: string;
  giftId: string;
  guestName: string;
  guestEmail: string;
  type: ContributionType;
  amount?: number | null;
  status: ContributionStatus;
  paymentProvider?: PaymentProvider | null;
  paymentProviderId?: string | null; // e.g. MP payment ID
  createdAt: string;
}

/**
 * Represents a system user (admin/couple).
 */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Internal use
}

/**
 * Supported external product sources.
 */
export enum ProductSource {
  AMAZON = 'AMAZON',
  MERCADOLIBRE = 'MERCADOLIBRE'
}

/**
 * Metadata retrieved from external product APIs.
 */
export interface ProductMetadata {
  source: ProductSource;
  productId: string;
  title: string;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  raw: Record<string, any>;
}
