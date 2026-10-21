/**
 * Tipos oficiales para el catálogo y coleccionador Yu-Gi-Oh! TCG Europa
 */

export type CardAttribute =
  | 'LUZ'
  | 'OSCURIDAD'
  | 'AGUA'
  | 'FUEGO'
  | 'TIERRA'
  | 'VIENTO'
  | 'DIVINO'
  | 'MÁGICA'
  | 'TRAMPA';

export interface CardRarityOption {
  code: string;
  name: string;
  shortName: string;
  colorClass: string;
  borderClass: string;
  isSpecial?: boolean;
}

export interface YugiohCard {
  id: number;
  setNumber: string; // ej: "001", "025"
  cardCode: string;  // ej: "LOB-E001", "RA01-ES025"
  name: string;      // Nombre oficial en español
  nameEn: string;    // Nombre internacional en inglés
  type: string;      // "Monstruo Normal", "Monstruo de Efecto", "Magia", "Trampa", "Monstruo de Fusión", etc.
  cardCategory: 'monster' | 'spell' | 'trap';
  attribute: CardAttribute;
  race: string;      // "Dragón", "Lanzador de Conjuros", "Guerrero", "Continua", "Juego Rápido", etc.
  level?: number;
  atk?: number;
  def?: number;
  desc: string;      // Texto oficial en español
  imageUrl: string;
  imageUrlSmall: string;
  availableRarities: CardRarityOption[];
}

export interface ExpansionSet {
  id: string;        // ej: "RA01-ES", "LOB-E", "MRD-E"
  code: string;      // ej: "RA01", "LOB"
  name: string;      // ej: "Colección de Rarezas del 25º Aniversario (RA01)"
  nameEn: string;
  releaseDate: string;
  region: 'Europa / TCG';
  description: string;
  bannerType: 'booster' | 'rarity_collection' | 'structure_deck' | 'tin';
  totalCards: number;
  cards: YugiohCard[];
}

export type CollectionRaritiesMap = Record<string, number>; // rarityCode -> count
export type UserCollectionData = Record<string, CollectionRaritiesMap>; // cardCode -> { rarityCode: count }
export type UserWishlistData = Record<string, boolean>; // cardCode -> true

export interface FilterState {
  searchQuery: string;
  ownership: 'all' | 'owned' | 'unowned' | 'desired';
  rarity: string;
  category: 'all' | 'monster' | 'spell' | 'trap';
  attribute: string;
  sortBy: 'number' | 'name' | 'atk' | 'copies';
  sortOrder: 'asc' | 'desc';
}
