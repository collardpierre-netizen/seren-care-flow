import { describe, it, expect } from 'vitest';
import { buildMobilityDebugLog } from './shopDebug';

describe('buildMobilityDebugLog', () => {
  it('returns null when not in DEV mode (no log emitted in production)', () => {
    const payload = buildMobilityDebugLog({
      isDev: false,
      profileMobilityLevel: 'reduced',
      appliedFilterTag: 'reduite',
    });
    expect(payload).toBeNull();
  });

  it('returns a payload in DEV mode', () => {
    const payload = buildMobilityDebugLog({
      isDev: true,
      profileMobilityLevel: 'reduced',
      appliedFilterTag: 'reduite',
    });
    expect(payload).not.toBeNull();
  });

  it('payload contains exactly profile_mobility_level and applied_filter_tag (no PII)', () => {
    const payload = buildMobilityDebugLog({
      isDev: true,
      profileMobilityLevel: 'reduced',
      appliedFilterTag: 'reduite',
    });

    expect(payload).toEqual({
      profile_mobility_level: 'reduced',
      applied_filter_tag: 'reduite',
    });

    // Strict shape check: no extra keys (e.g. name, email, address) leak in.
    expect(Object.keys(payload!).sort()).toEqual([
      'applied_filter_tag',
      'profile_mobility_level',
    ]);
  });

  it('coerces undefined values to null so the log shape stays stable', () => {
    const payload = buildMobilityDebugLog({
      isDev: true,
      profileMobilityLevel: undefined,
      appliedFilterTag: undefined,
    });
    expect(payload).toEqual({
      profile_mobility_level: null,
      applied_filter_tag: null,
    });
  });

  it('coerces null values to null (passthrough)', () => {
    const payload = buildMobilityDebugLog({
      isDev: true,
      profileMobilityLevel: null,
      appliedFilterTag: null,
    });
    expect(payload).toEqual({
      profile_mobility_level: null,
      applied_filter_tag: null,
    });
  });

  it('does not include arbitrary fields even if extra props are passed at call site', () => {
    // Cast through unknown to bypass the strict input type and simulate a
    // call site that tried to sneak PII into the payload.
    const payload = buildMobilityDebugLog({
      isDev: true,
      profileMobilityLevel: 'mobile',
      appliedFilterTag: 'mobile',
      email: 'user@example.com',
      first_name: 'Alice',
    } as unknown as Parameters<typeof buildMobilityDebugLog>[0]);

    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('first_name');
    expect(Object.keys(payload!)).toHaveLength(2);
  });
});
