// Hook for managing user's preferred size
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePreferredSize() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's preferred size from profile
  const { data: preferredSize, isLoading } = useQuery({
    queryKey: ["preferred-size", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_size")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data?.preferred_size as string | null;
    },
    enabled: !!user?.id,
  });

  // Update preferred size mutation
  const updatePreferredSizeMutation = useMutation({
    mutationFn: async (size: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update({ preferred_size: size })
        .eq("id", user.id);
      
      if (error) throw error;
      return size;
    },
    onSuccess: (size) => {
      queryClient.invalidateQueries({ queryKey: ["preferred-size", user?.id] });
      toast.success(`Taille préférée sauvegardée : ${size}`);
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde de la taille");
    },
  });

  const savePreferredSize = (size: string) => {
    if (!user) {
      // Store in localStorage for non-authenticated users
      localStorage.setItem("serencare_preferred_size", size);
      toast.success(`Taille préférée sauvegardée : ${size}`);
      return;
    }
    updatePreferredSizeMutation.mutate(size);
  };

  // Get size from localStorage for non-authenticated users
  const getLocalPreferredSize = () => {
    return localStorage.getItem("serencare_preferred_size");
  };

  const currentPreferredSize = user ? preferredSize : getLocalPreferredSize();

  return {
    preferredSize: currentPreferredSize,
    isLoading,
    savePreferredSize,
    isSaving: updatePreferredSizeMutation.isPending,
  };
}
