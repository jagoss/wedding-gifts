import { useQuery } from "@tanstack/react-query";
import { weddingRepository } from "@/lib/repositories";

export function usePublicWedding(slug: string) {
  return useQuery({
    queryKey: ["public-wedding", slug],
    queryFn: () => weddingRepository.getPublicWeddingBySlug(slug),
    enabled: Boolean(slug)
  });
}

