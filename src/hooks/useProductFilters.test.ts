import { describe, it, expect } from "vitest";
import { toMobilityEnum, toMobilityTag } from "./useProductFilters";

describe("toMobilityEnum", () => {
  it("translates French UI tags to English DB enum", () => {
    expect(toMobilityEnum("reduite")).toBe("reduced");
    expect(toMobilityEnum("alitee")).toBe("bedridden");
    expect(toMobilityEnum("mobile")).toBe("mobile");
  });

  it("passes through English enum values unchanged", () => {
    expect(toMobilityEnum("reduced")).toBe("reduced");
    expect(toMobilityEnum("bedridden")).toBe("bedridden");
  });

  it("returns null for unknown or empty values", () => {
    expect(toMobilityEnum(null)).toBeNull();
    expect(toMobilityEnum(undefined)).toBeNull();
    expect(toMobilityEnum("")).toBeNull();
    expect(toMobilityEnum("unknown")).toBeNull();
  });
});

describe("toMobilityTag", () => {
  it("translates English DB enum to French UI tags", () => {
    expect(toMobilityTag("reduced")).toBe("reduite");
    expect(toMobilityTag("bedridden")).toBe("alitee");
    expect(toMobilityTag("mobile")).toBe("mobile");
  });

  it("passes through French UI tags unchanged", () => {
    expect(toMobilityTag("reduite")).toBe("reduite");
    expect(toMobilityTag("alitee")).toBe("alitee");
  });

  it("returns null for unknown or empty values", () => {
    expect(toMobilityTag(null)).toBeNull();
    expect(toMobilityTag(undefined)).toBeNull();
    expect(toMobilityTag("")).toBeNull();
    expect(toMobilityTag("unknown")).toBeNull();
  });
});
