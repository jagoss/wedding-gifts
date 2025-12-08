import {
  AuthTokens,
  Contribution,
  ContributionStatus,
  ContributionType,
  Gift,
  GiftStatus,
  GiftType,
  PublicWedding,
  Wedding
} from "./models";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateWeddingRequest {
  title: string;
  slug: string;
  date?: string | null;
  location?: string | null;
  message?: string | null;
  heroImageUrl?: string | null;
}

export interface UpdateWeddingRequest extends Partial<CreateWeddingRequest> {}

export interface CreateGiftRequest {
  title: string;
  description?: string | null;
  estimatedPrice?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  type: GiftType;
  maxContributions?: number | null;
}

export interface UpdateGiftRequest extends Partial<CreateGiftRequest> {
  status?: GiftStatus;
}

export interface PublicContributionRequest {
  giftId: string;
  guestName: string;
  guestEmail: string;
  type: ContributionType;
  amount?: number | null;
  paymentMethod: "MERCADOPAGO" | "BANK_TRANSFER";
}

export interface AuthRepository {
  login(input: LoginRequest): Promise<AuthTokens>;
  register(input: RegisterRequest): Promise<AuthTokens>;
}

export interface WeddingRepository {
  getMyWeddings(): Promise<Wedding[]>;
  getPublicWeddingBySlug(slug: string): Promise<PublicWedding>;
  getWeddingById(id: string): Promise<Wedding>;
  createWedding(input: CreateWeddingRequest): Promise<Wedding>;
  updateWedding(id: string, input: UpdateWeddingRequest): Promise<Wedding>;
}

export interface GiftRepository {
  getWeddingGifts(weddingId: string): Promise<Gift[]>;
  getGift(weddingId: string, giftId: string): Promise<Gift>;
  createGift(weddingId: string, input: CreateGiftRequest): Promise<Gift>;
  updateGift(weddingId: string, giftId: string, input: UpdateGiftRequest): Promise<Gift>;
  deleteGift(weddingId: string, giftId: string): Promise<void>;
}

export interface ContributionRepository {
  getWeddingContributions(
    weddingId: string,
    filters?: { status?: ContributionStatus; giftId?: string }
  ): Promise<Contribution[]>;
  createPublicContribution(slug: string, input: PublicContributionRequest): Promise<{
    contributionId: string;
    status: ContributionStatus;
    payment:
      | {
          provider: "MERCADOPAGO";
          preferenceId: string;
          checkoutUrl: string;
        }
      | null;
    bankInstructions?: Record<string, unknown> | null;
  }>;
}

