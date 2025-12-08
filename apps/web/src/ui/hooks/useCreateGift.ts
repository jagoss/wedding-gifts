import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftRepository } from "@/lib/repositories";
import { CreateGiftRequest } from "@/core/domain/repositories";

export function useCreateGift(weddingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGiftRequest) => giftRepository.createGift(weddingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifts", weddingId] });
    }
  });
}

