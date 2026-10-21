import React from 'react';
import { YugiohCard } from '../types/yugioh';
import { CardItem } from './CardItem';
import { Inbox } from 'lucide-react';

interface CardGridProps {
  cards: YugiohCard[];
  isCardOwned: (cardCode: string) => boolean;
  isCardDesired: (cardCode: string) => boolean;
  highlightDesiredMode?: boolean;
  getTotalCopies: (cardCode: string) => number;
  collection: Record<string, Record<string, number>>;
  onOpenDetail: (card: YugiohCard) => void;
  onAddQuick: (card: YugiohCard) => void;
  onRemoveQuick: (card: YugiohCard) => void;
  onToggleDesired: (cardCode: string) => void;
  onResetFilters?: () => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  isCardOwned,
  isCardDesired,
  highlightDesiredMode = true,
  getTotalCopies,
  collection,
  onOpenDetail,
  onAddQuick,
  onRemoveQuick,
  onToggleDesired,
  onResetFilters,
}) => {
  if (cards.length === 0) {
    return (
      <div className="py-20 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">
          No se encontraron cartas con los filtros seleccionados
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Prueba a cambiar los términos de búsqueda o a desactivar los filtros de rareza, posesión o deseadas.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Restablecer todos los filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
      {cards.map((card) => (
        <CardItem
          key={card.cardCode}
          card={card}
          isOwned={isCardOwned(card.cardCode)}
          isDesired={isCardDesired(card.cardCode)}
          highlightDesiredMode={highlightDesiredMode}
          totalCopies={getTotalCopies(card.cardCode)}
          ownedRarities={collection[card.cardCode] || {}}
          onOpenDetail={onOpenDetail}
          onAddQuick={onAddQuick}
          onRemoveQuick={onRemoveQuick}
          onToggleDesired={onToggleDesired}
        />
      ))}
    </div>
  );
};
