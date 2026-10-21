import React, { useState, useEffect, useRef, useTransition } from 'react';
import { YugiohCard } from '../types/yugioh';
import { searchCardsInSpanish } from '../services/yugiohApi';
import { soundFx } from '../services/soundFx';
import {
  Search,
  X,
  Star,
  Plus,
  Check,
  Loader2,
  Sparkles,
  Command,
  ArrowRight,
} from 'lucide-react';

interface PredictiveSearchBarProps {
  allLoadedCards: YugiohCard[];
  onOpenDetail: (card: YugiohCard) => void;
  onAddQuick: (card: YugiohCard) => void;
  onToggleDesired: (cardCode: string) => void;
  isCardOwned: (cardCode: string) => boolean;
  isCardDesired: (cardCode: string) => boolean;
  getTotalCopies: (cardCode: string) => number;
  onViewAllResults: (query: string) => void;
}

export const PredictiveSearchBar: React.FC<PredictiveSearchBarProps> = ({
  allLoadedCards,
  onOpenDetail,
  onAddQuick,
  onToggleDesired,
  isCardOwned,
  isCardDesired,
  getTotalCopies,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<YugiohCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Atajo de teclado global: pulsar '/' o 'Ctrl+K' para enfocar el buscador predictivo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement !== inputRef.current && !(document.activeElement instanceof HTMLInputElement)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de búsqueda predictiva
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearchingApi(false);
      setSelectedIndex(-1);
      return;
    }

    const q = query.toLowerCase().trim();

    // 1. Filtrado instantáneo en cartas ya cargadas
    const localMatches = allLoadedCards.filter((card) => {
      const matchName = card.name.toLowerCase().includes(q);
      const matchNameEn = card.nameEn.toLowerCase().includes(q);
      const matchCode = card.cardCode.toLowerCase().includes(q);
      const matchNumber = card.setNumber.includes(q);
      const matchId = String(card.id).includes(q);
      return matchName || matchNameEn || matchCode || matchNumber || matchId;
    });

    startTransition(() => {
      setResults(localMatches.slice(0, 8));
      setSelectedIndex(-1);
    });

    // 2. Debounce para consultar en la API si la búsqueda tiene al menos 3 caracteres
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (q.length >= 3) {
      setIsSearchingApi(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const apiMatches = await searchCardsInSpanish(q);
          if (apiMatches && apiMatches.length > 0) {
            setResults((prev) => {
              const combinedMap = new Map<number, YugiohCard>();
              // Priorizar cartas locales ya disponibles
              for (const c of prev) {
                combinedMap.set(c.id, c);
              }
              // Añadir cartas de la API
              for (const c of apiMatches) {
                if (!combinedMap.has(c.id)) {
                  combinedMap.set(c.id, c);
                }
              }
              return Array.from(combinedMap.values()).slice(0, 10);
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingApi(false);
        }
      }, 250);
    } else {
      setIsSearchingApi(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, allLoadedCards]);

  // Manejo de navegación por teclado en el desplegable
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        onOpenDetail(results[selectedIndex]);
        setIsOpen(false);
      } else {
        onViewAllResults(query);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectCard = (card: YugiohCard) => {
    onOpenDetail(card);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-30">
      {/* Search Input Box */}
      <div
        className={`relative flex items-center w-full rounded-2xl bg-slate-900/90 border transition-all duration-200 ${
          isOpen
            ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <Search className="w-4 h-4 ml-4 text-slate-400 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Buscador predictivo global: escribe nombre en español (ej. Dragón Blanco), código (LOB-E001) o ID..."
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />

        {/* Status Indicators / Shortcuts */}
        <div className="flex items-center gap-1.5 mr-3 shrink-0">
          {isSearchingApi && (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin mr-1" />
          )}

          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Predictive Results Overlay Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden divide-y divide-slate-800/80 max-h-[70vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header count info */}
          <div className="px-4 py-2 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {results.length > 0
                  ? `Sugerencias predictivas (${results.length})`
                  : 'Buscando coincidencias...'}
              </span>
            </span>
            <span className="text-[11px] font-mono-numbers text-slate-500 hidden sm:inline">
              Usa ↑ ↓ para navegar · Enter para abrir
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-800/50">
            {results.map((card, idx) => {
              const owned = isCardOwned(card.cardCode);
              const desired = isCardDesired(card.cardCode);
              const totalCopies = getTotalCopies(card.cardCode);
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={`${card.cardCode}-${card.id}`}
                  onClick={() => handleSelectCard(card)}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-800/60'
                  }`}
                >
                  {/* Left: Card Thumbnail + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 shadow-sm relative">
                      <img
                        src={card.imageUrlSmall || card.imageUrl}
                        alt={card.name}
                        className={`w-full h-full object-contain ${owned ? 'filter-none' : 'opacity-70 grayscale'}`}
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono-numbers text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40 shrink-0">
                          {card.cardCode}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100 truncate">
                          {card.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                        <span>{card.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-300">{card.attribute}</span>
                        {card.atk !== undefined && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-numbers text-amber-300/90 font-medium">
                              {card.atk} ATK
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick actions (Ownership, Star, Add Copy) */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Desired Star Toggle */}
                    <button
                      onClick={() => {
                        soundFx.playStarClick();
                        onToggleDesired(card.cardCode);
                      }}
                      className={`p-1.5 rounded-lg transition-transform ${
                        desired ? 'text-amber-400 scale-110' : 'text-slate-500 hover:text-amber-300'
                      }`}
                      title={desired ? 'Quitar de deseadas' : 'Marcar como deseada'}
                    >
                      <Star className={`w-4 h-4 ${desired ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Ownership badge */}
                    {owned ? (
                      <span className="flex items-center gap-1 font-mono-numbers text-xs font-bold px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>x{totalCopies}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium px-2 py-1 rounded bg-slate-950 border border-slate-800">
                        Falta
                      </span>
                    )}

                    {/* Quick Add Copy Button */}
                    <button
                      onClick={() => {
                        soundFx.playCardAdded();
                        onAddQuick(card);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                      title="Añadir 1 copia a tu colección"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="hidden sm:inline">Añadir</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {results.length === 0 && !isSearchingApi && (
              <div className="py-8 text-center text-xs text-slate-400">
                No se encontraron cartas que coincidan con &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>

          {/* Footer action: See all results in global catalog */}
          <div className="p-2.5 bg-slate-950/80 flex items-center justify-between">
            <button
              onClick={() => {
                onViewAllResults(query);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors"
            >
              <span>Ver todos los resultados de &ldquo;{query}&rdquo; en el Catálogo Maestro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
