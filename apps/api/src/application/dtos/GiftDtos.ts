import { GiftType, GiftStatus } from '../../domain/entities/Gift';

/**
 * Full gift output DTO.
 */
export interface GiftOutput {
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
