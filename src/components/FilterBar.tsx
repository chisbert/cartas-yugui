import React, { useState } from 'react';
import { FilterState } from '../types/yugioh';
import { ALL_RARITY_OPTIONS_LIST } from '../data/rarities';
import {
  Search,
  X,
  ArrowUpDown,
  CheckCircle2,
  CircleDashed,
  Star,
  Sparkles,
  LayoutGrid,
  BookOpen,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCardsCount: number;
  filteredCount: number;
  ownedCount: number;
  desiredCount: number;
  highlightDesiredMode: boolean;
  setHighlightDesiredMode: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: 'grid' | 'binder';
  setViewMode: (mode: 'grid' | 'binder') => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalCardsCount,
  filteredCount,
  ownedCount,
  desiredCount,
  highlightDesiredMode,
  setHighlightDesiredMode,
  viewMode,
  setViewMode,
  isMuted,
  onToggleMute,
}) => {
  const [showMobileAdvancedFilters, setShowMobileAdvancedFilters] = useState(false);

  const activeFiltersCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.rarity !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'number' ? 1 : 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
      {/* Top Search Input & View/Filter triggers */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Buscar por nombre, código o efecto..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher Desktop */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-950/90 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vista en cuadrícula estándar de alta densidad"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Rejilla</span>
          </button>

          <button
            onClick={() => setViewMode('binder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'binder'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'text-amber-400 hover:text-amber-300'
            }`}
            title="Vista de archivador físico Ultra PRO de 9 bolsillos con hojas"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Carpeta 3x3</span>
          </button>
        </div>

        {/* Sound Toggle Button (Desktop & Mobile) */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-xl border transition-colors shrink-0 ${
            !isMuted
              ? 'bg-slate-950/80 border-slate-800 text-amber-400 hover:text-amber-300'
              : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={isMuted ? 'Activar efectos de sonido' : 'Silenciar efectos de sonido'}
        >
          {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Mobile Filter & View Toggle Trigger Button */}
        <button
          onClick={() => setShowMobileAdvancedFilters((prev) => !prev)}
          className={`md:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
            showMobileAdvancedFilters || activeFiltersCount > 0
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showMobileAdvancedFilters ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Horizontally scrollable ownership chips for mobile & wrap for desktop */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
        <button
          onClick={() => setFilters((prev) => ({ ...prev, ownership: 'all' }))}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 font-medium transition-all min-h-[36px] flex items-center ${
            filters.ownership === 'all'
              ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          Todas ({totalCardsCount})
        </button>
        <button
          onClick={() => setFilters((prev) => ({ ...prev, ownership: 'owned' }))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 font-medium transition-all min-h-[36px] ${
            filters.ownership === 'owned'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Tengo ({ownedCount})</span>
        </button>
        <button
          onClick={() => setFilters((prev) => ({ ...prev, ownership: 'unowned' }))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 font-medium transition-all min-h-[36px] ${
            filters.ownership === 'unowned'
              ? 'bg-slate-800 text-slate-300 border border-slate-700 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
          }`}
        >
          <CircleDashed className="w-3.5 h-3.5 text-slate-400" />
          <span>Faltan ({totalCardsCount - ownedCount})</span>
        </button>
        <button
          onClick={() => setFilters((prev) => ({ ...prev, ownership: 'desired' }))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 font-semibold transition-all min-h-[36px] ${
            filters.ownership === 'desired'
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
              : 'bg-slate-950/60 text-amber-400 hover:bg-amber-950/40 border border-slate-800/80'
          }`}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              filters.ownership === 'desired' ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'
            }`}
          />
          <span>Deseadas ({desiredCount})</span>
        </button>

        {/* Quick View toggle inside row for mobile */}
        <div className="md:hidden flex items-center gap-1 ml-auto shrink-0">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'binder' : 'grid')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-semibold text-amber-400 min-h-[36px]"
          >
            {viewMode === 'grid' ? (
              <>
                <BookOpen className="w-3 h-3" />
                <span>Carpeta</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3 h-3" />
                <span>Rejilla</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters: Always visible on desktop, Collapsible drawer on mobile */}
      <div
        className={`${
          showMobileAdvancedFilters ? 'block' : 'hidden md:flex'
        } flex-col md:flex-row flex-wrap items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Card Category Pills */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
              className={`px-2.5 py-1 rounded-md transition-colors flex-1 sm:flex-initial text-center ${
                filters.category === 'all'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, category: 'monster' }))}
              className={`px-2.5 py-1 rounded-md transition-colors flex-1 sm:flex-initial text-center ${
                filters.category === 'monster'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monstruos
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, category: 'spell' }))}
              className={`px-2.5 py-1 rounded-md transition-colors flex-1 sm:flex-initial text-center ${
                filters.category === 'spell'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mágicas
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, category: 'trap' }))}
              className={`px-2.5 py-1 rounded-md transition-colors flex-1 sm:flex-initial text-center ${
                filters.category === 'trap'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trampas
            </button>
          </div>

          {/* Rarity filter */}
          <select
            value={filters.rarity}
            onChange={(e) => setFilters((prev) => ({ ...prev, rarity: e.target.value }))}
            className="bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/70 text-xs w-full sm:w-auto"
          >
            <option value="all">Todas las rarezas</option>
            {ALL_RARITY_OPTIONS_LIST.map((r) => (
              <option key={r.code} value={r.code}>
                {r.shortName} ({r.code})
              </option>
            ))}
          </select>

          {/* Pulsing Gold Highlight Toggle Switch */}
          <button
            onClick={() => setHighlightDesiredMode((prev) => !prev)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all w-full sm:w-auto ${
              highlightDesiredMode
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Activa o desactiva el borde dorado pulsante para cartas deseadas"
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${highlightDesiredMode ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`}
            />
            <span>
              Resaltar Deseadas: <strong>{highlightDesiredMode ? 'ACTIVO' : 'PAUSADO'}</strong>
            </span>
          </button>
        </div>

        {/* Sort selector & stats label */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
          <span className="text-slate-400 font-mono-numbers">
            <strong className="text-slate-200">{filteredCount}</strong> de {totalCardsCount} cartas
          </span>

          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))
              }
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="number">Por número (#001-#100)</option>
              <option value="name">Por nombre (A-Z)</option>
              <option value="atk">Por ATK</option>
              <option value="copies">Por copias en posesión</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

