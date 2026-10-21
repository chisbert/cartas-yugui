import React, { useState } from 'react';
import { YugiohCard } from '../types/yugioh';
import { FoilCard3D } from './FoilCard3D';
import { soundFx } from '../services/soundFx';
import { Plus, Minus, Check, Eye, Star } from 'lucide-react';

interface CardItemProps {
  card: YugiohCard;
  isOwned: boolean;
  isDesired: boolean;
  highlightDesiredMode?: boolean;
  totalCopies: number;
  ownedRarities: Record<string, number>;
  onOpenDetail: (card: YugiohCard) => void;
  onAddQuick: (card: YugiohCard) => void;
  onRemoveQuick: (card: YugiohCard) => void;
  onToggleDesired: (cardCode: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  isOwned,
  isDesired,
  highlightDesiredMode = true,
  totalCopies,
  ownedRarities,
  onOpenDetail,
  onAddQuick,
  onRemoveQuick,
  onToggleDesired,
}) => {
  const [imgError, setImgError] = useState(false);

  // Buscar si tiene alguna rareza especial en posesión
  const hasQuarterCentury = ownedRarities['QCScR'] && ownedRarities['QCScR'] > 0;
  const hasSecret = ownedRarities['ScR'] && ownedRarities['ScR'] > 0;
  const hasSpecialFoil = Boolean(
    hasQuarterCentury ||
      hasSecret ||
      ownedRarities['CR'] ||
      ownedRarities['UtR'] ||
      ownedRarities['UR'] ||
      ownedRarities['StR']
  );

  const shouldPulseGold = isDesired && highlightDesiredMode;

  return (
    <FoilCard3D
      isOwned={isOwned}
      isDesired={isDesired}
      hasSpecialFoil={hasSpecialFoil}
      className="h-full"
    >
      <div
        className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden h-full ${
          shouldPulseGold
            ? 'card-desired-pulsing bg-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.55)]'
            : isOwned
            ? hasQuarterCentury
              ? 'bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
              : hasSecret
              ? 'bg-slate-900 border-fuchsia-400/80 shadow-[0_0_12px_rgba(217,70,239,0.18)]'
              : 'bg-slate-900 border-slate-700 hover:border-amber-500/60 shadow-md'
            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        {/* Top Header Strip: Card Number, Set Code & Star Wishlist Button */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/80 border-b border-slate-800/60 text-xs gap-1">
          <div className="flex items-center gap-1 font-mono-numbers min-w-0">
            <span className="font-bold text-amber-400 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 shrink-0">
              #{card.setNumber}
            </span>
            <span className="text-slate-400 font-medium text-[10px] sm:text-[11px] truncate" title={card.cardCode}>
              {card.cardCode}
            </span>
          </div>

          {/* Right side: Star button + Status */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Owned badge or unowned status */}
            {isOwned ? (
              <span className="flex items-center gap-0.5 font-mono-numbers text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                x{totalCopies}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-medium shrink-0">
                Falta
              </span>
            )}

            {/* Wishlist Star Button with enlarged touch hit area */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playStarClick();
                onToggleDesired(card.cardCode);
              }}
              title={isDesired ? 'Carta Deseada (Pulsa para quitar)' : 'Marcar como Deseada / Prioridad'}
              className={`min-w-[36px] min-h-[36px] flex items-center justify-center -mr-1.5 p-1 rounded-lg transition-all active:scale-125 touch-manipulation ${
                isDesired
                  ? 'text-amber-400'
                  : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isDesired ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card Artwork with Interactive Shading */}
        <div
          onClick={() => onOpenDetail(card)}
          className="relative cursor-pointer aspect-[3/4.3] p-1.5 sm:p-2 flex items-center justify-center bg-slate-950/40 overflow-hidden active:scale-[0.98] transition-transform"
        >
          <div
            className={`w-full h-full relative rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300 ${
              isOwned ? 'card-owned' : 'card-unowned'
            }`}
          >
            {!imgError ? (
              <img
                src={card.imageUrlSmall || card.imageUrl}
                alt={card.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-3 text-center">
                <span className="text-amber-400 font-cinzel font-bold text-xs mb-1">
                  {card.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono-numbers">{card.cardCode}</span>
              </div>
            )}

            {/* Unowned visual banner overlay */}
            {!isOwned && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-grayscale flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold shadow-lg">
                  <Eye className="w-3.5 h-3.5" />
                  Ver Detalle
                </span>
              </div>
            )}

            {/* Desired banner badge on artwork if wished */}
            {isDesired && (
              <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                <span className="px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-400 font-semibold text-[9px] shadow-[0_0_8px_rgba(251,191,36,0.6)] flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>Deseada</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Info & Name in Spanish */}
        <div className="p-2 sm:p-3 pt-1 space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <button
              onClick={() => onOpenDetail(card)}
              className="text-left w-full group/title"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-1 group-hover/title:text-amber-300 transition-colors">
                {card.name}
              </h4>
            </button>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              <span>{card.type}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold">{card.attribute}</span>
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

          {/* Rarities available / owned indicator */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1 items-center max-h-12 overflow-hidden">
              {card.availableRarities.map((r) => {
                const copies = ownedRarities[r.code] || 0;
                const hasThisRarity = copies > 0;
                return (
                  <button
                    key={r.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(card);
                    }}
                    title={`${r.name}: ${copies} en posesión`}
                    className={`text-[9px] sm:text-[10px] font-mono-numbers px-1.5 py-0.5 rounded border transition-all ${
                      hasThisRarity
                        ? `${r.colorClass} ${r.borderClass} font-bold ring-1 ring-amber-400/50`
                        : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {r.code} {hasThisRarity && `(${copies})`}
                  </button>
                );
              })}
            </div>

            {/* Quick Counter Controls with mobile hitboxes */}
            <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800/60">
              <button
                onClick={() => onOpenDetail(card)}
                className="text-[10px] sm:text-[11px] text-slate-400 hover:text-amber-400 font-medium transition-colors py-1 min-h-[32px] flex items-center"
              >
                Detalle
              </button>

              <div className="flex items-center gap-0.5 bg-slate-950/90 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => {
                    soundFx.playCardAdded();
                    onRemoveQuick(card);
                  }}
                  disabled={!isOwned}
                  title="Quitar una copia"
                  className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 touch-manipulation"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-mono-numbers font-bold text-slate-200">
                  {totalCopies}
                </span>
                <button
                  onClick={() => {
                    soundFx.playCardAdded();
                    onAddQuick(card);
                  }}
                  title="Añadir una copia rápida"
                  className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold transition-all shadow-sm active:scale-90 touch-manipulation"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FoilCard3D>
  );
};
