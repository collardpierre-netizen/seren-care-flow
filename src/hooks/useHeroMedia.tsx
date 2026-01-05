import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HeroMedia = {
  id: string;
  type: "image" | "video";
  file_url: string;
  alt_text: string | null;
  sort_order: number;
  display_duration: number | null;
  transition_effect: "fade" | "zoom" | "slide";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const useHeroMedia = () => {
  return useQuery({
    queryKey: ["hero-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_media")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HeroMedia[];
    },
  });
};

export const useAllHeroMedia = () => {
  return useQuery({
    queryKey: ["hero-media-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_media")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HeroMedia[];
    },
  });
};

export const useUpdateHeroMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<HeroMedia>;
    }) => {
      const { data, error } = await supabase
        .from("hero_media")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-media"] });
      queryClient.invalidateQueries({ queryKey: ["hero-media-all"] });
    },
  });
};

export const useDeleteHeroMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-media"] });
      queryClient.invalidateQueries({ queryKey: ["hero-media-all"] });
    },
  });
};

export const useCreateHeroMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      media: Omit<HeroMedia, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("hero_media")
        .insert(media)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-media"] });
      queryClient.invalidateQueries({ queryKey: ["hero-media-all"] });
    },
  });
};

export const useReorderHeroMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("hero_media")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-media"] });
      queryClient.invalidateQueries({ queryKey: ["hero-media-all"] });
    },
  });
};
