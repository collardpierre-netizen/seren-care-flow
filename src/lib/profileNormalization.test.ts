import { describe, it, expect } from "vitest";
import {
  toIncontinenceLevel,
  matchesIncontinenceLevel,
  toUsageTime,
  matchesUsageTime,
  toGender,
  matchesGender,
} from "./profileNormalization";

describe("profileNormalization", () => {
  describe("toIncontinenceLevel", () => {
    it("normalises canonical values", () => {
      expect(toIncontinenceLevel("light")).toBe("light");
      expect(toIncontinenceLevel("very_heavy")).toBe("very_heavy");
    });

    it("normalises FR aliases and casing", () => {
      expect(toIncontinenceLevel("Légère")).toBe("light");
      expect(toIncontinenceLevel("MODÉRÉE")).toBe("moderate");
      expect(toIncontinenceLevel(" forte ")).toBe("heavy");
      expect(toIncontinenceLevel("complète")).toBe("very_heavy");
    });

    it("returns null for unknown / empty", () => {
      expect(toIncontinenceLevel("xyz")).toBeNull();
      expect(toIncontinenceLevel(null)).toBeNull();
      expect(toIncontinenceLevel(undefined)).toBeNull();
    });
  });

  describe("matchesIncontinenceLevel", () => {
    it("matches direct enum equality", () => {
      expect(matchesIncontinenceLevel("moderate", "moderate")).toBe(true);
    });

    it("matches FR alias against EN enum", () => {
      expect(matchesIncontinenceLevel("moderate", "modérée")).toBe(true);
      expect(matchesIncontinenceLevel("légère", "light")).toBe(true);
    });

    it("rejects mismatching levels", () => {
      expect(matchesIncontinenceLevel("light", "heavy")).toBe(false);
    });

    it("treats null/empty as no constraint", () => {
      expect(matchesIncontinenceLevel(null, "heavy")).toBe(true);
      expect(matchesIncontinenceLevel("heavy", null)).toBe(true);
    });
  });

  describe("toUsageTime + matchesUsageTime", () => {
    it("normalises FR aliases", () => {
      expect(toUsageTime("Jour")).toBe("day");
      expect(toUsageTime("nuit")).toBe("night");
      expect(toUsageTime("jour-nuit")).toBe("day_night");
    });

    it("treats day_night as wildcard on either side", () => {
      expect(matchesUsageTime("day_night", "day")).toBe(true);
      expect(matchesUsageTime("night", "day_night")).toBe(true);
      expect(matchesUsageTime("day_night", "night")).toBe(true);
    });

    it("rejects strict day vs night", () => {
      expect(matchesUsageTime("day", "night")).toBe(false);
    });
  });

  describe("toGender + matchesGender", () => {
    it("normalises FR aliases and 'any' to unisex", () => {
      expect(toGender("Homme")).toBe("male");
      expect(toGender("femme")).toBe("female");
      expect(toGender("any")).toBe("unisex");
    });

    it("unisex on either side acts as wildcard", () => {
      expect(matchesGender("unisex", "male")).toBe(true);
      expect(matchesGender("female", "unisex")).toBe(true);
      expect(matchesGender("female", "any")).toBe(true);
    });

    it("matches FR alias 'Femme' against product 'female'", () => {
      expect(matchesGender("female", "Femme")).toBe(true);
    });

    it("rejects mismatching strict genders", () => {
      expect(matchesGender("male", "female")).toBe(false);
    });

    it("treats null product gender as unisex (legacy data)", () => {
      expect(matchesGender(null, "male")).toBe(true);
    });
  });
});
