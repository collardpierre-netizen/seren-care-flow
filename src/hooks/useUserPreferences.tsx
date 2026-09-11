import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  buying_for: string | null;
  age_range: string | null;
  gender: string | null;
  incontinence_level: string | null;
  mobility_level: string | null;
  usage_time: string | null;
  onboarding_completed: boolean | null;
  preferred_size: string | null;
}

export const useUserPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async (): Promise<UserPreferences | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('buying_for, age_range, gender, incontinence_level, mobility_level, usage_time, onboarding_completed, preferred_size')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data as UserPreferences | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper to convert profile values to filter values
export const mapProfileToFilters = (preferences: UserPreferences | null | undefined) => {
  if (!preferences) return null;

  return {
    gender: preferences.gender || undefined,
    mobility: preferences.mobility_level || undefined,
    incontinenceLevel: preferences.incontinence_level || undefined,
    usageTime: preferences.usage_time || undefined,
  };
};
