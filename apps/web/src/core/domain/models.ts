export type GiftType = "PRODUCT" | "EXPERIENCE" | "FUND";
export type GiftStatus = "AVAILABLE" | "RESERVED" | "PURCHASED" | "HIDDEN";
export type ContributionType = "CONTRIBUTION" | "RESERVATION";
export type ContributionStatus = "PENDING" | "PAID" | "REJECTED";
export type PaymentMethod = "MERCADOPAGO" | "BANK_TRANSFER";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Wedding {
  id: string;
  userId?: string;
  title: string;
  slug: string;
  date: string | null;
  location: string | null;
  message: string | null;
  heroImageUrl: string | null;
  bankAccounts?: BankAccount[];
}

export interface BankAccount {
  id: string;
  type: "MERCADOPAGO" | "BANK_ACCOUNT";
  label: string;
  details: Record<string, unknown>;
}

export interface Gift {
  id: string;
  weddingId: string;
  title: string;
  description: string | null;
  estimatedPrice: number | null;
  currency: string | null;
  imageUrl: string | null;
  productUrl: string | null;
  type: GiftType;
  status: GiftStatus;
  maxContributions: number | null;
}

export interface Contribution {
  id: string;
  weddingId: string;
  giftId: string;
  guestName: string;
  guestEmail: string;
  type: ContributionType;
  amount: number | null;
  currency: string | null;
  status: ContributionStatus;
  paymentProvider: PaymentMethod | null;
  createdAt: string;
}

export interface PublicWedding {
  wedding: Pick<Wedding, "id" | "title" | "slug" | "date" | "location" | "message" | "heroImageUrl">;
  gifts: Array<
    Pick<
      Gift,
      | "id"
      | "title"
      | "description"
      | "estimatedPrice"
      | "currency"
      | "imageUrl"
      | "productUrl"
      | "type"
      | "status"
    >
  >;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}

