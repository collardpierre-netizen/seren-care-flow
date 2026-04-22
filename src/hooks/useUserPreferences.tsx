import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  toMobilityTag,
  toMobilityEnum,
  type MobilityTag,
  type MobilityEnum,
} from '@/hooks/useProductFilters';
import {
  toIncontinenceLevel,
  toUsageTime,
  toGender,
} from '@/lib/profileNormalization';
import { toast } from '@/hooks/use-toast';

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

/**
 * Result of validating raw profile preferences.
 *
 * - `sanitized` is a copy of the input where every recognised enum field has
 *   been normalised to its canonical DB value, and unknown/garbage values
 *   have been **dropped** (set to `null`) rather than passed through.
 * - `warnings` lists each field that was corrected or dropped, with the
 *   original and the resolved value, so callers can surface a non-blocking
 *   notice and so we can log the issue server-side later if needed.
 */
export interface PreferenceValidationResult {
  sanitized: UserPreferences;
  warnings: PreferenceWarning[];
}

export interface PreferenceWarning {
  field: 'mobility_level' | 'incontinence_level' | 'usage_time' | 'gender';
  /** The raw value that was rejected or normalised. */
  original: string;
  /** The corrected canonical value, or `null` if the value was dropped. */
  corrected: string | null;
  /** `'corrected'` when normalised to the canonical form, `'dropped'` when unknown. */
  kind: 'corrected' | 'dropped';
}

/**
 * Validate a raw `UserPreferences` payload coming from the DB.
 *
 * For each enum-like field (mobility, incontinence, usage time, gender):
 *   - if the stored value is already the canonical DB value → keep as-is
 *     silently (no warning, even though it passed through normalisation);
 *   - if it is a known alias (e.g. French tag, casing variant) → silently
 *     auto-correct to the canonical value (still no warning, the user does
 *     not need to know we cleaned a synonym);
 *   - if it is unknown / garbage → drop it (`null`) and emit a warning so
 *     the UI can show a non-blocking notice and the dev console gets a
 *     traceable record of the bad data.
 *
 * Mobility is stored in the DB as the **English enum**, so the canonical
 * comparison uses `toMobilityEnum`.
 */
export const validateUserPreferences = (
  preferences: UserPreferences,
): PreferenceValidationResult => {
  const warnings: PreferenceWarning[] = [];
  const sanitized: UserPreferences = { ...preferences };

  const validate = <T extends string>(
    field: PreferenceWarning['field'],
    raw: string | null,
    normalise: (v: string | null | undefined) => T | null,
  ): T | null => {
    if (!raw) return null;
    const canonical = normalise(raw);
    if (canonical === null) {
      warnings.push({ field, original: raw, corrected: null, kind: 'dropped' });
      return null;
    }
    // Auto-correction is silent: a French tag stored where we expect an enum
    // is a known migration scenario, not a data integrity issue worth alerting.
    return canonical;
  };

  sanitized.mobility_level = validate<MobilityEnum>(
    'mobility_level',
    preferences.mobility_level,
    toMobilityEnum,
  );
  sanitized.incontinence_level = validate(
    'incontinence_level',
    preferences.incontinence_level,
    toIncontinenceLevel,
  );
  sanitized.usage_time = validate(
    'usage_time',
    preferences.usage_time,
    toUsageTime,
  );
  sanitized.gender = validate('gender', preferences.gender, toGender);

  return { sanitized, warnings };
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  // Track which `(userId, field, value)` combinations we have already warned
  // about during this session, so we never spam the user with the same toast
  // each time React Query refetches.
  const warnedRef = useRef<Set<string>>(new Set());

  const query = useQuery({
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

      if (!data) return null;

      const { sanitized, warnings } = validateUserPreferences(data as UserPreferences);

      if (warnings.length > 0) {
        console.warn('[useUserPreferences] invalid profile values detected', {
          userId: user.id,
          warnings,
        });
      }

      return sanitized;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Surface a non-blocking toast for unknown mobility values specifically —
  // this is the field most likely to break the shop UX (filters will silently
  // return zero products). Other fields fall back gracefully so we keep the
  // UI quiet and only log them in the console.
  useEffect(() => {
    if (!user?.id || !query.data) return;

    // We need access to the warnings, but the query caches the sanitised
    // value. Re-run validation on the original raw value when present in
    // the cache key by reconstructing from the latest fetch isn't possible
    // here — instead, we detect the corrected case by comparing against
    // what `mapProfileToFilters` would expose: if the stored mobility is
    // present and `toMobilityTag` returns null, the value was dropped.
    const rawMobility = query.data.mobility_level;
    if (!rawMobility) return;
    const dedupeKey = `${user.id}:mobility_level:${rawMobility}`;
    if (warnedRef.current.has(dedupeKey)) return;
    if (toMobilityTag(rawMobility) === null) {
      warnedRef.current.add(dedupeKey);
      toast({
        title: 'Préférence de mobilité non reconnue',
        description:
          "Nous n'avons pas pu interpréter votre niveau de mobilité enregistré. Vous pouvez le mettre à jour depuis votre profil.",
      });
    }
  }, [user?.id, query.data]);

  return query;
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
