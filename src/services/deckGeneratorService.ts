import { UserCollectionData, YugiohCard, CardRarityOption } from '../types/yugioh';
import { META_DECK_RECIPES, MetaDeckRecipe, DeckSlotBlueprint } from '../data/metaDecksData';
import { OFFICIAL_RARITIES } from '../data/rarities';

// Jerarquía oficial de prestigio de rarezas (de mayor valor/brillo a básico)
export const RARITY_PRESTIGE_ORDER: string[] = [
  'QCScR', // Cuarto de Siglo Secreta 25th
  'StR',   // Starlight Rare
  'CR',    // Collector's Rare
  'UtR',   // Ultimate Rare
  'GR',    // Ghost Rare
  'PlScR', // Platinum Secret Rare
  'PScR',  // Prismatic Secret Rare
  'ScR',   // Secret Rare
  'UR',    // Ultra Rare
  'SR',    // Super Rare
  'R',     // Rare
  'C',     // Common
];

export interface BuiltDeckCard {
  slotId: string;
  nameEs: string;
  nameEn: string;
  passcode: number;
  category: 'monster' | 'spell' | 'trap';
  cardType?: string;
  level?: number;
  atk?: number;
  def?: number;
  attribute?: string;
  imageUrl: string;
  isOwned: boolean;
  assignedRarity?: CardRarityOption;
  isHighestFoil?: boolean;
  isSubstitute?: boolean;
  substituteReason?: string;
  role: string;
  cardCode?: string;
}

export interface MissingCardSummary {
  nameEs: string;
  nameEn: string;
  passcode: number;
  missingCount: number;
  role: string;
  category: 'monster' | 'spell' | 'trap';
  imageUrl: string;
  suggestedSet?: string;
}

export interface GeneratedDeckResult {
  recipe: MetaDeckRecipe;
  mainDeck: BuiltDeckCard[];
  extraDeck: BuiltDeckCard[];
  sideDeck: BuiltDeckCard[];
  totalMain: number;
  totalExtra: number;
  totalSide: number;
  ownedMainCount: number;
  ownedExtraCount: number;
  ownedSideCount: number;
  matchPercentage: number;
  missingCards: MissingCardSummary[];
  rarityBreakdown: Record<string, number>;
  ratios: {
    monsters: number;
    spells: number;
    traps: number;
    handtraps: number;
    starters: number;
  };
}

export interface RecipeAffinityRanking {
  recipe: MetaDeckRecipe;
  matchPercentage: number;
  ownedMainCards: number;
  totalMainCards: number;
  ownedExtraCards: number;
  totalExtraCards: number;
}

/**
 * Normaliza nombres de cartas para comparación insensible a mayúsculas, tildes y signos
 */
export function normalizeCardName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Encuentra todas las copias y rarezas que el usuario posee de una carta por nombre o passcode
 */
export function findUserCopiesForCard(
  targetNameEs: string,
  targetNameEn: string,
  targetPasscode: number,
  collection: UserCollectionData,
  allCards: YugiohCard[]
): { rarityCode: string; count: number; card: YugiohCard }[] {
  const normEs = normalizeCardName(targetNameEs);
  const normEn = normalizeCardName(targetNameEn);
  const results: { rarityCode: string; count: number; card: YugiohCard }[] = [];

  // 1. Buscar en el catálogo de cartas cargadas
  const matchingCards = allCards.filter((card) => {
    if (card.id === targetPasscode) return true;
    const cardEs = normalizeCardName(card.name);
    const cardEn = normalizeCardName(card.nameEn || '');
    return cardEs === normEs || cardEn === normEn || cardEs.includes(normEs) || normEs.includes(cardEs);
  });

  for (const card of matchingCards) {
    const cardRarities = collection[card.cardCode];
    if (cardRarities) {
      for (const [rarityCode, count] of Object.entries(cardRarities)) {
        if (count > 0) {
          results.push({ rarityCode, count, card });
        }
      }
    }
  }

  // 2. Si no encontró por coincidencia exacta de catálogo, buscar en toda la colección de usuario si alguna clave coincide
  if (results.length === 0) {
    for (const [cardCode, rarities] of Object.entries(collection)) {
      const cardObj = allCards.find((c) => c.cardCode === cardCode);
      if (cardObj) {
        const cardEs = normalizeCardName(cardObj.name);
        const cardEn = normalizeCardName(cardObj.nameEn || '');
        if (cardEs === normEs || cardEn === normEn) {
          for (const [rarityCode, count] of Object.entries(rarities)) {
            if (count > 0) {
              results.push({ rarityCode, count, card: cardObj });
            }
          }
        }
      }
    }
  }

  return results;
}

/**
 * Selecciona la rareza de mayor prestigio entre las copias que posee el usuario
 */
export function getAvailableRarityByPrestige(
  availableRaritiesMap: Record<string, number>
): CardRarityOption | undefined {
  for (const rarityCode of RARITY_PRESTIGE_ORDER) {
    if (availableRaritiesMap[rarityCode] && availableRaritiesMap[rarityCode] > 0) {
      return OFFICIAL_RARITIES[rarityCode] || {
        code: rarityCode,
        name: rarityCode,
        shortName: rarityCode,
        colorClass: 'text-amber-300 bg-amber-950/70',
        borderClass: 'border-amber-500',
      };
    }
  }

  // Si tiene alguna otra rareza no listada en el orden principal
  for (const [rarityCode, count] of Object.entries(availableRaritiesMap)) {
    if (count > 0) {
      return OFFICIAL_RARITIES[rarityCode] || {
        code: rarityCode,
        name: rarityCode,
        shortName: rarityCode,
        colorClass: 'text-slate-300 bg-slate-800',
        borderClass: 'border-slate-700',
      };
    }
  }

  return undefined;
}

/**
 * Evalúa la afinidad de la colección con todos los arquetipos meta registrados
 */
export function evaluateAllRecipesAffinity(
  collection: UserCollectionData,
  allCards: YugiohCard[]
): RecipeAffinityRanking[] {
  return META_DECK_RECIPES.map((recipe) => {
    let ownedMain = 0;
    let totalMain = 0;
    let ownedExtra = 0;
    let totalExtra = 0;

    for (const slot of recipe.mainDeck) {
      totalMain += slot.idealCopies;
      const copies = findUserCopiesForCard(slot.nameEs, slot.nameEn, slot.passcode, collection, allCards);
      const userTotal = copies.reduce((sum, c) => sum + c.count, 0);
      ownedMain += Math.min(slot.idealCopies, userTotal);
    }

    for (const slot of recipe.extraDeck) {
      totalExtra += slot.idealCopies;
      const copies = findUserCopiesForCard(slot.nameEs, slot.nameEn, slot.passcode, collection, allCards);
      const userTotal = copies.reduce((sum, c) => sum + c.count, 0);
      ownedExtra += Math.min(slot.idealCopies, userTotal);
    }

    const totalDeckCards = totalMain + (totalExtra > 0 ? totalExtra : 0);
    const totalOwned = ownedMain + (totalExtra > 0 ? ownedExtra : 0);
    const matchPercentage = totalDeckCards > 0 ? Math.round((totalOwned / totalDeckCards) * 100) : 0;

    return {
      recipe,
      matchPercentage,
      ownedMainCards: ownedMain,
      totalMainCards: totalMain,
      ownedExtraCards: ownedExtra,
      totalExtraCards: totalExtra,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Construye una baraja completa optimizada para una receta elegida,
 * priorizando rarezas altas y gestionando cartas poseídas y sustitutos
 */
export function generateOptimizedDeck(
  recipe: MetaDeckRecipe,
  collection: UserCollectionData,
  allCards: YugiohCard[],
  options: {
    prioritizeHighFoil?: boolean;
    useSubstitutes?: boolean;
  } = {}
): GeneratedDeckResult {
  const { prioritizeHighFoil = true, useSubstitutes = true } = options;

  const mainDeck: BuiltDeckCard[] = [];
  const extraDeck: BuiltDeckCard[] = [];
  const sideDeck: BuiltDeckCard[] = [];
  const missingCardsMap: Record<number, MissingCardSummary> = {};
  const rarityBreakdown: Record<string, number> = {};

  // Función interna para procesar una sección de cartas
  const processSlots = (slots: DeckSlotBlueprint[], targetList: BuiltDeckCard[]) => {
    for (const slot of slots) {
      const userCopies = findUserCopiesForCard(slot.nameEs, slot.nameEn, slot.passcode, collection, allCards);
      
      // Creamos un mapa de conteo mutable por rareza
      const availableRaritiesCount: Record<string, number> = {};
      let totalOwnedForSlot = 0;
      let matchedCard: YugiohCard | undefined;

      for (const item of userCopies) {
        availableRaritiesCount[item.rarityCode] = (availableRaritiesCount[item.rarityCode] || 0) + item.count;
        totalOwnedForSlot += item.count;
        if (!matchedCard) matchedCard = item.card;
      }

      // Añadimos tantas copias como idealCopies dicte
      for (let i = 0; i < slot.idealCopies; i++) {
        let isOwned = false;
        let assignedRarity: CardRarityOption | undefined;
        let isSubstitute = false;
        let substituteReason: string | undefined;

        if (totalOwnedForSlot > 0) {
          isOwned = true;
          totalOwnedForSlot--;

          if (prioritizeHighFoil) {
            assignedRarity = getAvailableRarityByPrestige(availableRaritiesCount);
            if (assignedRarity && availableRaritiesCount[assignedRarity.code]) {
              availableRaritiesCount[assignedRarity.code]--;
            }
          }
        } else if (useSubstitutes && slot.substitutes && slot.substitutes.length > 0) {
          // Intentar encontrar un sustituto que el usuario posea
          for (const sub of slot.substitutes) {
            const subCopies = findUserCopiesForCard(sub.nameEs, sub.nameEn, sub.passcode, collection, allCards);
            const subTotal = subCopies.reduce((sum, c) => sum + c.count, 0);
            if (subTotal > 0) {
              isOwned = true;
              isSubstitute = true;
              substituteReason = sub.reason;
              assignedRarity = getAvailableRarityByPrestige({ C: 1 });
              break;
            }
          }
        }

        // Si no está poseída ni sustituida, registrar en missingCards
        if (!isOwned) {
          if (!missingCardsMap[slot.passcode]) {
            missingCardsMap[slot.passcode] = {
              nameEs: slot.nameEs,
              nameEn: slot.nameEn,
              passcode: slot.passcode,
              missingCount: 0,
              role: slot.role,
              category: slot.category,
              imageUrl: slot.imageUrl || (matchedCard ? matchedCard.imageUrl : `https://images.ygoprodeck.com/images/cards/${slot.passcode}.jpg`),
            };
          }
          missingCardsMap[slot.passcode].missingCount++;
        }

        if (assignedRarity) {
          rarityBreakdown[assignedRarity.code] = (rarityBreakdown[assignedRarity.code] || 0) + 1;
        }

        const cardImg = slot.imageUrl || (matchedCard ? matchedCard.imageUrl : `https://images.ygoprodeck.com/images/cards/${slot.passcode}.jpg`);

        targetList.push({
          slotId: `${slot.passcode}-${i}`,
          nameEs: slot.nameEs,
          nameEn: slot.nameEn,
          passcode: slot.passcode,
          category: slot.category,
          cardType: slot.cardType || matchedCard?.type,
          level: slot.level || matchedCard?.level,
          atk: slot.atk || matchedCard?.atk,
          def: slot.def || matchedCard?.def,
          attribute: slot.attribute || matchedCard?.attribute,
          imageUrl: cardImg,
          isOwned,
          assignedRarity,
          isHighestFoil: assignedRarity ? assignedRarity.isSpecial : false,
          isSubstitute,
          substituteReason,
          role: slot.role,
          cardCode: matchedCard?.cardCode,
        });
      }
    }
  };

  processSlots(recipe.mainDeck, mainDeck);
  processSlots(recipe.extraDeck, extraDeck);
  processSlots(recipe.sideDeck, sideDeck);

  const ownedMainCount = mainDeck.filter((c) => c.isOwned).length;
  const ownedExtraCount = extraDeck.filter((c) => c.isOwned).length;
  const ownedSideCount = sideDeck.filter((c) => c.isOwned).length;

  const totalCardsConsidered = mainDeck.length + extraDeck.length;
  const totalOwnedConsidered = ownedMainCount + ownedExtraCount;
  const matchPercentage = totalCardsConsidered > 0 ? Math.round((totalOwnedConsidered / totalCardsConsidered) * 100) : 0;

  // Ratios del Main Deck
  const ratios = {
    monsters: mainDeck.filter((c) => c.category === 'monster').length,
    spells: mainDeck.filter((c) => c.category === 'spell').length,
    traps: mainDeck.filter((c) => c.category === 'trap').length,
    handtraps: mainDeck.filter((c) => c.role === 'staple_handtrap').length,
    starters: mainDeck.filter((c) => c.role === 'starter').length,
  };

  return {
    recipe,
    mainDeck,
    extraDeck,
    sideDeck,
    totalMain: mainDeck.length,
    totalExtra: extraDeck.length,
    totalSide: sideDeck.length,
    ownedMainCount,
    ownedExtraCount,
    ownedSideCount,
    matchPercentage,
    missingCards: Object.values(missingCardsMap),
    rarityBreakdown,
    ratios,
  };
}

/**
 * Genera el archivo .YDK compatible con EDOPro / Omega / YGOPRODeck / Master Duel
 */
export function generateYdkContent(deck: GeneratedDeckResult): string {
  let content = '#created by Yu-Gi-Oh! TCG Europa Deck Generator\n#main\n';

  for (const card of deck.mainDeck) {
    content += `${card.passcode}\n`;
  }

  content += '#extra\n';
  for (const card of deck.extraDeck) {
    content += `${card.passcode}\n`;
  }

  content += '!side\n';
  for (const card of deck.sideDeck) {
    content += `${card.passcode}\n`;
  }

  return content;
}

/**
 * Descarga el archivo .YDK en el navegador del usuario
 */
export function downloadYdkFile(deckName: string, ydkContent: string): void {
  const sanitizedName = deckName.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
  const blob = new Blob([ydkContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizedName}.ydk`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copia el texto formateado de la baraja al portapapeles
 */
export async function copyDeckToClipboard(deck: GeneratedDeckResult): Promise<boolean> {
  let text = `=== ${deck.recipe.name} (${deck.totalMain} Cartas) ===\n`;
  text += `Afinidad con Colección: ${deck.matchPercentage}%\n\n`;

  text += `--- MAIN DECK (${deck.totalMain}) ---\n`;
  const mainCounts: Record<string, number> = {};
  for (const card of deck.mainDeck) {
    mainCounts[card.nameEs] = (mainCounts[card.nameEs] || 0) + 1;
  }
  for (const [name, count] of Object.entries(mainCounts)) {
    text += `${count}x ${name}\n`;
  }

  if (deck.totalExtra > 0) {
    text += `\n--- EXTRA DECK (${deck.totalExtra}) ---\n`;
    const extraCounts: Record<string, number> = {};
    for (const card of deck.extraDeck) {
      extraCounts[card.nameEs] = (extraCounts[card.nameEs] || 0) + 1;
    }
    for (const [name, count] of Object.entries(extraCounts)) {
      text += `${count}x ${name}\n`;
    }
  }

  if (deck.totalSide > 0) {
    text += `\n--- SIDE DECK (${deck.totalSide}) ---\n`;
    const sideCounts: Record<string, number> = {};
    for (const card of deck.sideDeck) {
      sideCounts[card.nameEs] = (sideCounts[card.nameEs] || 0) + 1;
    }
    for (const [name, count] of Object.entries(sideCounts)) {
      text += `${count}x ${name}\n`;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
