import React, { useMemo, useState } from 'react';
import { ExpansionSet, YugiohCard } from '../types/yugioh';
import { CardGrid } from './CardGrid';
import { Star, Search, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

interface DesiredCardsViewProps {
  sets: ExpansionSet[];
  collection: Record<string, Record<string, number>>;
  isCardOwned: (cardCode: string) => boolean;
  isCardDesired: (cardCode: string) => boolean;
  highlightDesiredMode: boolean;
  setHighlightDesiredMode: React.Dispatch<React.SetStateAction<boolean>>;
  getTotalCopies: (cardCode: string) => number;
  onOpenDetail: (card: YugiohCard) => void;
  onAddQuick: (card: YugiohCard) => void;
  onRemoveQuick: (card: YugiohCard) => void;
  onToggleDesired: (cardCode: string) => void;
  onGoToSets: () => void;
}

export const DesiredCardsView: React.FC<DesiredCardsViewProps> = ({
  sets,
  collection,
  isCardOwned,
  isCardDesired,
  highlightDesiredMode,
  setHighlightDesiredMode,
  getTotalCopies,
  onOpenDetail,
  onAddQuick,
  onRemoveQuick,
  onToggleDesired,
  onGoToSets,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'need' | 'have'>('all');

  // Recopilar todas las cartas marcadas como deseadas
  const desiredCards = useMemo(() => {
    const map = new Map<string, YugiohCard>();
    for (const set of sets) {
      for (const card of set.cards) {
        if (isCardDesired(card.cardCode) && !map.has(card.cardCode)) {
          map.set(card.cardCode, card);
        }
      }
    }
    return Array.from(map.values());
  }, [sets, isCardDesired]);

  // Métricas
  const neededCount = useMemo(() => {
    return desiredCards.filter((c) => !isCardOwned(c.cardCode)).length;
  }, [desiredCards, isCardOwned]);

  const alreadyOwnedCount = desiredCards.length - neededCount;

  // Filtrado de cartas deseadas
  const filteredCards = useMemo(() => {
    return desiredCards.filter((card) => {
      const owned = isCardOwned(card.cardCode);
      if (statusFilter === 'need' && owned) return false;
      if (statusFilter === 'have' && !owned) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = card.name.toLowerCase().includes(q);
        const matchCode = card.cardCode.toLowerCase().includes(q);
        const matchType = card.type.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchType) return false;
      }

      return true;
    });
  }, [desiredCards, statusFilter, search, isCardOwned]);

  return (
    <div className="space-y-6">
      {/* Wishlist Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Prioridades de Intercambio & Compra</span>
          </div>

          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Lista de Cartas Deseadas ({desiredCards.length})
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            Cartas destacadas con el borde dorado pulsante. Consulta rápidamente las cartas que necesitas adquirir en torneos, tiendas o intercambios con otros duelistas.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-300">
              Faltan por conseguir: <strong className="text-amber-400 font-mono-numbers text-sm">{neededCount}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">
              Ya en posesión: <strong className="text-emerald-400 font-mono-numbers">{alreadyOwnedCount}</strong>
            </span>
          </div>
        </div>

        {/* Highlight Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={() => setHighlightDesiredMode((prev) => !prev)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              highlightDesiredMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Borde Pulsante: {highlightDesiredMode ? 'ENCENDIDO' : 'APAGADO'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar for Desired Cards */}
      {desiredCards.length > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-slate-400 font-medium shrink-0">Filtrar:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
                  statusFilter === 'all' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas ({desiredCards.length})
              </button>
              <button
                onClick={() => setStatusFilter('need')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
                  statusFilter === 'need' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Faltantes ({neededCount})
              </button>
              <button
                onClick={() => setStatusFilter('have')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
                  statusFilter === 'have' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Poseídas ({alreadyOwnedCount})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en deseadas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Grid or Empty State */}
      {desiredCards.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            Aún no has marcado ninguna carta como Deseada
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Pulsa el icono de <strong>Estrella (★)</strong> en cualquier carta de las expansiones europeas o en el modal de detalle para añadirla a tu lista de prioridades de compra o cambio.
          </p>
          <button
            onClick={onGoToSets}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span>Explorar Expansiones Europeas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <CardGrid
          cards={filteredCards}
          isCardOwned={isCardOwned}
          isCardDesired={isCardDesired}
          highlightDesiredMode={highlightDesiredMode}
          getTotalCopies={getTotalCopies}
          collection={collection}
          onOpenDetail={onOpenDetail}
          onAddQuick={onAddQuick}
          onRemoveQuick={onRemoveQuick}
          onToggleDesired={onToggleDesired}
          onResetFilters={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      )}
    </div>
  );
};
