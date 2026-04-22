/**
 * Bidirectional normalization helpers for profile/product attributes that are
 * compared across the codebase (incontinence level, usage time, gender).
 *
 * Goal: prevent the same class of bug as the historical FR-tag vs EN-enum
 * mobility mismatch by:
 *   1. Defining a single source of truth for the canonical DB enum values.
 *   2. Accepting tolerant inputs (case-insensitive, trimmed, common FR aliases).
 *   3. Providing semantic matchers so call-sites use one well-named function
 *      instead of ad-hoc `===` comparisons that miss edge cases (e.g. `unisex`
 *      should match every gender, `day_night` should match both `day` & `night`).
 *
 * Mobility lives in `useProductFilters.tsx` for historical reasons — see
 * `toMobilityEnum` / `toMobilityTag` there.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Incontinence level
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical DB enum (`incontinence_level` column). */
export type IncontinenceLevel = 'light' | 'moderate' | 'heavy' | 'very_heavy';

const INCONTINENCE_ALIASES: Record<string, IncontinenceLevel> = {
  light: 'light',
  legere: 'light',
  'légère': 'light',
  leger: 'light',
  'léger': 'light',
  moderate: 'moderate',
  moderee: 'moderate',
  'modérée': 'moderate',
  modere: 'moderate',
  'modéré': 'moderate',
  heavy: 'heavy',
  forte: 'heavy',
  fort: 'heavy',
  importante: 'heavy',
  very_heavy: 'very_heavy',
  'very-heavy': 'very_heavy',
  'tres-forte': 'very_heavy',
  tres_forte: 'very_heavy',
  'très_forte': 'very_heavy',
  complete: 'very_heavy',
  'complète': 'very_heavy',
};

/**
 * Normalise an incontinence value (any casing / FR alias) to the DB enum.
 * Returns `null` for unknown inputs — never silently coerces.
 */
export const toIncontinenceLevel = (
  value: string | null | undefined,
): IncontinenceLevel | null => {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return INCONTINENCE_ALIASES[key] ?? null;
};

/**
 * True when a product's incontinence level matches the requested level.
 * Both sides are normalised; `null` on either side means "no constraint" → match.
 */
export const matchesIncontinenceLevel = (
  productLevel: string | null | undefined,
  requestedLevel: string | null | undefined,
): boolean => {
  const req = toIncontinenceLevel(requestedLevel);
  if (!req) return true;
  const prod = toIncontinenceLevel(productLevel);
  if (!prod) return true; // product has no constraint → assume compatible
  return prod === req;
};

// ─────────────────────────────────────────────────────────────────────────────
// Usage time
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical DB enum for the legacy single-value `usage_time` column. */
export type UsageTime = 'day' | 'night' | 'day_night';

const USAGE_TIME_ALIASES: Record<string, UsageTime> = {
  day: 'day',
  jour: 'day',
  journee: 'day',
  'journée': 'day',
  night: 'night',
  nuit: 'night',
  day_night: 'day_night',
  'day-night': 'day_night',
  jour_nuit: 'day_night',
  'jour-nuit': 'day_night',
  both: 'day_night',
  'jour et nuit': 'day_night',
};

/**
 * Normalise a usage-time value (any casing / FR alias) to the DB enum.
 * Returns `null` for unknown inputs.
 */
export const toUsageTime = (
  value: string | null | undefined,
): UsageTime | null => {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return USAGE_TIME_ALIASES[key] ?? null;
};

/**
 * True when a product's usage time satisfies the requested usage time.
 * `day_night` on either side matches both `day` and `night`.
 * `null` on either side means "no constraint" → match.
 */
export const matchesUsageTime = (
  productTime: string | null | undefined,
  requestedTime: string | null | undefined,
): boolean => {
  const req = toUsageTime(requestedTime);
  if (!req) return true;
  const prod = toUsageTime(productTime);
  if (!prod) return true;
  if (prod === 'day_night' || req === 'day_night') return true;
  return prod === req;
};

// ─────────────────────────────────────────────────────────────────────────────
// Gender
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical gender values used on `products.gender` and `profiles.gender`. */
export type Gender = 'male' | 'female' | 'unisex';

const GENDER_ALIASES: Record<string, Gender> = {
  male: 'male',
  homme: 'male',
  m: 'male',
  female: 'female',
  femme: 'female',
  f: 'female',
  unisex: 'unisex',
  unisexe: 'unisex',
  any: 'unisex',
  'peu importe': 'unisex',
};

/**
 * Normalise a gender value to the canonical form.
 * `null`/unknown → `null`. `any` is treated as `unisex` (no constraint).
 */
export const toGender = (
  value: string | null | undefined,
): Gender | null => {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return GENDER_ALIASES[key] ?? null;
};

/**
 * True when a product's gender matches the requested gender.
 * `unisex` on either side acts as a wildcard (matches anything).
 * `null`/unknown gender on the product side defaults to `unisex` (legacy data).
 */
export const matchesGender = (
  productGender: string | null | undefined,
  requestedGender: string | null | undefined,
): boolean => {
  const req = toGender(requestedGender);
  if (!req || req === 'unisex') return true;
  const prod = toGender(productGender) ?? 'unisex';
  if (prod === 'unisex') return true;
  return prod === req;
};
