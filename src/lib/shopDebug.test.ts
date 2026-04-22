import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildShopDebugPayload,
  logShopDebug,
  buildMobilityDebugLog,
  logMobilityDebug,
  MOBILITY_DEBUG_FIELDS,
  IS_SHOP_DEBUG_ENABLED,
} from './shopDebug';

describe('buildShopDebugPayload (generic)', () => {
  it('returns null when not in DEV mode', () => {
    expect(
      buildShopDebugPayload({ isDev: false, fields: { foo: 'bar' } }),
    ).toBeNull();
  });

  it('coerces undefined / null to null and primitives to string', () => {
    const payload = buildShopDebugPayload({
      isDev: true,
      fields: { a: undefined, b: null, c: 'hello', d: 42, e: true },
    });
    expect(payload).toEqual({
      a: null,
      b: null,
      c: 'hello',
      d: '42',
      e: 'true',
    });
  });

  it('preserves only the declared fields', () => {
    const payload = buildShopDebugPayload({
      isDev: true,
      fields: { only_me: 'ok' },
    });
    expect(Object.keys(payload!)).toEqual(['only_me']);
  });
});

describe('logShopDebug', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it('does not call console.debug when not in DEV', () => {
    const result = logShopDebug('whatever', {
      isDev: false,
      fields: { foo: 'bar' },
    });
    expect(result).toBeNull();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('logs with the shared [Shop] prefix and the normalised payload', () => {
    logShopDebug('mobility filter from profile', {
      isDev: true,
      fields: {
        profile_mobility_level: 'reduced',
        applied_filter_tag: 'reduite',
      },
    });
    expect(debugSpy).toHaveBeenCalledWith(
      '[Shop] mobility filter from profile',
      { profile_mobility_level: 'reduced', applied_filter_tag: 'reduite' },
    );
  });
});

describe('buildMobilityDebugLog', () => {
  it('returns null when not in DEV', () => {
    expect(
      buildMobilityDebugLog({
        isDev: false,
        profileMobilityLevel: 'reduced',
        appliedFilterTag: 'reduite',
      }),
    ).toBeNull();
  });

  it('uses exactly the locked field names', () => {
    const payload = buildMobilityDebugLog({
      isDev: true,
      profileMobilityLevel: 'reduced',
      appliedFilterTag: 'reduite',
    });
    expect(Object.keys(payload!).sort()).toEqual(
      [...MOBILITY_DEBUG_FIELDS].sort(),
    );
    expect(payload).toEqual({
      profile_mobility_level: 'reduced',
      applied_filter_tag: 'reduite',
    });
  });
});

describe('logMobilityDebug (lazy provider)', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('does NOT invoke the field provider when debug is disabled (prod)', () => {
    // Tests run with vitest's default DEV=true, so we stub the env to false
    // AND verify the helper short-circuits via the cached IS_SHOP_DEBUG_ENABLED
    // by importing a fresh copy of the module.
    vi.resetModules();
    vi.stubEnv('DEV', false);
    return import('./shopDebug').then(({ logMobilityDebug: prodLogger }) => {
      const provider = vi.fn(() => ({
        profileMobilityLevel: 'reduced',
        appliedFilterTag: 'reduite',
      }));
      const result = prodLogger(provider);
      expect(result).toBeNull();
      expect(provider).not.toHaveBeenCalled();
      expect(debugSpy).not.toHaveBeenCalled();
    });
  });

  it('invokes the provider exactly once and logs in DEV', () => {
    const provider = vi.fn(() => ({
      profileMobilityLevel: 'reduced',
      appliedFilterTag: 'reduite',
    }));
    logMobilityDebug(provider);
    expect(provider).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [message, payload] = debugSpy.mock.calls[0];
    expect(message).toBe('[Shop] mobility filter from profile');
    expect(payload).toEqual({
      profile_mobility_level: 'reduced',
      applied_filter_tag: 'reduite',
    });
  });

  it('IS_SHOP_DEBUG_ENABLED reflects the current env at import time', () => {
    // Vitest runs in DEV mode.
    expect(IS_SHOP_DEBUG_ENABLED).toBe(true);
  });
});
