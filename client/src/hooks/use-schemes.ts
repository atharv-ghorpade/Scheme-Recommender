import { useQuery, useMutation } from "@tanstack/react-query";
import type { Scheme, Recommendation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSchemes() {
  return useQuery<Scheme[]>({
    queryKey: ["/api/schemes"],
    queryFn: async () => {
      const res = await fetch("/api/schemes", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch schemes");
      return res.json();
    },
  });
}

export interface RecommendationResponse {
  scheme: Scheme;
  explanation: string;
}

export function useGenerateRecommendations() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/recommendations/generate", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("Please complete your profile first.");
        }
        throw new Error("Failed to generate recommendations");
      }
      return res.json() as Promise<RecommendationResponse[]>;
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
