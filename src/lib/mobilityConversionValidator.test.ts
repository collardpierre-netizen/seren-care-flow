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

  it('ignores filter values that are not real mobility tags', () => {
    // "all" is the sentinel for the filter being inactive — must NOT count
    // as a resolved tag.
    const result = validateMobilityConversion('mobile', 'all');
    expect(result.status).toBe('mapping_failed');
    expect(result.resolvedFilterTag).toBeNull();
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

  it('stays silent on healthy or empty states', () => {
    expect(shouldWarnUser('empty')).toBe(false);
    expect(shouldWarnUser('ok')).toBe(false);
    expect(shouldWarnUser('auto_corrected')).toBe(false);
  });
});
