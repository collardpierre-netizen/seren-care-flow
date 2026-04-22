import { useMemo } from 'react';
import { Product } from './useProducts';
import { matchesIncontinenceLevel } from '@/lib/profileNormalization';

// ─────────────────────────────────────────────────────────────────────────────
// Mobility types
// We keep two strictly distinct sets of values to prevent accidental mixing:
//   - MobilityEnum: English values stored in the DB (column `products.mobility`,
//     `profiles.mobility_level`). Source of truth for persistence.
//   - MobilityTag:  French slugs used by the shop UI (filter buttons, query
//     state). Source of truth for presentation.
// Use `toMobilityEnum` / `toMobilityTag` to cross the boundary explicitly.
// ─────────────────────────────────────────────────────────────────────────────

/** English DB enum for product/profile mobility. */
export type MobilityEnum = 'mobile' | 'reduced' | 'bedridden';

/** French UI tag used by the shop filter buttons. */
export type MobilityTag = 'mobile' | 'reduite' | 'alitee';

/** Either form, useful for input parameters that accept both. */
export type MobilityValue = MobilityEnum | MobilityTag;

/** Filter option ids include the special "all" sentinel. */
export type MobilityFilterId = 'all' | MobilityTag;

export type UsageTimeTag = 'day' | 'night';
export type GenderTag = 'male' | 'female' | 'unisex';

// Filter options with UI labels
export const mobilityFilterOptions: ReadonlyArray<{
  id: MobilityFilterId;
  label: string;
  tag: MobilityTag | null;
}> = [
  { id: 'all', label: 'Toutes', tag: null },
  { id: 'mobile', label: 'Mobile', tag: 'mobile' },
  { id: 'reduite', label: 'Réduite', tag: 'reduite' },
  { id: 'alitee', label: 'Alitée', tag: 'alitee' },
];

export const usageTimeFilterOptions = [
  { id: 'all', label: 'Tous', tag: null },
  { id: 'day', label: 'Jour', tag: 'day' as UsageTimeTag },
  { id: 'night', label: 'Nuit', tag: 'night' as UsageTimeTag },
  { id: 'day_night', label: 'Jour & Nuit', tag: 'day_night' as any },
];

export const genderFilterOptions = [
  { id: 'all', label: 'Tous', tag: null },
  { id: 'male', label: 'Homme', tag: 'male' as GenderTag },
  { id: 'female', label: 'Femme', tag: 'female' as GenderTag },
  { id: 'unisex', label: 'Unisexe', tag: 'unisex' as GenderTag },
];

// Map English DB enum values (mobility_type) to French UI tags
export const MOBILITY_ENUM_TO_TAG: Record<MobilityEnum, MobilityTag> = {
  mobile: 'mobile',
  reduced: 'reduite',
  bedridden: 'alitee',
};

// Reverse map: French UI tag → English DB enum
export const MOBILITY_TAG_TO_ENUM: Record<MobilityTag, MobilityEnum> = {
  mobile: 'mobile',
  reduite: 'reduced',
  alitee: 'bedridden',
};

export const isMobilityTag = (value: string): value is MobilityTag =>
  Object.prototype.hasOwnProperty.call(MOBILITY_TAG_TO_ENUM, value);

export const isMobilityEnum = (value: string): value is MobilityEnum =>
  Object.prototype.hasOwnProperty.call(MOBILITY_ENUM_TO_TAG, value);

/**
 * Normalise a mobility value to the English DB enum (`mobile`/`reduced`/`bedridden`).
 * Accepts either a French UI tag or an English enum value. Returns `null` when
 * the input is unknown — never silently coerces unrelated strings.
 */
export const toMobilityEnum = (value: string | null | undefined): MobilityEnum | null => {
  if (!value) return null;
  if (isMobilityTag(value)) return MOBILITY_TAG_TO_ENUM[value];
  if (isMobilityEnum(value)) return value;
  return null;
};

/**
 * Normalise a mobility value to the French UI tag (`mobile`/`reduite`/`alitee`).
 * Accepts either an English enum value or a French UI tag. Returns `null` when
 * the input is unknown.
 */
export const toMobilityTag = (value: string | null | undefined): MobilityTag | null => {
  if (!value) return null;
  if (isMobilityEnum(value)) return MOBILITY_ENUM_TO_TAG[value];
  if (isMobilityTag(value)) return value;
  return null;
};

// Backfill rules for computing default tags
const CATEGORY_MOBILITY_MAP: Record<string, string> = {
  'Alèses': 'alitee',
  'Changes complets': 'reduite|alitee',
  'Protections anatomiques': 'reduite|alitee',
  'Sous-vêtements absorbants': 'mobile|reduite',
};

/**
 * Compute fallback mobility_levels based on category name
 */
export const computeMobilityFromCategory = (categoryName: string | null | undefined): string => {
  if (!categoryName) return 'mobile';
  return CATEGORY_MOBILITY_MAP[categoryName] || 'mobile';
};

/**
 * Compute fallback usage_times based on product name
 */
export const computeUsageTimeFromName = (productName: string | null | undefined): string => {
  if (!productName) return 'day|night';
  const nameLower = productName.toLowerCase();
  if (nameLower.includes('nuit') || nameLower.includes('night')) {
    return 'night';
  }
  return 'day|night';
};

/**
 * Compute fallback gender based on product name
 */
export const computeGenderFromName = (productName: string | null | undefined): string => {
  if (!productName) return 'unisex';
  const nameLower = productName.toLowerCase();
  if (nameLower.includes('men') && !nameLower.includes('women')) {
    return 'male';
  }
  if (nameLower.includes('silhouette') || nameLower.includes('discreet') || nameLower.includes('lady') || nameLower.includes('femme')) {
    return 'female';
  }
  return 'unisex';
};

/**
 * Get effective mobility levels for a product (from DB or computed fallback)
 */
export const getEffectiveMobilityLevels = (product: any): string => {
  if (product.mobility_levels && product.mobility_levels.trim() !== '') {
    return product.mobility_levels;
  }
  // Fallback: map English enum to French tags
  if (product.mobility && MOBILITY_ENUM_TO_TAG[product.mobility]) {
    return MOBILITY_ENUM_TO_TAG[product.mobility];
  }
  return computeMobilityFromCategory(product.category?.name);
};

/**
 * Get effective usage times for a product (from DB or computed fallback)
 */
export const getEffectiveUsageTimes = (product: any): string => {
  if (product.usage_times && product.usage_times.trim() !== '') {
    return product.usage_times;
  }
  return computeUsageTimeFromName(product.name);
};

/**
 * Get effective gender for a product (from DB or computed fallback)
 */
export const getEffectiveGender = (product: any): string => {
  if (product.gender && product.gender.trim() !== '') {
    return product.gender;
  }
  return computeGenderFromName(product.name);
};

/**
 * Split a tag string supporting either pipe (`|`) or comma (`,`) separators.
 * The DB stores values like `mobile,reduite` while some legacy paths use `|`.
 */
export const splitTags = (tagString: string | null | undefined): string[] => {
  if (!tagString) return [];
  return tagString
    .split(/[|,]/)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
};

/**
 * Check if a tag string contains a specific tag
 */
export const containsTag = (tagString: string, tag: string): boolean => {
  return splitTags(tagString).includes(tag.toLowerCase());
};

interface ProductFiltersState {
  selectedMobility: string;
  selectedUsageTime: string;
  selectedGender: string;
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  selectedIncontinence: string;
  priceMin?: number;
  priceMax?: number;
  categories?: { id: string; parent_id: string | null }[];
}

interface UseProductFiltersResult {
  filteredProducts: Product[];
  filterCounts: {
    mobility: Record<string, number>;
    usageTime: Record<string, number>;
    gender: Record<string, number>;
    incontinence: Record<string, number>;
  };
}

/**
 * Hook to filter products based on multi-tag system
 */
export const useProductFilters = (
  products: Product[] | undefined,
  filters: ProductFiltersState
): UseProductFiltersResult => {
  const { 
    selectedMobility, 
    selectedUsageTime, 
    selectedGender, 
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedIncontinence,
    priceMin,
    priceMax,
    categories 
  } = filters;

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand?.name?.toLowerCase().includes(query);
        const matchesDescription = product.short_description?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesDescription) return false;
      }

      // Category filter (includes child categories when selecting a parent)
      if (selectedCategory !== 'all') {
        const childIds = categories
          ?.filter(c => c.parent_id === selectedCategory)
          .map(c => c.id) || [];
        const matchIds = [selectedCategory, ...childIds];
        if (!product.category_id || !matchIds.includes(product.category_id)) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        if (product.brand_id !== selectedBrand) {
          return false;
        }
      }

      // Incontinence filter — uses the normalised matcher so aliases/casing
      // never cause silent zero-result filters.
      if (selectedIncontinence !== 'all') {
        if (product.incontinence_level !== null &&
            !matchesIncontinenceLevel(product.incontinence_level, selectedIncontinence)) {
          return false;
        }
      }

      // Price filter
      if (priceMin !== undefined && product.price < priceMin) return false;
      if (priceMax !== undefined && product.price > priceMax) return false;

      // Mobility filter (multi-tag)
      if (selectedMobility !== 'all') {
        const effectiveMobility = getEffectiveMobilityLevels(product);
        if (!containsTag(effectiveMobility, selectedMobility)) {
          return false;
        }
      }

      // Usage time filter (multi-tag)
      if (selectedUsageTime !== 'all') {
        const effectiveUsageTime = getEffectiveUsageTimes(product);
        // Special case for day_night: match products that have BOTH day and night
        if (selectedUsageTime === 'day_night') {
          if (!containsTag(effectiveUsageTime, 'day') || !containsTag(effectiveUsageTime, 'night')) {
            return false;
          }
        } else if (!containsTag(effectiveUsageTime, selectedUsageTime)) {
          return false;
        }
      }

      // Gender filter (multi-tag)
      if (selectedGender !== 'all') {
        const effectiveGender = getEffectiveGender(product);
        if (!containsTag(effectiveGender, selectedGender)) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedIncontinence, selectedMobility, selectedUsageTime, selectedGender, priceMin, priceMax, categories]);

  // Calculate counts for filter options
  const filterCounts = useMemo(() => {
    const counts = {
      mobility: {} as Record<string, number>,
      usageTime: {} as Record<string, number>,
      gender: {} as Record<string, number>,
      incontinence: {} as Record<string, number>,
    };

    products?.forEach(product => {
      // Incontinence counts
      if (product.incontinence_level) {
        counts.incontinence[product.incontinence_level] = (counts.incontinence[product.incontinence_level] || 0) + 1;
      }

      // Mobility counts (from effective tags)
      const mobilityTags = splitTags(getEffectiveMobilityLevels(product));
      mobilityTags.forEach(tag => {
        if (tag) {
          counts.mobility[tag] = (counts.mobility[tag] || 0) + 1;
        }
      });

      // Usage time counts (from effective tags)
      const usageTimeTags = splitTags(getEffectiveUsageTimes(product));
      usageTimeTags.forEach(tag => {
        if (tag) {
          counts.usageTime[tag] = (counts.usageTime[tag] || 0) + 1;
        }
      });
      // Count day_night for products that have both
      if (usageTimeTags.includes('day') && usageTimeTags.includes('night')) {
        counts.usageTime['day_night'] = (counts.usageTime['day_night'] || 0) + 1;
      }

      // Gender counts (from effective tags)
      const genderTags = splitTags(getEffectiveGender(product));
      genderTags.forEach(tag => {
        if (tag) {
          counts.gender[tag] = (counts.gender[tag] || 0) + 1;
        }
      });
    });

    return counts;
  }, [products]);

  return { filteredProducts, filterCounts };
};
