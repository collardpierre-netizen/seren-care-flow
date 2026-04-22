/**
 * Client-side validation for the profile-mobility → shop-filter-tag pipeline.
 *
 * The pipeline is:
 *   `profiles.mobility_level` (raw DB string, expected to be a `MobilityEnum`)
 *     → `validateUserPreferences`  (drops unknown values, returns canonical enum)
 *     → `mapProfileToFilters`      (translates enum → French UI `MobilityTag`)
 *     → shop filter state          (`MobilityFilterId`)
 *
 * Each step is individually safe, but a regression in any of them (or a future
 * schema change) could cause the final tag to silently disappear, leaving the
 * user staring at an empty product list. This module compares the input and
 * output of the pipeline and produces a structured warning so the UI can
 * surface a clear, actionable message.
 */

import {
  isMobilityEnum,
  isMobilityTag,
  toMobilityEnum,
  type MobilityTag,
} from '@/hooks/useProductFilters';

export type MobilityConversionStatus =
  /** Profile had no value (legitimate) — nothing to validate. */
  | 'empty'
  /** Profile value is a recognised enum AND was translated to a tag. */
  | 'ok'
  /** Profile value was a French tag (legacy data) auto-corrected to an enum. */
  | 'auto_corrected'
  /** Profile value is unknown garbage — sanitiser dropped it. */
  | 'invalid_profile_value'
  /**
   * Profile value is a valid enum but the mapper returned no tag.
   * Should never happen — indicates a code bug between
   * `validateUserPreferences` and `mapProfileToFilters`.
   */
  | 'mapping_failed'
  /**
   * Caller passed a non-null filter value that is NOT a recognised
   * `MobilityTag` — typically a UI sentinel ("all") or a stale/legacy
   * value. Treated as a *safe, silent* state: the filter is simply not
   * actively pointing to a mobility tag, and the user should not be
   * pestered with a warning. Surfacing this as a distinct status (rather
   * than collapsing it into `mapping_failed`) prevents false positives
   * when the user voluntarily clears the filter.
   */
  | 'unknown_filter_tag';

export interface MobilityConversionResult {
  status: MobilityConversionStatus;
  /** Original raw value as stored on the profile. */
  rawProfileValue: string | null;
  /** Tag actually pushed to the shop filter state, if any. */
  resolvedFilterTag: MobilityTag | null;
  /**
   * Human-readable message suitable for a non-blocking UI notice.
   * `null` when the status does not warrant a warning
   * (`ok` / `empty` / `auto_corrected` / `unknown_filter_tag`).
   */
  warningMessage: string | null;
}

/**
 * Compare the raw profile mobility value with the tag that ended up in the
 * shop filter state, and classify the outcome.
 *
 * This is a pure function — safe to call from a `useMemo` in any component.
 */
export function validateMobilityConversion(
  rawProfileValue: string | null | undefined,
  resolvedFilterTag: MobilityTag | string | null | undefined,
): MobilityConversionResult {
  const raw = rawProfileValue ?? null;
  const tag =
    resolvedFilterTag && isMobilityTag(resolvedFilterTag)
      ? (resolvedFilterTag as MobilityTag)
      : null;

  if (!raw) {
    return {
      status: 'empty',
      rawProfileValue: null,
      resolvedFilterTag: tag,
      warningMessage: null,
    };
  }

  // Did the sanitiser keep the value? (i.e. could we normalise it to an enum?)
  const canonical = toMobilityEnum(raw);

  if (canonical === null) {
    return {
      status: 'invalid_profile_value',
      rawProfileValue: raw,
      resolvedFilterTag: tag,
      warningMessage:
        `Votre niveau de mobilité enregistré ("${raw}") n'est pas reconnu. ` +
        `Le filtre n'a pas pu être appliqué automatiquement — mettez-le à ` +
        `jour depuis votre profil pour des recommandations personnalisées.`,
    };
  }

  // Enum is valid but no tag was produced → mapping bug.
  if (!tag) {
    return {
      status: 'mapping_failed',
      rawProfileValue: raw,
      resolvedFilterTag: null,
      warningMessage:
        `Une incohérence interne a empêché l'application du filtre mobilité ` +
        `("${raw}" → ?). Réessayez plus tard ou réinitialisez le filtre.`,
    };
  }

  // If the raw value was a French tag rather than the canonical enum, flag
  // it as auto-corrected — useful for QA but not a user-facing warning.
  if (!isMobilityEnum(raw)) {
    return {
      status: 'auto_corrected',
      rawProfileValue: raw,
      resolvedFilterTag: tag,
      warningMessage: null,
    };
  }

  return {
    status: 'ok',
    rawProfileValue: raw,
    resolvedFilterTag: tag,
    warningMessage: null,
  };
}

/** Convenience: `true` for statuses that should surface a UI notice. */
export const shouldWarnUser = (status: MobilityConversionStatus): boolean =>
  status === 'invalid_profile_value' || status === 'mapping_failed';
