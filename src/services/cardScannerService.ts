import { YugiohCard } from '../types/yugioh';
import { SPANISH_CARD_NAMES } from '../data/spanishTranslations';
import { searchCardsInSpanish } from './yugiohApi';

export interface MatchResult {
  card: YugiohCard;
  confidence: number;
  matchedBy: 'passcode' | 'setCode' | 'name' | 'api';
  matchedQuery: string;
}

// Normalizar texto para comparación sin tildes ni caracteres especiales
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cálculo de similitud de Dice / Jaccard por n-gramas para coincidencia robusta
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return minLen / maxLen;
  }

  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.slice(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;

  b1.forEach((bg) => {
    if (b2.has(bg)) intersection++;
  });

  return (2.0 * intersection) / (b1.size + b2.size);
}

/**
 * Correlaciona el texto extraído por OCR con la base de datos de cartas
 */
export async function correlateOcrText(
  rawOcrText: string,
  availableCards: YugiohCard[]
): Promise<MatchResult | null> {
  if (!rawOcrText || rawOcrText.trim().length < 2) return null;

  const lines = rawOcrText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  // 1. Intento por Passcode Konami (8 dígitos numéricos, ej: 89631139)
  const passcodeMatch = rawOcrText.match(/\b(\d{8})\b/);
  if (passcodeMatch) {
    const passcode = parseInt(passcodeMatch[1], 10);
    const cardByPasscode = availableCards.find((c) => c.id === passcode);
    if (cardByPasscode) {
      return {
        card: cardByPasscode,
        confidence: 0.98,
        matchedBy: 'passcode',
        matchedQuery: passcodeMatch[1],
      };
    }
  }

  // 2. Intento por Código de Set Europeo (ej: LOB-E001, RA01-ES001, MRD-E005)
  const setCodeRegex = /\b([A-Z0-9]{3,4}-(?:E|EN|ES|SP|IT|FR|DE)\d{3,4})\b/i;
  const setCodeMatch = rawOcrText.match(setCodeRegex);
  if (setCodeMatch) {
    const rawCode = setCodeMatch[1].toUpperCase();
    // Comparar normalizando código
    const cardByCode = availableCards.find(
      (c) =>
        c.cardCode.toUpperCase() === rawCode ||
        c.cardCode.replace('-ES', '-EN').toUpperCase() === rawCode ||
        c.cardCode.replace('-E', '-EN').toUpperCase() === rawCode
    );
    if (cardByCode) {
      return {
        card: cardByCode,
        confidence: 0.95,
        matchedBy: 'setCode',
        matchedQuery: rawCode,
      };
    }
  }

  // 3. Intento por Título de la Carta (Líneas superiores del texto escaneado)
  // Las primeras líneas suelen contener el nombre de la carta
  let bestMatch: { card: YugiohCard; score: number; query: string } | null = null;

  // Analizar cada línea del texto OCR
  for (const line of lines.slice(0, 5)) {
    const cleanLine = normalizeText(line);
    if (cleanLine.length < 3) continue;

    for (const card of availableCards) {
      const scoreEs = calculateSimilarity(card.name, cleanLine);
      const scoreEn = calculateSimilarity(card.nameEn, cleanLine);
      const maxScore = Math.max(scoreEs, scoreEn);

      if (maxScore > (bestMatch?.score || 0.6)) {
        bestMatch = { card, score: maxScore, query: line };
      }
    }
  }

  if (bestMatch && bestMatch.score >= 0.65) {
    return {
      card: bestMatch.card,
      confidence: Math.round(bestMatch.score * 100) / 100,
      matchedBy: 'name',
      matchedQuery: bestMatch.query,
    };
  }

  // 4. Si no se encontró en las cartas cargadas en memoria, buscar en la API en vivo
  for (const line of lines.slice(0, 3)) {
    const clean = line.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
    if (clean.length >= 4) {
      try {
        const apiCards = await searchCardsInSpanish(clean);
        if (apiCards && apiCards.length > 0) {
          const topCard = apiCards[0];
          return {
            card: topCard,
            confidence: 0.85,
            matchedBy: 'api',
            matchedQuery: clean,
          };
        }
      } catch {
        // Continuar si falla la red
      }
    }
  }

  return null;
}
