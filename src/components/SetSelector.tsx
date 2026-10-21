import React, { useState } from 'react';
import { ExpansionSet, YugiohCard } from '../types/yugioh';
import { ApiSetSummary } from '../services/yugiohApi';
import { Sparkles, Shield, Flame, BookOpen, Layers, Search, ChevronDown, Check, Loader2, RefreshCw } from 'lucide-react';

interface SetSelectorProps {
  sets: ExpansionSet[];
  selectedSetId: string;
  onSelectSet: (setId: string, customSetName?: string) => void;
  getSetStats: (cards: YugiohCard[]) => { total: number; owned: number; percentage: number; totalCopies: number };
  allOfficialSets: ApiSetSummary[];
  isLoadingSet?: boolean;
  onRefreshSets?: () => void;
}

export const SetSelector: React.FC<SetSelectorProps> = ({
  sets,
  selectedSetId,
  onSelectSet,
  getSetStats,
  allOfficialSets,
  isLoadingSet = false,
  onRefreshSets,
}) => {
  const [isOpenAllSetsModal, setIsOpenAllSetsModal] = useState(false);
  const [setFilterQuery, setSetFilterQuery] = useState('');

  const getBannerIcon = (type?: string) => {
    switch (type) {
      case 'rarity_collection':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'structure_deck':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'tin':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      default:
        return <Flame className="w-4 h-4 text-rose-400" />;
    }
  };

  const filteredAllSets = allOfficialSets.filter((s) => {
    if (!setFilterQuery.trim()) return true;
    const q = setFilterQuery.toLowerCase();
    return s.set_name.toLowerCase().includes(q) || s.set_code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-3">
      {/* Header with Set Count & "Ver Todos los Sets" trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Expansiones Europeas Disponibles
          </h2>
          <span className="text-xs text-amber-400/90 font-mono-numbers px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/40">
            {allOfficialSets.length > 0 ? `${allOfficialSets.length} Sets Oficiales en BD` : 'Cargando BD...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshSets && (
            <button
              onClick={onRefreshSets}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Comprobar y actualizar si hay nuevos sets en Konami / YGOPRODeck"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Catálogo</span>
            </button>
          )}

          {/* Button to open the full 400+ sets browser */}
          <button
            onClick={() => setIsOpenAllSetsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Explorar Todos los Sets ({allOfficialSets.length || '400+'})</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Featured Sets: Horizontal swipeable carousel on mobile, grid on desktop */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
        {sets.map((set) => {
          const stats = getSetStats(set.cards);
          const isSelected = set.id === selectedSetId;

          return (
            <button
              key={set.id}
              onClick={() => onSelectSet(set.id)}
              disabled={isLoadingSet && isSelected}
              className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all relative overflow-hidden group shrink-0 w-[260px] sm:w-auto snap-start active:scale-[0.98] ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  {getBannerIcon(set.bannerType)}
                  <span className="font-mono-numbers text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {set.code}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono-numbers">
                  {set.releaseDate}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
                {set.name}
              </h3>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-numbers">
                  <span className="text-slate-400">
                    {stats.owned} de {set.cards.length} cartas
                  </span>
                  <span className={`font-semibold ${stats.percentage === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {stats.percentage}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      stats.percentage === 100
                        ? 'bg-emerald-400'
                        : stats.percentage > 50
                        ? 'bg-amber-400'
                        : 'bg-amber-500/70'
                    }`}
                    style={{ width: `${Math.max(stats.percentage, 0)}%` }}
                  />
                </div>
              </div>

              {isLoadingSet && isSelected && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando en español...</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal to browse ALL 400+ Sets */}
      {isOpenAllSetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-slate-950/90 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-slate-100">
                    Catálogo de Todas las Expansiones Oficiales ({allOfficialSets.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selecciona cualquier sobre de expansión o baraja de Yu-Gi-Oh! para cargarlo en español.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpenAllSetsModal(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>

              {/* Filter in modal */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={setFilterQuery}
                  onChange={(e) => setSetFilterQuery(e.target.value)}
                  placeholder="Buscar set por nombre (ej: Infinite Forbidden, Metal Raiders, Rarity, Structure...) o código (ej: LOB, AGOV, MP24)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
            </div>

            {/* List of sets */}
            <div className="overflow-y-auto p-4 divide-y divide-slate-800/60 max-h-[60vh]">
              {filteredAllSets.map((s) => {
                const isAlreadySelected = sets.some((local) => local.code === s.set_code || local.nameEn === s.set_name);

                return (
                  <div
                    key={`${s.set_code}-${s.set_name}`}
                    className="py-3 px-3 rounded-xl hover:bg-slate-800/60 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono-numbers text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {s.set_code}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {s.set_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono-numbers">
                        <span>{s.num_of_cards} cartas oficiales</span>
                        {s.tcg_date && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Fecha: {s.tcg_date}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectSet(s.set_code, s.set_name);
                        setIsOpenAllSetsModal(false);
                      }}
                      className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      {isAlreadySelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ver Set</span>
                        </>
                      ) : (
                        <span>Cargar Set en Español</span>
                      )}
                    </button>
                  </div>
                );
              })}

              {filteredAllSets.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No se encontraron expansiones que coincidan con &ldquo;{setFilterQuery}&rdquo;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
