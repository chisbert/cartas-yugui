import React, { useState } from 'react';
import { YugiohCard } from '../types/yugioh';
import { X, ExternalLink, Plus, Minus, Star, Shield, Swords, Sparkles, Check, HelpCircle, Wand2 } from 'lucide-react';

interface CardDetailModalProps {
  card: YugiohCard | null;
  onClose: () => void;
  collectionData: Record<string, number>;
  isDesired: boolean;
  onToggleDesired: (cardCode: string) => void;
  onSetRarityCopies: (cardCode: string, rarityCode: string, count: number) => void;
  onAddQuick: (card: YugiohCard) => void;
  onRemoveQuick: (card: YugiohCard) => void;
  onOpenRarityGuide?: (rarityCode: string) => void;
  onOpenDeckBuilder?: (card: YugiohCard) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
  collectionData,
  isDesired,
  onToggleDesired,
  onSetRarityCopies,
  onAddQuick,
  onRemoveQuick,
  onOpenRarityGuide,
  onOpenDeckBuilder,
}) => {
  if (!card) return null;

  const totalCopies = Object.values(collectionData).reduce((sum, count) => sum + (count || 0), 0);
  const isOwned = totalCopies > 0;

  const konamiDbUrl = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&keyword=${encodeURIComponent(
    card.name
  )}&request_locale=es`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[88vh] flex flex-col my-0 sm:my-auto pb-safe">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-mono-numbers text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              #{card.setNumber} · {card.cardCode}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Formato Europeo TCG
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wishlist toggle button */}
            <button
              onClick={() => onToggleDesired(card.cardCode)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg border transition-all min-h-[36px] ${
                isDesired
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-amber-300'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isDesired ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                }`}
              />
              <span className="hidden xs:inline">{isDesired ? 'En Deseadas' : 'Deseadas'}</span>
            </button>

            <a
              href={konamiDbUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors min-h-[36px]"
              title="Buscar en la base de datos oficial de Konami"
            >
              <span>Konami DB</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onOpenDeckBuilder && (
              <button
                onClick={() => onOpenDeckBuilder(card)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all shadow-sm min-h-[36px]"
                title="Buscar recetas de mazos meta que usen esta carta"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Mazos</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Column: High-Res Card Image */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div
              className={`relative w-full max-w-[240px] sm:max-w-[280px] aspect-[3/4.4] rounded-xl overflow-hidden bg-slate-950 shadow-2xl border transition-all duration-300 ${
                isDesired
                  ? 'card-desired-pulsing shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                  : 'border-slate-800'
              } group`}
            >
              <img
                src={card.imageUrl}
                alt={card.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-contain transition-all duration-300 ${
                  isOwned ? 'filter-none' : 'card-unowned group-hover:filter-none'
                }`}
              />

              {/* Status pill on image */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {isOwned ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                    {totalCopies} {totalCopies === 1 ? 'copia' : 'copias'}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-300 border border-slate-700 backdrop-blur-sm">
                    No en posesión
                  </span>
                )}

                {isDesired && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    Prioridad Deseada
                  </span>
                )}
              </div>
            </div>

            {/* Quick action buttons below image */}
            <div className="w-full max-w-[240px] sm:max-w-[280px] mt-3 sm:mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => onAddQuick(card)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 min-h-[40px]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+1 Copia Rápida</span>
              </button>

              {isOwned && (
                <button
                  onClick={() => onRemoveQuick(card)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors active:scale-95 min-h-[40px]"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile links row for Konami DB & Decks */}
            <div className="w-full max-w-[240px] sm:hidden flex items-center gap-2 mt-2">
              <a
                href={konamiDbUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] text-slate-300 bg-slate-800/80 rounded-lg border border-slate-700"
              >
                <span>Konami DB</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {onOpenDeckBuilder && (
                <button
                  onClick={() => onOpenDeckBuilder(card)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] text-amber-300 bg-amber-500/15 rounded-lg border border-amber-500/30"
                >
                  <Wand2 className="w-3 h-3 text-amber-400" />
                  <span>Mazos Meta</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Information, Spanish Effect & Granular Rarities */}
          <div className="md:col-span-7 space-y-5">
            {/* Title & Type */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-cinzel text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
                  {card.name}
                </h3>
                <button
                  onClick={() => onToggleDesired(card.cardCode)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors shrink-0"
                  title="Alternar marca de deseada"
                >
                  <Star
                    className={`w-5 h-5 ${
                      isDesired ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]' : ''
                    }`}
                  />
                </button>
              </div>

              {card.nameEn && card.nameEn !== card.name && (
                <p className="text-xs text-slate-400 italic mt-0.5 font-sans">
                  {card.nameEn}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                  {card.attribute}
                </span>
                <span className="text-slate-400">
                  [{card.race} / {card.type}]
                </span>

                {card.level !== undefined && (
                  <div className="flex items-center gap-1 text-amber-400 font-mono-numbers">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Nivel {card.level}</span>
                  </div>
                )}
              </div>

              {/* ATK / DEF */}
              {card.atk !== undefined && (
                <div className="flex items-center gap-4 mt-2.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 font-mono-numbers text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Swords className="w-4 h-4" />
                    <span className="text-slate-400">ATK:</span>
                    <strong className="text-sm text-slate-100">{card.atk}</strong>
                  </div>
                  {card.def !== undefined && (
                    <div className="flex items-center gap-1.5 text-blue-300">
                      <Shield className="w-4 h-4" />
                      <span className="text-slate-400">DEF:</span>
                      <strong className="text-sm text-slate-100">{card.def}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Official Spanish Card Effect Text */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Efecto / Descripción Oficial en Español
              </h4>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                {card.desc}
              </div>
            </div>

            {/* Granular Rarity Breakdown & Inventory Tracker */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Rarezas Obtenibles en Europa ({card.availableRarities.length})</span>
                </h4>
                <span className="text-xs font-mono-numbers text-slate-400">
                  Total en tu álbum: <strong className="text-amber-400 font-bold">{totalCopies}</strong>
                </span>
              </div>

              <div className="space-y-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                {card.availableRarities.map((r) => {
                  const currentCopies = collectionData[r.code] || 0;

                  return (
                    <div
                      key={r.code}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                        currentCopies > 0
                          ? 'bg-slate-900 border-amber-500/50'
                          : 'bg-slate-900/40 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`font-mono-numbers text-xs font-bold px-2 py-0.5 rounded border ${r.colorClass} ${r.borderClass}`}
                        >
                          {r.code}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-slate-200">{r.name}</p>
                            {onOpenRarityGuide && (
                              <button
                                type="button"
                                onClick={() => onOpenRarityGuide(r.code)}
                                className="p-0.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                                title={`Ver cómo identificar ${r.name} en el simulador 3D`}
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {currentCopies > 0 ? (
                              <span className="text-amber-300 font-medium">
                                Posees {currentCopies} {currentCopies === 1 ? 'copia' : 'copias'}
                              </span>
                            ) : (
                              '0 copias'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Stepper with mobile-friendly hitboxes */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onSetRarityCopies(card.cardCode, r.code, currentCopies - 1)}
                          disabled={currentCopies <= 0}
                          className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 touch-manipulation"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-7 text-center font-mono-numbers text-xs font-bold text-slate-100">
                          {currentCopies}
                        </span>

                        <button
                          onClick={() => onSetRarityCopies(card.cardCode, r.code, currentCopies + 1)}
                          className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-sm active:scale-90 touch-manipulation"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Set to 3 (playset) shortcut */}
                        <button
                          onClick={() => onSetRarityCopies(card.cardCode, r.code, 3)}
                          title="Fijar en 3 copias (Playset)"
                          className={`ml-1 px-2.5 py-1.5 min-h-[36px] flex items-center justify-center text-[11px] font-mono-numbers font-bold rounded-xl border transition-colors active:scale-95 ${
                            currentCopies === 3
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          x3
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
