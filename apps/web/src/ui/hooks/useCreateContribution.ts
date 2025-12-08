import { useMutation } from "@tanstack/react-query";
import { contributionRepository } from "@/lib/repositories";
import { PublicContributionRequest } from "@/core/domain/repositories";

export function useCreateContribution(slug: string) {
  return useMutation({
    mutationFn: (payload: PublicContributionRequest) => contributionRepository.createPublicContribution(slug, payload)
  });
}

