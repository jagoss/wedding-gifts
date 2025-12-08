import { Gift } from "@/core/domain/models";
import {
  CreateGiftRequest,
  GiftRepository,
  UpdateGiftRequest
} from "@/core/domain/repositories";
import { HttpClient } from "./httpClient";

export class GiftHttpRepository implements GiftRepository {
  constructor(private readonly http: HttpClient) {}

  getWeddingGifts(weddingId: string): Promise<Gift[]> {
    return this.http.get<Gift[]>(`/weddings/${weddingId}/gifts`);
  }

  getGift(weddingId: string, giftId: string): Promise<Gift> {
    return this.http.get<Gift>(`/weddings/${weddingId}/gifts/${giftId}`);
  }

  createGift(weddingId: string, input: CreateGiftRequest): Promise<Gift> {
    return this.http.post<Gift>(`/weddings/${weddingId}/gifts`, input);
  }

  updateGift(weddingId: string, giftId: string, input: UpdateGiftRequest): Promise<Gift> {
    return this.http.patch<Gift>(`/weddings/${weddingId}/gifts/${giftId}`, input);
  }

  deleteGift(weddingId: string, giftId: string): Promise<void> {
    return this.http.delete<void>(`/weddings/${weddingId}/gifts/${giftId}`);
  }
}

