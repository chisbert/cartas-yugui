import React, { useState, useEffect } from 'react';
import { YugiohCard } from '../types/yugioh';
import { FoilCard3D } from './FoilCard3D';
import { soundFx } from '../services/soundFx';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Minus,
  Check,
  Eye,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface BinderViewProps {
  cards: YugiohCard[];
  setName: string;
  setCode: string;
  isCardOwned: (cardCode: string) => boolean;
  isCardDesired: (cardCode: string) => boolean;
  highlightDesiredMode: boolean;
  getTotalCopies: (cardCode: string) => number;
  collection: Record<string, Record<string, number>>;
  onOpenDetail: (card: YugiohCard) => void;
  onAddQuick: (card: YugiohCard) => void;
  onRemoveQuick: (card: YugiohCard) => void;
  onToggleDesired: (cardCode: string) => void;
}

const CARDS_PER_PAGE = 9; // Cuadrícula clásica 3x3 Ultra PRO

export const BinderView: React.FC<BinderViewProps> = ({
  cards,
  setName,
  setCode,
  isCardOwned,
  isCardDesired,
  highlightDesiredMode,
  getTotalCopies,
  collection,
  onOpenDetail,
  onAddQuick,
  onRemoveQuick,
  onToggleDesired,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE));

  // Resetear página si el set cambia y la página actual excede el límite
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [cards.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const pageCards = cards.slice(startIndex, startIndex + CARDS_PER_PAGE);

  // Crear array fijo de 9 ranuras para el diseño de bolsillos 3x3
  const pockets = Array.from({ length: CARDS_PER_PAGE }).map((_, idx) => {
    return pageCards[idx] || null;
  });

  const goToPrevPage = () => {
    if (currentPage > 1) {
      soundFx.playPageTurn();
      setCurrentPage((p) => p - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      soundFx.playPageTurn();
      setCurrentPage((p) => p + 1);
    }
  };

  // Atajos de teclado para pasar hojas (Flecha Izquierda y Derecha)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Contar cartas obtenidas en la página actual
  const ownedInPage = pageCards.filter((c) => isCardOwned(c.cardCode)).length;

  return (
    <div className="space-y-4">
      {/* Binder Navigation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-slate-100 text-sm">
                Archivador 3x3 Ultra PRO
              </span>
              <span className="font-mono-numbers text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {setCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Hoja con 9 bolsillos transparentes · Usa las flechas ◄ ► para hojear
            </p>
          </div>
        </div>

        {/* Page Stepper & Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-300 font-semibold font-mono-numbers">
              {ownedInPage} de {pageCards.length} cartas en esta hoja
            </p>
            <p className="text-[11px] text-slate-500 font-mono-numbers">
              Cartas #{String(startIndex + 1).padStart(3, '0')} - #{String(Math.min(startIndex + CARDS_PER_PAGE, cards.length)).padStart(3, '0')}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Hoja anterior (Flecha Izquierda)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Anterior</span>
            </button>

            <span className="px-3 font-mono-numbers text-xs font-bold text-amber-300">
              Hoja {currentPage} / {totalPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Hoja siguiente (Flecha Derecha)"
            >
              <span className="hidden md:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3x3 Physical Binder Container */}
      <div className="relative p-4 sm:p-7 rounded-3xl bg-gradient-to-br from-[#121824] via-[#0F141F] to-[#0A0D14] border-2 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Binder Spine / Rings decoration on the left */}
        <div className="absolute left-1 top-0 bottom-0 w-3 flex flex-col justify-around py-8 pointer-events-none opacity-40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />
          ))}
        </div>

        {/* 3x3 Binder Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pl-2">
          {pockets.map((card, pocketIdx) => {
            const slotNumber = startIndex + pocketIdx + 1;
            const pocketLabel = `Bolsillo ${pocketIdx + 1} · #${String(slotNumber).padStart(3, '0')}`;

            if (!card) {
              // Empty pocket placeholder
              return (
                <div
                  key={`empty-${pocketIdx}`}
                  className="aspect-[3/4.6] rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/40 p-4 flex flex-col items-center justify-center text-center text-slate-600 select-none"
                >
                  <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-700 mb-2">
                    <span className="font-mono-numbers text-xs font-semibold">#{slotNumber}</span>
                  </div>
                  <span className="text-[11px] font-mono-numbers text-slate-600">Bolsillo Vacío</span>
                  <span className="text-[10px] text-slate-700">Sin carta asignada</span>
                </div>
              );
            }

            const owned = isCardOwned(card.cardCode);
            const desired = isCardDesired(card.cardCode);
            const totalCopies = getTotalCopies(card.cardCode);
            const ownedRarities = collection[card.cardCode] || {};
            const hasSpecialFoil = Boolean(
              ownedRarities['QCScR'] ||
                ownedRarities['ScR'] ||
                ownedRarities['CR'] ||
                ownedRarities['UtR'] ||
                ownedRarities['UR'] ||
                ownedRarities['StR']
            );
            const shouldPulseGold = desired && highlightDesiredMode;

            return (
              <FoilCard3D
                key={card.cardCode}
                isOwned={owned}
                isDesired={desired}
                hasSpecialFoil={hasSpecialFoil}
                className="h-full"
              >
                {/* Transparent Plastic Sleeve Pocket Exterior */}
                <div
                  className={`h-full relative rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-200 border bg-gradient-to-b from-slate-900/90 to-slate-950/95 shadow-md ${
                    shouldPulseGold
                      ? 'card-desired-pulsing shadow-[0_0_22px_rgba(251,191,36,0.55)]'
                      : owned
                      ? 'border-slate-700 hover:border-amber-400/60'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Pocket Header Bar: Slot Number, European Code & Wishlist Star */}
                  <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-800/60 text-xs">
                    <div className="flex items-center gap-1.5 font-mono-numbers">
                      <span className="font-bold text-[10px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/40">
                        #{card.setNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[110px]" title={card.cardCode}>
                        {card.cardCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playStarClick();
                          onToggleDesired(card.cardCode);
                        }}
                        className={`p-1 rounded transition-transform ${
                          desired
                            ? 'text-amber-400 scale-110'
                            : 'text-slate-500 hover:text-amber-300'
                        }`}
                        title={desired ? 'Quitar de deseadas' : 'Marcar como deseada'}
                      >
                        <Star className={`w-3.5 h-3.5 ${desired ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>

                      {owned ? (
                        <span className="flex items-center gap-0.5 font-mono-numbers text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          x{totalCopies}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Hueco</span>
                      )}
                    </div>
                  </div>

                  {/* Card Artwork inside the Sleeve */}
                  <div
                    onClick={() => onOpenDetail(card)}
                    className="relative cursor-pointer aspect-[3/4.2] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-1.5 border border-slate-800/60"
                  >
                    <div
                      className={`w-full h-full relative rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300 ${
                        owned ? 'card-owned' : 'card-unowned'
                      }`}
                    >
                      <img
                        src={card.imageUrlSmall || card.imageUrl}
                        alt={card.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain drop-shadow select-none pointer-events-none"
                        loading="lazy"
                      />

                      {!owned && (
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-grayscale flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold shadow-md">
                            <Eye className="w-3 h-3" />
                            <span>Ver & Guardar</span>
                          </span>
                        </div>
                      )}

                      {desired && (
                        <div className="absolute top-1 right-1 z-10 pointer-events-none">
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-400 text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>Deseada</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Info and Quick Counter Controls */}
                  <div className="pt-2 space-y-1.5">
                    <button
                      onClick={() => onOpenDetail(card)}
                      className="text-left w-full group/title"
                    >
                      <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 group-hover/title:text-amber-300 transition-colors">
                        {card.name}
                      </h4>
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">{card.type}</span>
                      {card.atk !== undefined && (
                        <span className="font-mono-numbers text-amber-300 font-medium">
                          {card.atk} ATK
                        </span>
                      )}
                    </div>

                    {/* Pocket Bottom Controls */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800/60">
                      <button
                        onClick={() => onOpenDetail(card)}
                        className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        Rarezas ({card.availableRarities.length})
                      </button>

                      <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                        <button
                          onClick={() => {
                            soundFx.playCardAdded();
                            onRemoveQuick(card);
                          }}
                          disabled={!owned}
                          className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20 transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono-numbers font-bold text-slate-200">
                          {totalCopies}
                        </span>
                        <button
                          onClick={() => {
                            soundFx.playCardAdded();
                            onAddQuick(card);
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </FoilCard3D>
            );
          })}
        </div>
      </div>
    </div>
  );
};
