/**
 * Debug helpers for the Shop page.
 *
 * Kept as a tiny pure module so the behaviour can be unit-tested without
 * mounting the whole Shop component.
 */

export interface MobilityDebugPayload {
  profile_mobility_level: string | null;
  applied_filter_tag: string | null;
}

export interface BuildMobilityDebugLogOptions {
  /**
   * Inject the env flag from the call site (`import.meta.env.DEV`).
   * The helper itself stays environment-agnostic so tests can flip the flag.
   */
  isDev: boolean;
  profileMobilityLevel: string | null | undefined;
  appliedFilterTag: string | null | undefined;
}

/**
 * Build the safe, PII-free payload that the Shop page logs when it applies
 * the mobility filter from the user's profile.
 *
 * Returns `null` when not in dev mode so callers can skip the `console.debug`
 * call entirely.
 *
 * The payload intentionally only contains:
 *   - `profile_mobility_level` — raw value stored on the profile (DB enum)
 *   - `applied_filter_tag`    — French UI tag pushed to the shop filter state
 *
 * No other fields (name, email, address, …) are ever included.
 */
export function buildMobilityDebugLog(
  options: BuildMobilityDebugLogOptions,
): MobilityDebugPayload | null {
  if (!options.isDev) return null;
  return {
    profile_mobility_level: options.profileMobilityLevel ?? null,
    applied_filter_tag: options.appliedFilterTag ?? null,
  };
}
