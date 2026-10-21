import React, { useState, useEffect, useCallback } from 'react';
import { YugiohCard } from '../types/yugioh';
import { fetchMasterCatalog, searchCardsInSpanish } from '../services/yugiohApi';
import { CardGrid } from './CardGrid';
import { Search, Loader2, Sparkles, BookOpen, ChevronLeft, ChevronRight, Filter, Globe } from 'lucide-react';

interface GlobalSearchProps {
  collection: Record<string, Record<string, number>>;
  isCardOwned: (cardCode: string) => boolean;
  isCardDesired: (cardCode: string) => boolean;
  highlightDesiredMode: boolean;
  getTotalCopies: (cardCode: string) => number;
  onOpenDetail: (card: YugiohCard) => void;
  onAddQuick: (card: YugiohCard) => void;
  onRemoveQuick: (card: YugiohCard) => void;
  onToggleDesired: (cardCode: string) => void;
  initialQuery?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  collection,
  isCardOwned,
  isCardDesired,
  highlightDesiredMode,
  getTotalCopies,
  onOpenDetail,
  onAddQuick,
  onRemoveQuick,
  onToggleDesired,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'monster' | 'spell' | 'trap'>('all');
  const [selectedAttr, setSelectedAttr] = useState<string>('all');
  const [cards, setCards] = useState<YugiohCard[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'catalog' | 'search'>('catalog');

  const PAGE_SIZE = 36;

  // Cargar cartas del catálogo maestro paginado
  const loadCatalog = useCallback(
    async (currentPage: number, searchKeyword?: string, cat?: string, attr?: string) => {
      setIsLoading(true);
      try {
        let typeParam = 'all';
        if (cat === 'spell') typeParam = 'Spell Card';
        else if (cat === 'trap') typeParam = 'Trap Card';

        let attrParam = attr === 'all' ? undefined : attr;

        const res = await fetchMasterCatalog(currentPage, PAGE_SIZE, searchKeyword, typeParam, attrParam);
        setCards(res.cards);
        setTotalRows(res.totalRows);
        setTotalPages(res.totalPages || Math.ceil(res.totalRows / PAGE_SIZE) || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Sincronizar si cambia initialQuery desde el buscador predictivo global
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setPage(1);
      loadCatalog(1, initialQuery, selectedCategory, selectedAttr);
    }
  }, [initialQuery, loadCatalog, selectedCategory, selectedAttr]);

  useEffect(() => {
    loadCatalog(page, query, selectedCategory, selectedAttr);
  }, [page, selectedCategory, selectedAttr, loadCatalog]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCatalog(1, query, selectedCategory, selectedAttr);
  };

  const handleQuickSuggest = (term: string) => {
    setQuery(term);
    setPage(1);
    loadCatalog(1, term, selectedCategory, selectedAttr);
  };

  const handleClear = () => {
    setQuery('');
    setPage(1);
    loadCatalog(1, '', selectedCategory, selectedAttr);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>Catálogo Maestro Oficial · Más de 13.000 Cartas en Español</span>
          </div>

          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100">
            Explora Todas las Cartas Existentes de Yu-Gi-Oh!
          </h2>

          <p className="text-xs text-slate-400">
            Conectado en tiempo real a la base de datos oficial. Puedes buscar cualquier carta, navegar por las miles de cartas publicadas en español, consultar sus rarezas y añadirlas a tu colección o lista de deseadas.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative mt-4">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar entre las 13.000+ cartas (ej: Dragón Blanco, Ciclón, Ilusión, Exodia, Baronesa...)"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-32 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Limpiar
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cargando...</span>
                  </>
                ) : (
                  <span>Buscar</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span>Sugerencias rápidas:</span>
            {['Ojos Azules', 'Mago Oscuro', 'Flor de Ceniza', 'Kuriboh', 'Diabellstar', 'Nibiru'].map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSuggest(term)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Filters & Pagination Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Category & Attribute Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === 'all' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos los Tipos
            </button>
            <button
              onClick={() => {
                setSelectedCategory('monster');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === 'monster' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monstruos
            </button>
            <button
              onClick={() => {
                setSelectedCategory('spell');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === 'spell' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mágicas
            </button>
            <button
              onClick={() => {
                setSelectedCategory('trap');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === 'trap' ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trampas
            </button>
          </div>

          <select
            value={selectedAttr}
            onChange={(e) => {
              setSelectedAttr(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos los Atributos</option>
            <option value="DARK">OSCURIDAD</option>
            <option value="LIGHT">LUZ</option>
            <option value="EARTH">TIERRA</option>
            <option value="WATER">AGUA</option>
            <option value="FIRE">FUEGO</option>
            <option value="WIND">VIENTO</option>
            <option value="DIVINE">DIVINO</option>
          </select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono-numbers">
            {totalRows > 0 ? (
              <>
                <strong className="text-amber-400">{totalRows}</strong> cartas · Página{' '}
                <strong className="text-slate-200">{page}</strong> de {totalPages}
              </>
            ) : (
              'Cargando cartas...'
            )}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono-numbers font-bold text-amber-300 text-xs">
              {page}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Grid with Loading Indicator */}
      {isLoading ? (
        <div className="py-24 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-200">
            Obteniendo cartas oficiales de Yu-Gi-Oh! en español...
          </p>
          <p className="text-xs text-slate-400">
            Sincronizando rarezas europeas, códigos y efectos traducidos.
          </p>
        </div>
      ) : cards.length > 0 ? (
        <>
          <CardGrid
            cards={cards}
            isCardOwned={isCardOwned}
            isCardDesired={isCardDesired}
            highlightDesiredMode={highlightDesiredMode}
            getTotalCopies={getTotalCopies}
            collection={collection}
            onOpenDetail={onOpenDetail}
            onAddQuick={onAddQuick}
            onRemoveQuick={onRemoveQuick}
            onToggleDesired={onToggleDesired}
          />

          {/* Bottom Pagination */}
          <div className="flex items-center justify-center gap-3 py-6 border-t border-slate-800/60">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Página Anterior</span>
            </button>

            <span className="font-mono-numbers text-xs text-slate-400">
              Página <strong className="text-amber-400">{page}</strong> de {totalPages}
            </span>

            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-30 transition-colors"
            >
              <span>Página Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">No se encontraron cartas en este filtro</p>
          <p className="text-xs text-slate-500 mt-1">Prueba a restablecer la búsqueda o a cambiar de categoría.</p>
        </div>
      )}
    </div>
  );
};
