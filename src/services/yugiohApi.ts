import { CardAttribute, CardRarityOption, YugiohCard } from '../types/yugioh';
import { OFFICIAL_RARITIES } from '../data/rarities';
import { INITIAL_EUROPEAN_SETS } from '../data/setsData';
import {
  getSpanishCardName,
  getSpanishCardDesc,
  CARD_TYPE_TRANSLATIONS,
  RACE_TRANSLATIONS,
  ATTRIBUTE_TRANSLATIONS,
  SPANISH_CARD_NAMES,
} from '../data/spanishTranslations';

interface RawApiCardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code?: string;
  set_price?: string;
}

interface RawApiCard {
  id: number;
  name: string;
  type: string;
  frameType?: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  card_sets?: RawApiCardSet[];
  card_images?: Array<{
    id: number;
    image_url: string;
    image_url_small: string;
  }>;
}

export interface ApiSetSummary {
  set_name: string;
  set_code: string;
  num_of_cards: number;
  tcg_date?: string;
}

// Mapea rarezas de la API a nuestras opciones de rarezas oficiales
function mapRarity(rarityName: string, rarityCode?: string): CardRarityOption {
  const code = (rarityCode || '').replace(/[^a-zA-Z]/g, '');
  const rName = (rarityName || '').toLowerCase();

  if (code === 'QCScR' || rName.includes('quarter century') || rName.includes('25th')) {
    return OFFICIAL_RARITIES.QCScR;
  }
  if (code === 'CR' || rName.includes('collector')) {
    return OFFICIAL_RARITIES.CR;
  }
  if (code === 'StR' || rName.includes('starlight')) {
    return OFFICIAL_RARITIES.StR;
  }
  if (code === 'UtR' || rName.includes('ultimate')) {
    return OFFICIAL_RARITIES.UtR;
  }
  if (code === 'PlScR' || rName.includes('platinum')) {
    return OFFICIAL_RARITIES.PlScR;
  }
  if (code === 'PScR' || rName.includes('prismatic')) {
    return OFFICIAL_RARITIES.PScR;
  }
  if (code === 'ScR' || rName.includes('secret')) {
    return OFFICIAL_RARITIES.ScR;
  }
  if (code === 'UR' || rName.includes('ultra')) {
    return OFFICIAL_RARITIES.UR;
  }
  if (code === 'SR' || rName.includes('super')) {
    return OFFICIAL_RARITIES.SR;
  }
  if (code === 'R' || rName.includes('rare')) {
    return OFFICIAL_RARITIES.R;
  }
  if (code === 'GR' || rName.includes('ghost')) {
    return OFFICIAL_RARITIES.GR;
  }
  if (code === 'GUR' || rName.includes('gold')) {
    return OFFICIAL_RARITIES.GUR;
  }

  return OFFICIAL_RARITIES.C;
}

function parseAttribute(attr?: string, type?: string): CardAttribute {
  if (type?.toLowerCase().includes('spell') || type?.toLowerCase().includes('mágica')) return 'MÁGICA';
  if (type?.toLowerCase().includes('trap') || type?.toLowerCase().includes('trampa')) return 'TRAMPA';

  const normalized = (attr || '').toUpperCase();
  return (ATTRIBUTE_TRANSLATIONS[normalized] as CardAttribute) || 'LUZ';
}

function getCardCategory(type: string): 'monster' | 'spell' | 'trap' {
  const t = (type || '').toLowerCase();
  if (t.includes('spell') || t.includes('magia') || t.includes('mágica')) return 'spell';
  if (t.includes('trap') || t.includes('trampa')) return 'trap';
  return 'monster';
}

export function transformApiCard(raw: RawApiCard, targetSetName?: string, indexHint: number = 1): YugiohCard {
  // Encontrar la entrada del set específico o la primera existente
  let matchedSet: RawApiCardSet | undefined;
  if (targetSetName && raw.card_sets) {
    // 1. Intentar encontrar coincidencia exacta con set_name
    matchedSet = raw.card_sets.find(
      (s) => s.set_name.toLowerCase() === targetSetName.toLowerCase()
    );
    // 2. Si no, buscar por prefijo de set_code
    if (!matchedSet) {
      matchedSet = raw.card_sets.find(
        (s) => s.set_code.toLowerCase().startsWith(targetSetName.toLowerCase())
      );
    }
  }

  if (!matchedSet) {
    matchedSet = raw.card_sets?.[0];
  }

  let setCode = matchedSet?.set_code || `EU-${String(raw.id).slice(-4)}`;

  // Convertir a formato europeo si es código EN (ej. RA01-EN001 -> RA01-ES001)
  if (setCode.includes('-EN')) {
    setCode = setCode.replace('-EN', '-ES');
  } else if (setCode.includes('-E') && !setCode.includes('-ES')) {
    // Mantener código europeo LOB-E001
  }

  // Extraer número de set (ej. LOB-E001 -> 001, o RA01-ES025 -> 025)
  const numberMatch = setCode.match(/\d+$/);
  const setNumber = numberMatch ? numberMatch[0] : String(indexHint).padStart(3, '0');

  // Mapear todas las rarezas disponibles en ese set
  const raritiesMap = new Map<string, CardRarityOption>();
  if (raw.card_sets && raw.card_sets.length > 0) {
    const relevantSets = targetSetName
      ? raw.card_sets.filter((s) => s.set_name.toLowerCase() === targetSetName.toLowerCase())
      : raw.card_sets;

    const setsToUse = relevantSets.length > 0 ? relevantSets : raw.card_sets;

    for (const s of setsToUse) {
      const mapped = mapRarity(s.set_rarity, s.set_rarity_code);
      raritiesMap.set(mapped.code, mapped);
    }
  }

  if (raritiesMap.size === 0) {
    raritiesMap.set('C', OFFICIAL_RARITIES.C);
  }

  const availableRarities = Array.from(raritiesMap.values());

  const imageUrl = raw.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${raw.id}.jpg`;
  const imageUrlSmall =
    raw.card_images?.[0]?.image_url_small || `https://images.ygoprodeck.com/images/cards_small/${raw.id}.jpg`;

  const spanishName = getSpanishCardName(raw.name);
  const spanishDesc = getSpanishCardDesc(raw.desc);
  const spanishType = CARD_TYPE_TRANSLATIONS[raw.type] || raw.type;
  const spanishRace = RACE_TRANSLATIONS[raw.race || ''] || raw.race || 'Normal';

  return {
    id: raw.id,
    setNumber,
    cardCode: setCode,
    name: spanishName,
    nameEn: raw.name,
    type: spanishType,
    cardCategory: getCardCategory(raw.type),
    attribute: parseAttribute(raw.attribute, raw.type),
    race: spanishRace,
    level: raw.level,
    atk: raw.atk,
    def: raw.def,
    desc: spanishDesc,
    imageUrl,
    imageUrlSmall,
    availableRarities,
  };
}

// Cache en memoria para cartas de sets ya descargados
const setsCardsCache = new Map<string, YugiohCard[]>();

// Mapeo de IDs locales a nombres oficiales en la API
const LOCAL_SET_NAMES_MAP: Record<string, string> = {
  'RA01-ES': '25th Anniversary Rarity Collection',
  'RA01': '25th Anniversary Rarity Collection',
  'LOB-E': 'Legend of Blue Eyes White Dragon',
  'LOB': 'Legend of Blue Eyes White Dragon',
  'MRD-E': 'Metal Raiders',
  'MRD': 'Metal Raiders',
  'AGOV-ES': 'Age of Overlord',
  'AGOV': 'Age of Overlord',
  'IOC-E': 'Invasion of Chaos',
  'IOC': 'Invasion of Chaos',
};

// 1. Obtener listado completo de TODOS los sets oficiales de Yu-Gi-Oh!
export async function fetchAllOfficialSets(): Promise<ApiSetSummary[]> {
  const CACHE_KEY = 'yugioh_all_official_sets_cache_v3';
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 50) {
        refreshSetsInBackground(CACHE_KEY);
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }

  try {
    const res = await fetch('https://db.ygoprodeck.com/api/v7/cardsets.php');
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data: ApiSetSummary[] = await res.json();
    if (Array.isArray(data)) {
      const sorted = data.sort((a, b) => {
        const dateA = a.tcg_date ? new Date(a.tcg_date).getTime() : 0;
        const dateB = b.tcg_date ? new Date(b.tcg_date).getTime() : 0;
        return dateB - dateA;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
      return sorted;
    }
  } catch (err) {
    console.warn('Error obteniendo listado de sets en vivo:', err);
  }

  return INITIAL_EUROPEAN_SETS.map((s) => ({
    set_name: s.nameEn,
    set_code: s.code,
    num_of_cards: s.totalCards,
    tcg_date: s.releaseDate,
  }));
}

async function refreshSetsInBackground(cacheKey: string) {
  try {
    const res = await fetch('https://db.ygoprodeck.com/api/v7/cardsets.php');
    if (res.ok) {
      const data: ApiSetSummary[] = await res.json();
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => {
          const dateA = a.tcg_date ? new Date(a.tcg_date).getTime() : 0;
          const dateB = b.tcg_date ? new Date(b.tcg_date).getTime() : 0;
          return dateB - dateA;
        });
        localStorage.setItem(cacheKey, JSON.stringify(sorted));
      }
    }
  } catch {
    // silencioso en background
  }
}

// 2. Obtener TODAS las cartas de un set específico en ESPAÑOL
export async function fetchCardsBySet(setNameOrId: string): Promise<YugiohCard[]> {
  // Traducir ID local a nombre oficial en inglés si es necesario
  const apiSetName = LOCAL_SET_NAMES_MAP[setNameOrId] || setNameOrId;

  // 1. Revisar cache en memoria
  if (setsCardsCache.has(apiSetName)) {
    return setsCardsCache.get(apiSetName)!;
  }

  try {
    const encoded = encodeURIComponent(apiSetName);
    // NOTA CRÍTICA: NO usar &language=es porque la API de YGOPRODeck lo rechaza con HTTP 400
    const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${encoded}`);
    if (!res.ok) {
      throw new Error(`Error API: ${res.status}`);
    }

    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      // Deduplicar cartas por raw.id (la API devuelve filas repetidas por cada rareza/variante del set)
      const uniqueCardsMap = new Map<number, RawApiCard>();
      for (const raw of json.data) {
        if (!uniqueCardsMap.has(raw.id)) {
          uniqueCardsMap.set(raw.id, raw);
        }
      }

      const cards: YugiohCard[] = Array.from(uniqueCardsMap.values()).map((raw, idx) =>
        transformApiCard(raw, apiSetName, idx + 1)
      );

      // Ordenar por número de set (#001, #002, etc.)
      cards.sort((a, b) => {
        const numA = parseInt(a.setNumber.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.setNumber.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      setsCardsCache.set(apiSetName, cards);
      return cards;
    }
  } catch (err) {
    console.warn(`No se pudieron cargar cartas en vivo para el set "${setNameOrId}":`, err);
  }

  // Fallback con set local si existe
  const localSet = INITIAL_EUROPEAN_SETS.find(
    (s) =>
      s.id.toLowerCase() === setNameOrId.toLowerCase() ||
      s.code.toLowerCase() === setNameOrId.toLowerCase() ||
      s.name.toLowerCase() === setNameOrId.toLowerCase() ||
      s.nameEn.toLowerCase() === apiSetName.toLowerCase()
  );

  return localSet ? localSet.cards : [];
}

// 3. Catálogo Maestro Paginado en Español (13.000+ cartas existentes)
export interface MasterCatalogResponse {
  cards: YugiohCard[];
  totalRows: number;
  totalPages: number;
}

export async function fetchMasterCatalog(
  page: number = 1,
  limit: number = 36,
  search?: string,
  type?: string,
  attribute?: string
): Promise<MasterCatalogResponse> {
  try {
    const offset = (page - 1) * limit;
    let url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?num=${limit}&offset=${offset}`;

    if (search && search.trim().length > 0) {
      const q = search.trim();
      // Check if search matches Spanish card name in dictionary
      let searchTerm = q;
      const lowerQ = q.toLowerCase();
      const match = Object.entries(SPANISH_CARD_NAMES).find(
        ([en, es]) => es.toLowerCase() === lowerQ || es.toLowerCase().includes(lowerQ)
      );
      if (match) {
        searchTerm = match[0];
      }
      url += `&fname=${encodeURIComponent(searchTerm)}`;
    }
    if (type && type !== 'all') {
      url += `&type=${encodeURIComponent(type)}`;
    }
    if (attribute && attribute !== 'all') {
      url += `&attribute=${encodeURIComponent(attribute)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      return { cards: [], totalRows: 0, totalPages: 0 };
    }

    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      const cards = json.data.map((raw: RawApiCard, idx: number) =>
        transformApiCard(raw, undefined, offset + idx + 1)
      );
      const totalRows = json.meta?.total_rows || cards.length;
      const totalPages = json.meta?.total_pages || Math.ceil(totalRows / limit);

      return { cards, totalRows, totalPages };
    }
  } catch (err) {
    console.warn('Error en catálogo maestro:', err);
  }

  return { cards: [], totalRows: 0, totalPages: 0 };
}

// 4. Búsqueda directa con traducción al español y soporte de ID/código
export async function searchCardsInSpanish(query: string): Promise<YugiohCard[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const qLower = cleanQuery.toLowerCase();
  const resultsMap = new Map<number, YugiohCard>();

  // Si es un código numérico (Passcode/ID de carta de 6 a 9 dígitos)
  if (/^\d{6,10}$/.test(cleanQuery)) {
    try {
      const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cleanQuery}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          for (const raw of json.data) {
            resultsMap.set(raw.id, transformApiCard(raw, undefined, 1));
          }
        }
      }
    } catch {
      // Ignorar error de red puntual
    }
  }

  // Buscar términos en inglés basados en traducciones al español
  const searchTerms = new Set<string>();
  searchTerms.add(cleanQuery);

  const matchedEnglishNames = Object.entries(SPANISH_CARD_NAMES)
    .filter(([en, es]) => es.toLowerCase().includes(qLower) || en.toLowerCase().includes(qLower))
    .slice(0, 4)
    .map(([en]) => en);

  for (const en of matchedEnglishNames) {
    searchTerms.add(en);
  }

  for (const term of searchTerms) {
    try {
      const encoded = encodeURIComponent(term);
      const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encoded}&num=30&offset=0`);
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          for (let idx = 0; idx < data.data.length; idx++) {
            const raw = data.data[idx];
            if (!resultsMap.has(raw.id)) {
              resultsMap.set(raw.id, transformApiCard(raw, undefined, idx + 1));
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error buscando cartas en API de Yu-Gi-Oh:', err);
    }
  }

  return Array.from(resultsMap.values());
}
