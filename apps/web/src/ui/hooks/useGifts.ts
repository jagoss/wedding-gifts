import { useQuery } from "@tanstack/react-query";
import { giftRepository } from "@/lib/repositories";

export function useGifts(weddingId: string | undefined) {
  return useQuery({
    queryKey: ["gifts", weddingId],
    queryFn: () => giftRepository.getWeddingGifts(weddingId as string),
    enabled: Boolean(weddingId)
  });
}

