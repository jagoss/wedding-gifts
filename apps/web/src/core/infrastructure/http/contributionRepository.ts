import { Contribution, ContributionStatus } from "@/core/domain/models";
import {
  ContributionRepository,
  PublicContributionRequest
} from "@/core/domain/repositories";
import { HttpClient } from "./httpClient";

export class ContributionHttpRepository implements ContributionRepository {
  constructor(private readonly http: HttpClient) {}

  getWeddingContributions(
    weddingId: string,
    filters?: { status?: ContributionStatus; giftId?: string }
  ): Promise<Contribution[]> {
    const searchParams = new URLSearchParams();
    if (filters?.status) searchParams.set("status", filters.status);
    if (filters?.giftId) searchParams.set("giftId", filters.giftId);
    const query = searchParams.toString();
    const suffix = query ? `?${query}` : "";
    return this.http.get<Contribution[]>(`/weddings/${weddingId}/contributions${suffix}`);
  }

  createPublicContribution(slug: string, input: PublicContributionRequest) {
    return this.http.post<{
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
    }>(`/public/weddings/${slug}/contributions`, input);
  }
}

