/**
 * Vocabulaire courant de la boutique.
 * Regroupe les catégories de la base en familles compréhensibles,
 * sans modifier les données ni les noms officiels des marques.
 */

export type ShopGroupId =
  | 'a-enfiler'
  | 'avec-attaches'
  | 'anatomiques'
  | 'legeres'
  | 'aleses'
  | 'soins-peau';

export interface ShopGroup {
  id: ShopGroupId;
  label: string;
  explanation: string;
  /** Nom d'icône lucide utilisé côté composant */
  icon: 'pants' | 'tabs' | 'anatomic' | 'light' | 'bed' | 'skin';
  categoryIds: string[];
}

/** Catégories de la base (identifiants stables). */
export const CATEGORY_IDS = {
  incontinenceParent: '6c55f927-f627-41fa-bb30-fccefbc2475d',
  pants: 'c84bb36c-b167-4dae-9250-5805ac1f8bca',
  changesComplets: 'c958ff37-2b2c-4abe-92fb-61a52576ee4d',
  changesSlips: 'e03a83f5-e6c6-4ef5-abef-c7fd203ffdc0',
  feminines: '0bb287f7-1cc2-49c4-beb4-4810cc81692d',
  masculines: '801a961b-050a-4c73-aebd-7b0671f3ec15',
  aleses: 'a4541b4c-59a0-4b52-90c5-a4b2f61e4baa',
  soinsIncontinence: '66476c95-b639-445f-9ad7-e60437de60e9',
  nutritionParent: '62c33aab-fae0-4209-9788-bf3c24d7ebeb',
  nutritionClinique: 'f8d52198-b83f-4885-8f6e-2d2ac1fac0e8',
} as const;

export const SHOP_GROUPS: ShopGroup[] = [
  {
    id: 'a-enfiler',
    label: 'Protections à enfiler',
    explanation: 'Se mettent comme un sous-vêtement. Pour une personne qui se déplace seule.',
    icon: 'pants',
    categoryIds: [CATEGORY_IDS.pants],
  },
  {
    id: 'avec-attaches',
    label: 'Protections avec attaches',
    explanation: "S'ouvrent complètement. Pour une personne alitée ou aidée par un proche.",
    icon: 'tabs',
    categoryIds: [CATEGORY_IDS.changesComplets],
  },
  {
    id: 'anatomiques',
    label: 'Protections anatomiques',
    explanation: 'Se portent dans un slip maintenu. Discrètes, pour des fuites modérées à fortes.',
    icon: 'anatomic',
    categoryIds: [CATEGORY_IDS.changesSlips],
  },
  {
    id: 'legeres',
    label: 'Protections légères',
    explanation: 'Fines et discrètes, pour quelques gouttes au quotidien.',
    icon: 'light',
    categoryIds: [CATEGORY_IDS.feminines, CATEGORY_IDS.masculines],
  },
  {
    id: 'aleses',
    label: 'Alèses',
    explanation: 'Se posent sur le lit ou le fauteuil pour protéger le matelas.',
    icon: 'bed',
    categoryIds: [CATEGORY_IDS.aleses],
  },
  {
    id: 'soins-peau',
    label: 'Soins de la peau',
    explanation: 'Nettoyer, protéger et apaiser la peau au moment du change.',
    icon: 'skin',
    categoryIds: [CATEGORY_IDS.soinsIncontinence],
  },
];

/** Catégories où l'absorption et la taille ont un sens. */
const ABSORPTION_CATEGORY_IDS = new Set<string>([
  CATEGORY_IDS.pants,
  CATEGORY_IDS.changesComplets,
  CATEGORY_IDS.changesSlips,
  CATEGORY_IDS.feminines,
  CATEGORY_IDS.masculines,
  CATEGORY_IDS.aleses,
]);

export const isAbsorptionRelevant = (categoryId?: string | null) =>
  !!categoryId && ABSORPTION_CATEGORY_IDS.has(categoryId);

export const isNutritionCategory = (categoryId?: string | null) =>
  categoryId === CATEGORY_IDS.nutritionClinique || categoryId === CATEGORY_IDS.nutritionParent;

/** Libellé de forme du produit, en langage courant. */
export const getProductFormLabel = (categoryId?: string | null): string | null => {
  switch (categoryId) {
    case CATEGORY_IDS.pants:
      return 'À enfiler';
    case CATEGORY_IDS.changesComplets:
      return 'Avec attaches';
    case CATEGORY_IDS.changesSlips:
      return 'Anatomique';
    case CATEGORY_IDS.feminines:
    case CATEGORY_IDS.masculines:
      return 'Protection légère';
    case CATEGORY_IDS.aleses:
      return 'Alèse';
    case CATEGORY_IDS.soinsIncontinence:
      return 'Soin de la peau';
    default:
      return null;
  }
};

/**
 * Nombre de pièces annoncé dans le nom du produit ("- 24pc", "4x35pc").
 * Lecture pour affichage uniquement : rien n'est écrit en base.
 * Retourne null quand l'information est absente ou non fiable (1 pièce).
 */
export const getPackUnitsFromName = (name?: string | null): number | null => {
  if (!name) return null;
  const match = name.match(/(?:(\d+)\s*[x×]\s*)?(\d+)\s*pc\b/i);
  if (!match) return null;
  const multiplier = match[1] ? parseInt(match[1], 10) : 1;
  const units = parseInt(match[2], 10) * multiplier;
  if (!Number.isFinite(units) || units <= 1) return null;
  return units;
};

/** Taille lisible extraite du nom ("- Large - 22pc" → "Large"). */
export const getSizeFromName = (name?: string | null): string | null => {
  if (!name) return null;
  const parts = name.split(' - ').map((p) => p.trim());
  const sizePart = parts.slice(1).find((p) => !/pc\b/i.test(p));
  return sizePart || null;
};
