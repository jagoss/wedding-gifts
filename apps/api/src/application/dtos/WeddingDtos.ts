import { BankAccountDetails } from '../../domain/entities/Wedding';
import { GiftType, GiftStatus } from '../../domain/entities/Gift';

/**
 * Full wedding output DTO.
 */
export interface WeddingOutput {
  id: string;
  userId: string;
  title: string;
  slug: string;
  date: string | null;
  location: string | null;
  message: string | null;
  heroImageUrl: string | null;
  bankAccounts: BankAccountDetails[];
}

/**
 * Wedding list item output DTO.
 */
export interface WeddingListOutput {
  id: string;
  title: string;
  slug: string;
  date: string | null;
  location: string | null;
}

/**
 * Public wedding output DTO (includes gifts).
 */
export interface PublicWeddingOutput {
  wedding: {
    id: string;
    title: string;
    slug: string;
    date: string | null;
    location: string | null;
    message: string | null;
    heroImageUrl: string | null;
  };
  gifts: Array<{
    id: string;
    title: string;
    description: string | null;
    estimatedPrice: number | null;
    currency: string | null;
    imageUrl: string | null;
    productUrl: string | null;
    type: GiftType;
    status: GiftStatus;
  }>;
}
