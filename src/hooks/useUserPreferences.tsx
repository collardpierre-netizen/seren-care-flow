import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toMobilityTag, type MobilityTag } from '@/hooks/useProductFilters';

export interface UserPreferences {
  buying_for: string | null;
  age_range: string | null;
  gender: string | null;
  incontinence_level: string | null;
  /**
   * Stored as the English DB enum (`mobile`/`reduced`/`bedridden`).
   * Use `toMobilityTag()` to convert to the French UI tag before
   * feeding shop filters.
   */
  mobility_level: string | null;
  usage_time: string | null;
  onboarding_completed: boolean | null;
  preferred_size: string | null;
}

/**
 * Shape produced by `mapProfileToFilters`. The mobility field is typed as
 * `MobilityTag` (French UI value) so consumers cannot accidentally feed an
 * English enum into the shop filter state.
 */
export interface ProfileDerivedFilters {
  gender: string | undefined;
  mobility: MobilityTag | undefined;
  incontinenceLevel: string | undefined;
  usageTime: string | undefined;
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

/**
 * Convert a profile to the shape expected by the shop filter state.
 * The mobility value is normalised to a `MobilityTag` (French UI tag);
 * if the profile holds an unknown value, mobility is left `undefined`
 * rather than leaking a non-tag string into the UI.
 */
export const mapProfileToFilters = (
  preferences: UserPreferences | null | undefined,
): ProfileDerivedFilters | null => {
  if (!preferences) return null;

  const mobility = toMobilityTag(preferences.mobility_level) ?? undefined;

  return {
    gender: preferences.gender || undefined,
    mobility,
    incontinenceLevel: preferences.incontinence_level || undefined,
    usageTime: preferences.usage_time || undefined,
  };
};
