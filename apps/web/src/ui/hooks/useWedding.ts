import { useQuery } from "@tanstack/react-query";
import { weddingRepository } from "@/lib/repositories";

export function useWedding(id: string | undefined) {
  return useQuery({
    queryKey: ["wedding", id],
    queryFn: () => weddingRepository.getWeddingById(id as string),
    enabled: Boolean(id)
  });
}

