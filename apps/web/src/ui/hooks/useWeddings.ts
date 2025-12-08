import { useQuery } from "@tanstack/react-query";
import { weddingRepository } from "@/lib/repositories";

export function useWeddings(enabled: boolean) {
  return useQuery({
    queryKey: ["weddings"],
    queryFn: () => weddingRepository.getMyWeddings(),
    enabled
  });
}

