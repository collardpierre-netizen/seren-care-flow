// Size normalization utilities
// Extract standard size code from product size names

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

/**
 * Extracts a standard size code (S, M, L, XL) from a product size string.
 * Handles various formats like:
 * - "TAILLE L - 7D" → "L"
 * - "Taille M" → "M"
 * - "L" → "L"
 * - "X-LARGE" → "XL"
 * - "SMALL" → "S"
 * - "MEDIUM" → "M"
 * - "LARGE" → "L"
 */
export function extractStandardSize(sizeString: string): string | null {
  if (!sizeString) return null;
  
  const upperSize = sizeString.toUpperCase().trim();
  
  // Direct match first
  if (STANDARD_SIZES.includes(upperSize as typeof STANDARD_SIZES[number])) {
    return upperSize;
  }
  
  // Check for size words
  const sizePatterns: Record<string, string> = {
    'X-SMALL': 'S',
    'XSMALL': 'S',
    'EXTRA-SMALL': 'S',
    'SMALL': 'S',
    'MEDIUM': 'M',
    'X-LARGE': 'XL',
    'XLARGE': 'XL',
    'EXTRA-LARGE': 'XL',
    'LARGE': 'L',
    'XX-LARGE': 'XXL',
    'XXLARGE': 'XXL',
    'XXX-LARGE': 'XXXL',
    'XXXLARGE': 'XXXL',
  };
  
  for (const [pattern, standardSize] of Object.entries(sizePatterns)) {
    if (upperSize.includes(pattern)) {
      return standardSize;
    }
  }
  
  // Look for size codes in the string (e.g., "TAILLE L - 7D" → "L")
  // Match standalone size codes surrounded by non-letter characters or string boundaries
  const sizeRegex = /(?:^|[^A-Z])(XXL|XL|XXXL|XXL|S|M|L)(?:[^A-Z]|$)/;
  const match = upperSize.match(sizeRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: check if any standard size is contained
  for (const size of ['XXXL', 'XXL', 'XL', 'S', 'M', 'L']) {
    // Use word boundary-like matching
    const regex = new RegExp(`(?:^|\\s|[-_])${size}(?:$|\\s|[-_])`);
    if (regex.test(upperSize)) {
      return size;
    }
  }
  
  return null;
}

/**
 * Check if a product size matches a standard size code
 * @param productSize The actual product size string (e.g., "TAILLE L - 7D")
 * @param standardSize The standard size code to match (e.g., "L")
 */
export function matchesStandardSize(productSize: string, standardSize: string): boolean {
  const extracted = extractStandardSize(productSize);
  return extracted === standardSize.toUpperCase();
}

/**
 * Find the product size that matches a standard size code
 * @param productSizes Array of product size strings
 * @param standardSize The standard size code to find
 */
export function findMatchingProductSize(productSizes: string[], standardSize: string): string | undefined {
  return productSizes.find(ps => matchesStandardSize(ps, standardSize));
}

/**
 * Get all available standard sizes from product sizes
 * @param productSizes Array of product size strings
 * @returns Array of standard size codes that are available
 */
export function getAvailableStandardSizes(productSizes: string[]): string[] {
  const standardSizes: string[] = [];
  
  for (const productSize of productSizes) {
    const standard = extractStandardSize(productSize);
    if (standard && !standardSizes.includes(standard)) {
      standardSizes.push(standard);
    }
  }
  
  // Sort by size order
  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  return standardSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
}
