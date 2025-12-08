import { AuthHttpRepository } from "@/core/infrastructure/http/authRepository";
import { ContributionHttpRepository } from "@/core/infrastructure/http/contributionRepository";
import { GiftHttpRepository } from "@/core/infrastructure/http/giftRepository";
import { WeddingHttpRepository } from "@/core/infrastructure/http/weddingRepository";
import { httpClient } from "./httpClient";

export const authRepository = new AuthHttpRepository(httpClient);
export const weddingRepository = new WeddingHttpRepository(httpClient);
export const giftRepository = new GiftHttpRepository(httpClient);
export const contributionRepository = new ContributionHttpRepository(httpClient);

