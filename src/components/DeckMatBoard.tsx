import React, { useState } from 'react';
import { BuiltDeckCard, MissingCardSummary } from '../services/deckGeneratorService';
import { Star, Eye, Plus, Sparkles, Layers, Shield, Swords, Info } from 'lucide-react';

interface DeckMatBoardProps {
  mainDeck: BuiltDeckCard[];
  extraDeck: BuiltDeckCard[];
  sideDeck: BuiltDeckCard[];
  missingCards: MissingCardSummary[];
  isCardDesired: (cardCode: string) => boolean;
  onToggleDesired: (cardCode: string) => void;
  onSelectCard: (card: BuiltDeckCard) => void;
  onAddAllMissingToWishlist: () => void;
}

export const DeckMatBoard: React.FC<DeckMatBoardProps> = ({
  mainDeck,
  extraDeck,
  sideDeck,
  missingCards,
  isCardDesired,
  onToggleDesired,
  onSelectCard,
  onAddAllMissingToWishlist,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'main' | 'extra' | 'side'>('all');
  const [groupByCategory, setGroupByCategory] = useState(true);

  // Agrupación para Main Deck
  const mainMonsters = mainDeck.filter((c) => c.category === 'monster');
  const mainSpells = mainDeck.filter((c) => c.category === 'spell');
  const mainTraps = mainDeck.filter((c) => c.category === 'trap');

  const renderCardSlot = (card: BuiltDeckCard, index: number) => {
    const isDesired = card.cardCode ? isCardDesired(card.cardCode) : false;

    return (
      <div
        key={`${card.slotId}-${index}`}
        onClick={() => onSelectCard(card)}
        className={`group relative rounded-xl overflow-hidden bg-slate-900 border transition-all duration-200 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] ${
          card.isOwned
            ? 'border-slate-700/80 hover:border-amber-400/80'
            : 'border-dashed border-rose-500/50 bg-slate-950/60'
        }`}
      >
        <div className="relative aspect-[3/4.3] w-full bg-slate-950">
          <img
            src={card.imageUrl}
            alt={card.nameEs}
            className={`w-full h-full object-cover transition-opacity ${
              card.isOwned ? 'opacity-100' : 'opacity-70 grayscale-[20%]'
            }`}
            loading="lazy"
          />

          {/* Foil Shine effect for high rarity cards */}
          {card.isHighestFoil && (
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/15 via-purple-400/15 to-transparent pointer-events-none mix-blend-overlay" />
          )}

          {/* Top badges */}
          <div className="absolute top-1 left-1 right-1 flex items-center justify-between pointer-events-none gap-1">
            <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-slate-950/90 text-amber-300 border border-amber-500/30 truncate max-w-[80px]">
              {card.role === 'starter'
                ? 'Iniciador'
                : card.role === 'staple_handtrap'
                ? 'Handtrap'
                : card.role === 'searcher'
                ? 'Buscador'
                : card.role === 'extra_boss'
                ? 'Jefe Extra'
                : card.role.replace('_', ' ')}
            </span>

            {card.assignedRarity ? (
              <span className={`text-[8px] font-bold px-1 py-0.2 rounded ${card.assignedRarity.colorClass} border ${card.assignedRarity.borderClass} shrink-0`}>
                {card.assignedRarity.code}
              </span>
            ) : null}
          </div>

          {/* Status Badge at bottom */}
          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
            {card.isOwned ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-600/70 shadow-sm">
                Poseída
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.cardCode) onToggleDesired(card.cardCode);
                }}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm transition-transform active:scale-90 ${
                  isDesired
                    ? 'bg-amber-500 text-slate-950 border border-amber-400'
                    : 'bg-rose-950/90 text-rose-300 border border-rose-600/70 hover:bg-rose-900'
                }`}
                title={isDesired ? 'En lista de deseadas' : 'Añadir a lista de deseadas'}
              >
                <Star className={`w-2.5 h-2.5 ${isDesired ? 'fill-slate-950' : ''}`} />
                <span>{isDesired ? 'Deseada' : 'Faltante'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-1.5 bg-slate-900 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-200 truncate" title={card.nameEs}>
            {card.nameEs}
          </p>
          <p className="text-[9px] text-slate-400 truncate">
            {card.cardType || card.category}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls & Section Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeSection === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-slate-100'
            }`}
          >
            Vista Completa ({mainDeck.length + extraDeck.length + sideDeck.length})
          </button>
          <button
            onClick={() => setActiveSection('main')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeSection === 'main'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-slate-100'
            }`}
          >
            Main Deck ({mainDeck.length})
          </button>
          <button
            onClick={() => setActiveSection('extra')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeSection === 'extra'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-slate-100'
            }`}
          >
            Extra Deck ({extraDeck.length})
          </button>
          <button
            onClick={() => setActiveSection('side')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeSection === 'side'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-slate-100'
            }`}
          >
            Side Deck ({sideDeck.length})
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByCategory}
              onChange={(e) => setGroupByCategory(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="text-[11px] sm:text-xs">Agrupar por Monstruos/Magias/Trampas</span>
          </label>
        </div>
      </div>

      {/* Main Deck Section */}
      {(activeSection === 'all' || activeSection === 'main') && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-slate-100 flex items-center gap-2">
                  Main Deck
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {mainDeck.length} cartas (Regla Oficial 40-60)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {mainMonsters.length} Monstruos · {mainSpells.length} Mágicas · {mainTraps.length} Trampas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-medium">
                ✓ {mainDeck.filter((c) => c.isOwned).length} Poseídas
              </span>
              {mainDeck.some((c) => !c.isOwned) && (
                <span className="px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300 font-medium">
                  ✗ {mainDeck.filter((c) => !c.isOwned).length} Faltantes
                </span>
              )}
            </div>
          </div>

          {groupByCategory ? (
            <div className="space-y-6">
              {/* Monstruos */}
              {mainMonsters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-cinzel">
                      Monstruos ({mainMonsters.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {mainMonsters.map((c, i) => renderCardSlot(c, i))}
                  </div>
                </div>
              )}

              {/* Magias */}
              {mainSpells.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-cinzel">
                      Cartas Mágicas ({mainSpells.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {mainSpells.map((c, i) => renderCardSlot(c, i))}
                  </div>
                </div>
              )}

              {/* Trampas */}
              {mainTraps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-fuchsia-400" />
                    <h4 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider font-cinzel">
                      Cartas de Trampa ({mainTraps.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {mainTraps.map((c, i) => renderCardSlot(c, i))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {mainDeck.map((c, i) => renderCardSlot(c, i))}
            </div>
          )}
        </div>
      )}

      {/* Extra Deck Section */}
      {(activeSection === 'all' || activeSection === 'extra') && extraDeck.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-slate-100 flex items-center gap-2">
                  Extra Deck
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                    {extraDeck.length} cartas (Máx. 15)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Monstruos de Fusión, Sincronía, Xyz y Enlace estratégicos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-medium">
                ✓ {extraDeck.filter((c) => c.isOwned).length} Poseídas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {extraDeck.map((c, i) => renderCardSlot(c, i))}
          </div>
        </div>
      )}

      {/* Side Deck Section */}
      {(activeSection === 'all' || activeSection === 'side') && sideDeck.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-slate-100 flex items-center gap-2">
                  Side Deck
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                    {sideDeck.length} cartas (Máx. 15)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Respuestas de banquillo para Duelos 2 y 3 (Board Breakers & Handtraps anti-meta)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-medium">
                ✓ {sideDeck.filter((c) => c.isOwned).length} Poseídas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {sideDeck.map((c, i) => renderCardSlot(c, i))}
          </div>
        </div>
      )}

      {/* Missing Cards / Shopping Wishlist Action Box */}
      {missingCards.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-rose-900/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-cinzel text-base font-bold text-rose-300 flex items-center gap-2">
              <Info className="w-5 h-5 text-rose-400" />
              Lista de Compras / Cartas Faltantes ({missingCards.reduce((acc, c) => acc + c.missingCount, 0)} copias)
            </h4>
            <p className="text-xs text-slate-400">
              Para jugar este mazo al 100% óptimo te sugerimos conseguir las cartas anteriores.
              Puedes añadirlas con un clic a tu lista de Deseadas de la aplicación.
            </p>
          </div>

          <button
            onClick={onAddAllMissingToWishlist}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all shrink-0 active:scale-95"
          >
            <Star className="w-4 h-4 fill-slate-950" />
            <span>Añadir Todas a Mis Deseadas</span>
          </button>
        </div>
      )}
    </div>
  );
};
