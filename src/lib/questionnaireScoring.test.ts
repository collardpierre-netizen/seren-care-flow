import { describe, it, expect } from "vitest";
import { scoreProductAgainstAnswers, getRecommendedProducts } from "./questionnaireScoring";
import type { Product } from "@/hooks/useProducts";

const makeProduct = (overrides: Partial<Product>): Product => ({
  id: overrides.id || "p",
  name: overrides.name || "Product",
  slug: overrides.slug || "product",
  brand_id: null,
  category_id: null,
  short_description: null,
  description: null,
  incontinence_level: null,
  mobility: null,
  usage_time: null,
  mobility_levels: null,
  usage_times: null,
  gender: null,
  price: 10,
  recommended_price: null,
  purchase_price: null,
  units_per_product: null,
  subscription_price: null,
  subscription_discount_percent: null,
  min_order_quantity: null,
  stock_quantity: null,
  stock_status: null,
  sku: null,
  ean_code: null,
  cnk_code: null,
  is_active: true,
  is_featured: false,
  is_coming_soon: false,
  show_size_guide: false,
  is_subscription_eligible: false,
  is_addon: false,
  addon_category: null,
  created_at: "",
  updated_at: "",
  ...overrides,
});

describe("questionnaireScoring", () => {
  describe("scoreProductAgainstAnswers", () => {
    it("matches a French UI tag 'reduite' against a product with mobility 'reduced'", () => {
      const product = makeProduct({ mobility: "reduced" });
      expect(scoreProductAgainstAnswers(product, { mobility: "reduite" })).toBe(2);
    });

    it("matches a French UI tag 'alitee' against a product with mobility 'bedridden'", () => {
      const product = makeProduct({ mobility: "bedridden" });
      expect(scoreProductAgainstAnswers(product, { mobility: "alitee" })).toBe(2);
    });

    it("still matches when answer is already an English enum 'reduced'", () => {
      const product = makeProduct({ mobility: "reduced" });
      expect(scoreProductAgainstAnswers(product, { mobility: "reduced" })).toBe(2);
    });

    it("does not score mobility when product mobility differs", () => {
      const product = makeProduct({ mobility: "mobile" });
      expect(scoreProductAgainstAnswers(product, { mobility: "reduite" })).toBe(0);
    });
  });

  describe("getRecommendedProducts (profile pre-fill scenario)", () => {
    it("returns products matching a French tag 'reduite' coming from a pre-filled profile", () => {
      const products: Product[] = [
        makeProduct({ id: "match1", mobility: "reduced", incontinence_level: "moderate", price: 25 }),
        makeProduct({ id: "match2", mobility: "reduced", incontinence_level: "moderate", price: 40 }),
        makeProduct({ id: "noMatch", mobility: "mobile", incontinence_level: "light", price: 30 }),
      ];

      const recommended = getRecommendedProducts(products, {
        mobility: "reduite", // French tag from profile
        incontinenceLevel: "moderate",
      });

      expect(recommended).toHaveLength(2);
      expect(recommended.map((p) => p.id)).toEqual(["match2", "match1"]); // higher price first
      expect(recommended.find((p) => p.id === "noMatch")).toBeUndefined();
    });

    it("returns the same recommendations whether mobility is 'reduite' or 'reduced'", () => {
      const products: Product[] = [
        makeProduct({ id: "a", mobility: "reduced", incontinence_level: "heavy", price: 50 }),
        makeProduct({ id: "b", mobility: "bedridden", incontinence_level: "heavy", price: 60 }),
      ];

      const fromTag = getRecommendedProducts(products, {
        mobility: "reduite",
        incontinenceLevel: "heavy",
      });
      const fromEnum = getRecommendedProducts(products, {
        mobility: "reduced",
        incontinenceLevel: "heavy",
      });

      expect(fromTag.map((p) => p.id)).toEqual(fromEnum.map((p) => p.id));
      expect(fromTag.map((p) => p.id)).toContain("a");
    });

    it("deprioritises add-ons even when they match", () => {
      const products: Product[] = [
        makeProduct({ id: "addon", mobility: "reduced", incontinence_level: "moderate", is_addon: true, price: 100 }),
        makeProduct({ id: "real", mobility: "reduced", incontinence_level: "moderate", is_addon: false, price: 20 }),
      ];

      const recommended = getRecommendedProducts(products, {
        mobility: "reduite",
        incontinenceLevel: "moderate",
      });

      expect(recommended[0].id).toBe("real");
      expect(recommended[1].id).toBe("addon");
    });
  });
});
