import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildShopDebugPayload,
  logShopDebug,
  buildMobilityDebugLog,
  logMobilityDebug,
  MOBILITY_DEBUG_FIELDS,
} from './shopDebug';

describe('buildShopDebugPayload (generic)', () => {
  it('returns null when not in DEV mode', () => {
    expect(
      buildShopDebugPayload({
        isDev: false,
        fields: { foo: 'bar' },
      }),
    ).toBeNull();
  });

  it('coerces undefined / null to null and primitives to string', () => {
    const payload = buildShopDebugPayload({
      isDev: true,
      fields: {
        a: undefined,
        b: null,
        c: 'hello',
        d: 42,
        e: true,
      },
    });
    expect(payload).toEqual({
      a: null,
      b: null,
      c: 'hello',
      d: '42',
      e: 'true',
    });
  });

  it('preserves only the declared fields (no spread of arbitrary objects)', () => {
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

  it('calls console.debug with the shared [Shop] prefix and the normalised payload', () => {
    const result = logShopDebug('mobility filter from profile', {
      isDev: true,
      fields: {
        profile_mobility_level: 'reduced',
        applied_filter_tag: 'reduite',
      },
    });

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      '[Shop] mobility filter from profile',
      { profile_mobility_level: 'reduced', applied_filter_tag: 'reduite' },
    );
    expect(result).toEqual({
      profile_mobility_level: 'reduced',
      applied_filter_tag: 'reduite',
    });
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

  it('coerces undefined to null on both fields', () => {
    expect(
      buildMobilityDebugLog({
        isDev: true,
        profileMobilityLevel: undefined,
        appliedFilterTag: undefined,
      }),
    ).toEqual({
      profile_mobility_level: null,
      applied_filter_tag: null,
    });
  });
});

describe('logMobilityDebug', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it('is a no-op outside DEV', () => {
    const result = logMobilityDebug({
      isDev: false,
      profileMobilityLevel: 'reduced',
      appliedFilterTag: 'reduite',
    });
    expect(result).toBeNull();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('logs with the shared [Shop] prefix and locked field names', () => {
    logMobilityDebug({
      isDev: true,
      profileMobilityLevel: 'reduced',
      appliedFilterTag: 'reduite',
    });

    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [message, payload] = debugSpy.mock.calls[0];
    expect(message).toBe('[Shop] mobility filter from profile');
    expect(Object.keys(payload as object).sort()).toEqual(
      [...MOBILITY_DEBUG_FIELDS].sort(),
    );
    expect(payload).toEqual({
      profile_mobility_level: 'reduced',
      applied_filter_tag: 'reduite',
    });
  });
});
