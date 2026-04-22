import { describe, it, expect } from 'vitest';
import {
  validateMobilityConversion,
  shouldWarnUser,
} from './mobilityConversionValidator';

describe('validateMobilityConversion', () => {
  it('returns "empty" when the profile has no mobility value', () => {
    const result = validateMobilityConversion(null, null);
    expect(result.status).toBe('empty');
    expect(result.warningMessage).toBeNull();
  });

  it('returns "empty" when raw is undefined', () => {
    const result = validateMobilityConversion(undefined, undefined);
    expect(result.status).toBe('empty');
  });

  it('returns "ok" when a valid enum maps to the matching tag', () => {
    const result = validateMobilityConversion('reduced', 'reduite');
    expect(result.status).toBe('ok');
    expect(result.resolvedFilterTag).toBe('reduite');
    expect(result.warningMessage).toBeNull();
  });

  it('returns "ok" for the bedridden→alitee mapping', () => {
    const result = validateMobilityConversion('bedridden', 'alitee');
    expect(result.status).toBe('ok');
  });

  it('returns "auto_corrected" when raw is a French tag (legacy data)', () => {
    const result = validateMobilityConversion('reduite', 'reduite');
    expect(result.status).toBe('auto_corrected');
    expect(result.warningMessage).toBeNull();
  });

  it('returns "invalid_profile_value" with a clear message for garbage', () => {
    const result = validateMobilityConversion('mobilite_reduite_xyz', null);
    expect(result.status).toBe('invalid_profile_value');
    expect(result.warningMessage).toContain('mobilite_reduite_xyz');
    expect(result.warningMessage).toContain('profil');
  });

  it('returns "mapping_failed" when enum is valid but no tag was produced', () => {
    // Profile said "mobile" (valid enum), but the filter state somehow ended
    // up with no tag — indicates a bug between the validator and the mapper.
    const result = validateMobilityConversion('mobile', null);
    expect(result.status).toBe('mapping_failed');
    expect(result.warningMessage).toContain('incohérence');
  });

  it('returns "unknown_filter_tag" (silent) when the filter is the "Tous" sentinel', () => {
    // "all" is the UI sentinel for the filter being inactive — typically
    // because the user voluntarily picked "Tous". This is NOT a bug and
    // must NOT trigger a warning, even though the profile has a valid
    // value. Distinct from `mapping_failed` so the two cases stay
    // separable for analytics/debugging.
    const result = validateMobilityConversion('mobile', 'all');
    expect(result.status).toBe('unknown_filter_tag');
    expect(result.resolvedFilterTag).toBeNull();
    expect(result.warningMessage).toBeNull();
  });

  it('returns "unknown_filter_tag" (silent) for any other unrecognised tag string', () => {
    // Defensive: a stale or legacy filter value (e.g. an enum that leaked
    // into the filter state, or a value from an older release) must
    // degrade gracefully — silent fallback rather than a spurious alert.
    const result = validateMobilityConversion('mobile', 'reduced');
    expect(result.status).toBe('unknown_filter_tag');
    expect(result.warningMessage).toBeNull();
  });

  it('still returns "mapping_failed" when the caller passes null for a valid enum', () => {
    // Strict pipeline-bug case: caller has nothing to offer but the
    // profile says we *should* have a tag. This remains a hard warning.
    const result = validateMobilityConversion('mobile', null);
    expect(result.status).toBe('mapping_failed');
  });

  it('exposes the raw value verbatim in the result', () => {
    const result = validateMobilityConversion('weird-value', null);
    expect(result.rawProfileValue).toBe('weird-value');
  });
});

describe('shouldWarnUser', () => {
  it('warns on invalid profile values and mapping failures', () => {
    expect(shouldWarnUser('invalid_profile_value')).toBe(true);
    expect(shouldWarnUser('mapping_failed')).toBe(true);
  });

  it('stays silent on healthy, empty, or unknown-tag states', () => {
    expect(shouldWarnUser('empty')).toBe(false);
    expect(shouldWarnUser('ok')).toBe(false);
    expect(shouldWarnUser('auto_corrected')).toBe(false);
    // Critical guarantee: voluntary "Tous" / unknown tag must NOT warn.
    expect(shouldWarnUser('unknown_filter_tag')).toBe(false);
  });
});
