import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserCollectionData, UserWishlistData, YugiohCard } from '../types/yugioh';

const COLLECTION_STORAGE_KEY = 'yugioh_tcg_eu_collection_v2';
const WISHLIST_STORAGE_KEY = 'yugioh_tcg_eu_wishlist_v2';

export function useCollection() {
  const [collection, setCollection] = useState<UserCollectionData>(() => {
    try {
      const saved = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error cargando colección desde localStorage', e);
    }
    return {};
  });

  const [wishlist, setWishlist] = useState<UserWishlistData>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error cargando wishlist desde localStorage', e);
    }
    return {};
  });

  // Persistir colección en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection));
    } catch (e) {
      console.error('Error guardando colección en localStorage', e);
    }
  }, [collection]);

  // Persistir wishlist en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error guardando wishlist en localStorage', e);
    }
  }, [wishlist]);

  const isCardOwned = useCallback((cardCode: string): boolean => {
    const cardData = collection[cardCode];
    if (!cardData) return false;
    return Object.values(cardData).some((count) => count > 0);
  }, [collection]);

  const isCardDesired = useCallback((cardCode: string): boolean => {
    return Boolean(wishlist[cardCode]);
  }, [wishlist]);

  const toggleDesired = useCallback((cardCode: string) => {
    setWishlist((prev) => {
      const next = { ...prev };
      if (next[cardCode]) {
        delete next[cardCode];
      } else {
        next[cardCode] = true;
      }
      return next;
    });
  }, []);

  const setDesired = useCallback((cardCode: string, isDesired: boolean) => {
    setWishlist((prev) => {
      const next = { ...prev };
      if (isDesired) {
        next[cardCode] = true;
      } else {
        delete next[cardCode];
      }
      return next;
    });
  }, []);

  const getTotalCopies = useCallback((cardCode: string): number => {
    const cardData = collection[cardCode];
    if (!cardData) return 0;
    return Object.values(cardData).reduce((sum, count) => sum + (count || 0), 0);
  }, [collection]);

  const getRarityCopies = useCallback((cardCode: string, rarityCode: string): number => {
    return collection[cardCode]?.[rarityCode] || 0;
  }, [collection]);

  const setRarityCopies = useCallback((cardCode: string, rarityCode: string, count: number) => {
    setCollection((prev) => {
      const cardMap = { ...(prev[cardCode] || {}) };
      const newCount = Math.max(0, count);

      if (newCount === 0) {
        delete cardMap[rarityCode];
      } else {
        cardMap[rarityCode] = newCount;
      }

      if (Object.keys(cardMap).length === 0) {
        const next = { ...prev };
        delete next[cardCode];
        return next;
      }

      return {
        ...prev,
        [cardCode]: cardMap,
      };
    });
  }, []);

  const addQuickCopy = useCallback((card: YugiohCard, preferredRarityCode?: string) => {
    setCollection((prev) => {
      const cardMap = { ...(prev[card.cardCode] || {}) };
      const targetRarity = preferredRarityCode || card.availableRarities[0]?.code || 'C';
      const current = cardMap[targetRarity] || 0;
      cardMap[targetRarity] = current + 1;

      return {
        ...prev,
        [card.cardCode]: cardMap,
      };
    });
  }, []);

  const removeQuickCopy = useCallback((card: YugiohCard) => {
    setCollection((prev) => {
      const cardMap = { ...(prev[card.cardCode] || {}) };
      const keys = Object.keys(cardMap);
      if (keys.length === 0) return prev;

      const targetKey = keys.find((k) => (cardMap[k] || 0) > 0);
      if (!targetKey) return prev;

      const current = cardMap[targetKey];
      if (current <= 1) {
        delete cardMap[targetKey];
      } else {
        cardMap[targetKey] = current - 1;
      }

      if (Object.keys(cardMap).length === 0) {
        const next = { ...prev };
        delete next[card.cardCode];
        return next;
      }

      return {
        ...prev,
        [card.cardCode]: cardMap,
      };
    });
  }, []);

  const toggleOwned = useCallback((card: YugiohCard) => {
    const owned = isCardOwned(card.cardCode);
    if (owned) {
      setCollection((prev) => {
        const next = { ...prev };
        delete next[card.cardCode];
        return next;
      });
    } else {
      addQuickCopy(card);
    }
  }, [isCardOwned, addQuickCopy]);

  const getSetStats = useCallback((cards: YugiohCard[]) => {
    const total = cards.length;
    let owned = 0;
    let totalCopies = 0;
    let desiredInSet = 0;

    for (const card of cards) {
      const copies = getTotalCopies(card.cardCode);
      if (copies > 0) {
        owned++;
        totalCopies += copies;
      }
      if (isCardDesired(card.cardCode)) {
        desiredInSet++;
      }
    }

    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;

    return {
      total,
      owned,
      percentage,
      totalCopies,
      desiredInSet,
    };
  }, [getTotalCopies, isCardDesired]);

  // Exportar a archivo JSON
  const exportCollectionJSON = useCallback(() => {
    const exportPayload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      collection,
      wishlist,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `yugioh-coleccion-deseadas-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [collection, wishlist]);

  // Importar desde archivo JSON con compatibilidad
  const importCollectionJSON = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        if ('collection' in parsed && typeof parsed.collection === 'object') {
          setCollection(parsed.collection);
          if (parsed.wishlist && typeof parsed.wishlist === 'object') {
            setWishlist(parsed.wishlist);
          }
          return true;
        } else {
          // Formato v1 directo
          setCollection(parsed);
          return true;
        }
      }
    } catch (e) {
      console.error('Error importando colección JSON:', e);
    }
    return false;
  }, []);

  const clearCollection = useCallback(() => {
    setCollection({});
    setWishlist({});
    localStorage.removeItem(COLLECTION_STORAGE_KEY);
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  }, []);

  // Estadísticas globales
  const globalStats = useMemo(() => {
    const cardCodes = Object.keys(collection);
    let totalCardsCount = 0;
    const rarityBreakdown: Record<string, number> = {};

    for (const code of cardCodes) {
      const rarities = collection[code] || {};
      for (const [rCode, count] of Object.entries(rarities)) {
        totalCardsCount += count;
        rarityBreakdown[rCode] = (rarityBreakdown[rCode] || 0) + count;
      }
    }

    const desiredCount = Object.keys(wishlist).length;

    return {
      uniqueOwned: cardCodes.length,
      totalCopiesCount: totalCardsCount,
      rarityBreakdown,
      desiredCount,
    };
  }, [collection, wishlist]);

  return {
    collection,
    wishlist,
    isCardOwned,
    isCardDesired,
    toggleDesired,
    setDesired,
    getTotalCopies,
    getRarityCopies,
    setRarityCopies,
    addQuickCopy,
    removeQuickCopy,
    toggleOwned,
    getSetStats,
    exportCollectionJSON,
    importCollectionJSON,
    clearCollection,
    globalStats,
  };
}
