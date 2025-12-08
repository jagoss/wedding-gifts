import { PublicWedding, Wedding } from "@/core/domain/models";
import {
  CreateWeddingRequest,
  UpdateWeddingRequest,
  WeddingRepository
} from "@/core/domain/repositories";
import { HttpClient } from "./httpClient";

export class WeddingHttpRepository implements WeddingRepository {
  constructor(private readonly http: HttpClient) {}

  getMyWeddings(): Promise<Wedding[]> {
    return this.http.get<Wedding[]>("/weddings/me");
  }

  getPublicWeddingBySlug(slug: string): Promise<PublicWedding> {
    return this.http.get<PublicWedding>(`/public/weddings/${slug}`);
  }

  getWeddingById(id: string): Promise<Wedding> {
    return this.http.get<Wedding>(`/weddings/${id}`);
  }

  createWedding(input: CreateWeddingRequest): Promise<Wedding> {
    return this.http.post<Wedding>("/weddings", input);
  }

  updateWedding(id: string, input: UpdateWeddingRequest): Promise<Wedding> {
    return this.http.patch<Wedding>(`/weddings/${id}`, input);
  }
}

