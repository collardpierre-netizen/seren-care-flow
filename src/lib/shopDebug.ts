/**
 * Debug helpers for the Shop page.
 *
 * Kept as a tiny pure module so the behaviour can be unit-tested without
 * mounting the whole Shop component.
 *
 * Two layers:
 *   1. `buildShopDebugPayload` — generic, framework-agnostic payload builder
 *      that returns `null` outside of dev mode and otherwise normalises every
 *      value to `string | null` (so the log shape is always stable and
 *      strictly PII-free as long as callers stick to the documented fields).
 *   2. `logShopDebug` — thin wrapper that prefixes the message with `[Shop]`
 *      and delegates to `console.debug`. Use this from any Shop call site so
 *      every debug line shares the exact same prefix and field format.
 *
 * Mobility-specific helpers (`buildMobilityDebugLog`, `logMobilityDebug`) are
 * provided on top to lock down the field names used for the mobility flow.
 */

const SHOP_DEBUG_PREFIX = '[Shop]';

/**
 * Anything that can safely be coerced to `string | null` without leaking
 * structured/PII data into the log.
 */
export type ShopDebugValue = string | number | boolean | null | undefined;

export type ShopDebugPayload<K extends string = string> = Record<K, string | null>;

export interface BuildShopDebugPayloadOptions<K extends string> {
  /**
   * Inject the env flag from the call site (`import.meta.env.DEV`).
   * The helper itself stays environment-agnostic so tests can flip the flag.
   */
  isDev: boolean;
  /**
   * Allow-listed fields. Values are normalised to `string | null` to keep the
   * shape stable across environments and prevent accidental object dumps.
   */
  fields: Record<K, ShopDebugValue>;
}

/**
 * Build a normalised, dev-only payload for a Shop debug log.
 *
 * - Returns `null` outside of dev mode (caller can skip the log entirely).
 * - Coerces `undefined` and `null` to `null`.
 * - Coerces primitives (`string` / `number` / `boolean`) to `string`.
 * - Never spreads arbitrary objects, so PII can only sneak in if a caller
 *   explicitly passes it as a value (which the type narrows against).
 */
export function buildShopDebugPayload<K extends string>(
  options: BuildShopDebugPayloadOptions<K>,
): ShopDebugPayload<K> | null {
  if (!options.isDev) return null;
  const out = {} as ShopDebugPayload<K>;
  for (const key of Object.keys(options.fields) as K[]) {
    const raw = options.fields[key];
    out[key] = raw === undefined || raw === null ? null : String(raw);
  }
  return out;
}

/**
 * Generic Shop debug logger. Builds the payload via `buildShopDebugPayload`
 * and forwards it to `console.debug` with the shared `[Shop]` prefix.
 *
 * No-op outside of dev mode.
 */
export function logShopDebug<K extends string>(
  message: string,
  options: BuildShopDebugPayloadOptions<K>,
): ShopDebugPayload<K> | null {
  const payload = buildShopDebugPayload(options);
  if (!payload) return null;
  // eslint-disable-next-line no-console
  console.debug(`${SHOP_DEBUG_PREFIX} ${message}`, payload);
  return payload;
}

// ---------------------------------------------------------------------------
// Mobility-specific helpers
// ---------------------------------------------------------------------------

/**
 * Locked field names for the mobility debug flow. Centralised here so every
 * call site emits the exact same keys.
 */
export const MOBILITY_DEBUG_FIELDS = [
  'profile_mobility_level',
  'applied_filter_tag',
] as const;

export type MobilityDebugField = (typeof MOBILITY_DEBUG_FIELDS)[number];

export type MobilityDebugPayload = ShopDebugPayload<MobilityDebugField>;

export interface BuildMobilityDebugLogOptions {
  isDev: boolean;
  profileMobilityLevel: ShopDebugValue;
  appliedFilterTag: ShopDebugValue;
}

/**
 * Build the mobility debug payload. Thin wrapper around
 * `buildShopDebugPayload` that pins the field names.
 */
export function buildMobilityDebugLog(
  options: BuildMobilityDebugLogOptions,
): MobilityDebugPayload | null {
  return buildShopDebugPayload({
    isDev: options.isDev,
    fields: {
      profile_mobility_level: options.profileMobilityLevel,
      applied_filter_tag: options.appliedFilterTag,
    },
  });
}

/**
 * Log the mobility debug payload via the shared Shop logger.
 * Use this from any Shop call site that needs to trace the
 * profile-mobility → filter-tag mapping.
 */
export function logMobilityDebug(
  options: BuildMobilityDebugLogOptions,
): MobilityDebugPayload | null {
  return logShopDebug('mobility filter from profile', {
    isDev: options.isDev,
    fields: {
      profile_mobility_level: options.profileMobilityLevel,
      applied_filter_tag: options.appliedFilterTag,
    },
  });
}
