import { describe, it, expect } from "vitest";
import { mapProfileToFilters } from "./useUserPreferences";

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
