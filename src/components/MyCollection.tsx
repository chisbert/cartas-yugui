import React, { useMemo, useState } from 'react';
import { ExpansionSet, YugiohCard } from '../types/yugioh';
import { CardGrid } from './CardGrid';
import { BookmarkCheck, Search, Sparkles, FolderOpen } from 'lucide-react';

interface MyCollectionProps {
  sets: ExpansionSet[];
  collection: Record<string, Record<string, number>>;
  isCardOwned: (cardCode: string) => boolean;
  isCardDesired: (cardCode: string) => boolean;
  highlightDesiredMode: boolean;
  getTotalCopies: (cardCode: string) => number;
  onOpenDetail: (card: YugiohCard) => void;
  onAddQuick: (card: YugiohCard) => void;
  onRemoveQuick: (card: YugiohCard) => void;
  onToggleDesired: (cardCode: string) => void;
  onGoToSets: () => void;
}

export const MyCollection: React.FC<MyCollectionProps> = ({
  sets,
  collection,
  isCardOwned,
  isCardDesired,
  highlightDesiredMode,
  getTotalCopies,
  onOpenDetail,
  onAddQuick,
  onRemoveQuick,
  onToggleDesired,
  onGoToSets,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Obtener todas las cartas registradas de los sets que estén en posesión
  const ownedCards = useMemo(() => {
    const allCardsMap = new Map<string, YugiohCard>();
    for (const set of sets) {
      for (const card of set.cards) {
        if (!allCardsMap.has(card.cardCode) && isCardOwned(card.cardCode)) {
          allCardsMap.set(card.cardCode, card);
        }
      }
    }

    return Array.from(allCardsMap.values());
  }, [sets, isCardOwned]);

  const filteredOwnedCards = useMemo(() => {
    return ownedCards.filter((card) => {
      // Búsqueda
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesCode = card.cardCode.toLowerCase().includes(q);
        const matchesType = card.type.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesType) return false;
      }

      // Filtro de rareza
      if (selectedRarity !== 'all') {
        const count = collection[card.cardCode]?.[selectedRarity] || 0;
        if (count === 0) return false;
      }

      return true;
    });
  }, [ownedCards, search, selectedRarity, collection]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>Carpeta Personal de Duelos</span>
          </div>
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-slate-100">
            Mi Álbum de Cartas ({ownedCards.length} distintas)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Todas tus cartas obtenidas en Europa con sus respectivas rarezas y copias registradas.
          </p>
        </div>

        {/* Search inside collection */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en mi álbum..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {ownedCards.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            Aún no has añadido ninguna carta a tu colección
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Explora las expansiones europeas como la Colección de Rarezas del 25º Aniversario o la Leyenda del Dragón Blanco de Ojos Azules y pulsa &ldquo;+ Añadir&rdquo; en tus cartas.
          </p>
          <button
            onClick={onGoToSets}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explorar Expansiones Europeas</span>
          </button>
        </div>
      ) : (
        <CardGrid
          cards={filteredOwnedCards}
          isCardOwned={isCardOwned}
          isCardDesired={isCardDesired}
          highlightDesiredMode={highlightDesiredMode}
          getTotalCopies={getTotalCopies}
          collection={collection}
          onOpenDetail={onOpenDetail}
          onAddQuick={onAddQuick}
          onRemoveQuick={onRemoveQuick}
          onToggleDesired={onToggleDesired}
          onResetFilters={() => setSearch('')}
        />
      )}
    </div>
  );
};
