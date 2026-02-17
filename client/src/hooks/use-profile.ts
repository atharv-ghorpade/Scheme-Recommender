import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Profile, type InsertProfile } from "@shared/schema"; // Assuming schema exports types, if not adjust path
import { useToast } from "@/hooks/use-toast";

// Manual type definition if strict import fails or schemas aren't exported as types yet in your specific setup
// In a real scenario, these come from @shared/schema directly.
// We use 'api' from the generated backend code if available, but since we are generating frontend now, 
// we will rely on standard fetch patterns matching the Requirements provided in the prompt's <routes_manifest>

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.status === 401) return null;
      if (res.status === 404) return null; // No profile yet
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertProfile) => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your agricultural profile has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
