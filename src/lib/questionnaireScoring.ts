import { Product } from "@/hooks/useProducts";
import { toMobilityEnum, type MobilityValue } from "@/hooks/useProductFilters";

export interface QuestionnaireAnswers {
  /**
   * Either a French UI tag (`reduite`/`alitee`/`mobile`) coming from a
   * pre-filled profile, or the English DB enum (`reduced`/`bedridden`/`mobile`)
   * coming from the questionnaire UI itself. Both forms are normalised
   * internally via `toMobilityEnum`.
   */
  mobility?: MobilityValue;
  incontinenceLevel?: string;
  usageTime?: string;
  gender?: string;
  [key: string]: string | undefined;
}

/**
 * Score a single product against the questionnaire answers.
 * Mobility is normalised to the English DB enum so that French UI tags
 * (`reduite`/`alitee`) coming from a pre-filled profile still match
 * `product.mobility` (`reduced`/`bedridden`).
 */
export const scoreProductAgainstAnswers = (
  product: Product,
  answers: QuestionnaireAnswers
): number => {
  let score = 0;
  const answerMobilityEnum = toMobilityEnum(answers.mobility);
  if (answerMobilityEnum && product.mobility === answerMobilityEnum) score += 2;
  if (answers.incontinenceLevel && product.incontinence_level === answers.incontinenceLevel) score += 2;
  if (answers.usageTime && product.usage_time === answers.usageTime) score += 1;
  if (answers.gender && answers.gender !== 'any') {
    const productGender = product.gender || 'unisex';
    if (productGender === answers.gender || productGender === 'unisex') score += 1;
  }
  return score;
};

/**
 * Get the top 3 recommended products. Filters by min score (>= 2),
 * deprioritises add-ons, then sorts by score and price desc.
 */
export const getRecommendedProducts = (
  products: Product[],
  answers: QuestionnaireAnswers
): Product[] => {
  const scored = products
    .map((product) => ({ product, score: scoreProductAgainstAnswers(product, answers) }))
    .filter(({ score }) => score >= 2);

  scored.sort((a, b) => {
    const aIsAddon = a.product.is_addon ? 1 : 0;
    const bIsAddon = b.product.is_addon ? 1 : 0;
    if (aIsAddon !== bIsAddon) return aIsAddon - bIsAddon;
    if (b.score !== a.score) return b.score - a.score;
    return b.product.price - a.product.price;
  });

  return scored.slice(0, 3).map(({ product }) => product);
};
