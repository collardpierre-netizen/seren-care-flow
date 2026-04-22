import { describe, it, expect } from "vitest";
import { mapProfileToFilters, validateUserPreferences, type UserPreferences } from "./useUserPreferences";

const makePrefs = (overrides: Partial<UserPreferences>): UserPreferences => ({
  buying_for: null,
  age_range: null,
  gender: null,
  incontinence_level: null,
  mobility_level: null,
  usage_time: null,
  onboarding_completed: null,
  preferred_size: null,
  ...overrides,
});

describe("validateUserPreferences", () => {
  it("auto-corrects a French mobility tag stored in mobility_level to the EN enum silently", () => {
    const { sanitized, warnings } = validateUserPreferences(
      makePrefs({ mobility_level: "reduite" }),
    );
    expect(sanitized.mobility_level).toBe("reduced");
    // Silent auto-correction: alias → canonical is not a user-facing issue.
    expect(warnings).toHaveLength(0);
  });

  it("drops an unknown mobility value and emits a 'dropped' warning", () => {
    const { sanitized, warnings } = validateUserPreferences(
      makePrefs({ mobility_level: "totally_invalid" }),
    );
    expect(sanitized.mobility_level).toBeNull();
    expect(warnings).toEqual([
      { field: "mobility_level", original: "totally_invalid", corrected: null, kind: "dropped" },
    ]);
  });

  it("auto-corrects FR aliases for incontinence/gender/usage_time silently", () => {
    const { sanitized, warnings } = validateUserPreferences(
      makePrefs({
        incontinence_level: "Légère",
        gender: "Femme",
        usage_time: "Jour",
      }),
    );
    expect(sanitized.incontinence_level).toBe("light");
    expect(sanitized.gender).toBe("female");
    expect(sanitized.usage_time).toBe("day");
    expect(warnings).toHaveLength(0);
  });

  it("collects multiple warnings when several fields are unknown", () => {
    const { sanitized, warnings } = validateUserPreferences(
      makePrefs({
        mobility_level: "xxx",
        incontinence_level: "yyy",
        gender: "zzz",
      }),
    );
    expect(sanitized.mobility_level).toBeNull();
    expect(sanitized.incontinence_level).toBeNull();
    expect(sanitized.gender).toBeNull();
    expect(warnings.map(w => w.field).sort()).toEqual(
      ["gender", "incontinence_level", "mobility_level"],
    );
    expect(warnings.every(w => w.kind === "dropped")).toBe(true);
  });

  it("leaves untouched fields (e.g. preferred_size, age_range) intact", () => {
    const { sanitized } = validateUserPreferences(
      makePrefs({
        preferred_size: "M",
        age_range: "55-64",
        mobility_level: "reduced",
      }),
    );
    expect(sanitized.preferred_size).toBe("M");
    expect(sanitized.age_range).toBe("55-64");
    expect(sanitized.mobility_level).toBe("reduced");
  });

  it("returns no warnings when all values are already canonical", () => {
    const { warnings } = validateUserPreferences(
      makePrefs({
        mobility_level: "mobile",
        incontinence_level: "heavy",
        gender: "male",
        usage_time: "night",
      }),
    );
    expect(warnings).toHaveLength(0);
  });
});

describe("mapProfileToFilters - mobility translation", () => {
  it("translates 'reduced' to 'reduite'", () => {
    const result = mapProfileToFilters({
      mobility_level: "reduced",
    } as any);
    expect(result?.mobility).toBe("reduite");
  });

  it("translates 'bedridden' to 'alitee'", () => {
    const result = mapProfileToFilters({
      mobility_level: "bedridden",
    } as any);
    expect(result?.mobility).toBe("alitee");
  });

  it("keeps 'mobile' as 'mobile'", () => {
    const result = mapProfileToFilters({
      mobility_level: "mobile",
    } as any);
    expect(result?.mobility).toBe("mobile");
  });

  it("returns undefined mobility when no mobility_level is set", () => {
    const result = mapProfileToFilters({} as any);
    expect(result?.mobility).toBeUndefined();
  });

  it("returns null when preferences are null", () => {
    expect(mapProfileToFilters(null)).toBeNull();
    expect(mapProfileToFilters(undefined)).toBeNull();
  });

  it("returns undefined mobility for unknown mobility_level (no leakage of non-tag strings)", () => {
    const result = mapProfileToFilters({
      mobility_level: "unknown_value",
    } as any);
    // The new strict typing forbids leaking arbitrary strings into the UI
    // filter state — unknown values are dropped instead of passed through.
    expect(result?.mobility).toBeUndefined();
  });

  it("preserves other preferences alongside mobility translation", () => {
    const result = mapProfileToFilters({
      mobility_level: "reduced",
      gender: "female",
      incontinence_level: "moderate",
      usage_time: "night",
    } as any);
    expect(result).toEqual({
      mobility: "reduite",
      gender: "female",
      incontinenceLevel: "moderate",
      usageTime: "night",
    });
  });
});
