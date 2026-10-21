import React, { useState, useEffect, useCallback } from 'react';
import { BuiltDeckCard } from '../services/deckGeneratorService';
import { soundFx } from '../services/soundFx';
import { X, RotateCcw, Plus, Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface HandSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainDeck: BuiltDeckCard[];
  deckName: string;
}

export const HandSimulatorModal: React.FC<HandSimulatorModalProps> = ({
  isOpen,
  onClose,
  mainDeck,
  deckName,
}) => {
  const [shuffledDeck, setShuffledDeck] = useState<BuiltDeckCard[]>([]);
  const [hand, setHand] = useState<BuiltDeckCard[]>([]);
  const [drawnCount, setDrawnCount] = useState<number>(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BuiltDeckCard | null>(null);

  // Algoritmo de barajado Fisher-Yates
  const shuffleDeck = useCallback(() => {
    if (mainDeck.length === 0) return;
    setIsShuffling(true);
    soundFx.playCardFoilShine();

    const deckCopy = [...mainDeck];
    for (let i = deckCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }

    setTimeout(() => {
      setShuffledDeck(deckCopy.slice(5));
      setHand(deckCopy.slice(0, 5));
      setDrawnCount(5);
      setIsShuffling(false);
      setSelectedCard(null);
    }, 250);
  }, [mainDeck]);

  useEffect(() => {
    if (isOpen) {
      shuffleDeck();
    }
  }, [isOpen, shuffleDeck]);

  const drawOneCard = () => {
    if (shuffledDeck.length === 0) return;
    soundFx.playAddCard();
    const nextCard = shuffledDeck[0];
    setHand((prev) => [...prev, nextCard]);
    setShuffledDeck((prev) => prev.slice(1));
    setDrawnCount((prev) => prev + 1);
  };

  if (!isOpen) return null;

  // Análisis estadístico de la mano
  const startersInHand = hand.filter((c) => c.role === 'starter').length;
  const handtrapsInHand = hand.filter((c) => c.role === 'staple_handtrap').length;
  const extendersInHand = hand.filter((c) => c.role === 'extender' || c.role === 'searcher').length;
  const monstersInHand = hand.filter((c) => c.category === 'monster').length;
  const spellsTrapsInHand = hand.filter((c) => c.category === 'spell' || c.category === 'trap').length;

  let handQuality: { status: 'excelente' | 'buena' | 'ladrillo'; label: string; desc: string; icon: React.ReactNode } = {
    status: 'buena',
    label: 'Mano Jugable',
    desc: 'Posees cartas para iniciar juego o responder al rival.',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  };

  if (startersInHand >= 1 && handtrapsInHand >= 1) {
    handQuality = {
      status: 'excelente',
      label: 'Mano Óptima Competitiva',
      desc: '¡Iniciador garantizado + disrupción en turno rival! Ratio perfecto de torneo.',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    };
  } else if (startersInHand === 0 && extendersInHand === 0) {
    handQuality = {
      status: 'ladrillo',
      label: 'Riesgo de Bloqueo (Brick)',
      desc: 'No hay iniciadores ni buscadores en la mano de apertura. Considera ajustar ratios.',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    };
  } else if (startersInHand >= 2) {
    handQuality = {
      status: 'buena',
      label: 'Mano con Resistencia (Extenders)',
      desc: 'Múltiples iniciadores te permitirán jugar a través de interrupciones rivales.',
      icon: <CheckCircle2 className="w-5 h-5 text-sky-400" />,
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94dvh] sm:max-h-[90vh] flex flex-col my-0 sm:my-auto pb-safe">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 truncate">
                <span>Simulador de Mano</span>
                <span className="text-[11px] font-mono font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 truncate max-w-[120px] sm:max-w-none">
                  {deckName}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Apertura aleatoria de 5 cartas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Hand Quality Header */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={shuffleDeck}
              disabled={isShuffling}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.25)] transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>Barajar de Nuevo (Mulligan)</span>
            </button>

            <button
              onClick={drawOneCard}
              disabled={shuffledDeck.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all active:scale-95 disabled:opacity-40"
              title="Robar carta para simular turno 2 (Going Second)"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Robar 1 Carta ({shuffledDeck.length} restantes)</span>
            </button>
          </div>

          {/* Quick Ratios */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 font-mono">
              Iniciadores: <b>{startersInHand}</b>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-300 font-mono">
              Handtraps: <b>{handtrapsInHand}</b>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Total Mano: <b>{drawnCount}</b>
            </span>
          </div>
        </div>

        {/* Hand Quality Assessment Banner */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800/70 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            {handQuality.icon}
            <div>
              <span className="font-bold text-slate-200 mr-2">{handQuality.label}:</span>
              <span className="text-slate-400">{handQuality.desc}</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Monstruos: {monstersInHand} · Magias/Trampas: {spellsTrapsInHand}
          </span>
        </div>

        {/* Playmat / Hand Viewer Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-[#0B0F17] to-slate-950 flex flex-col justify-center min-h-[340px]">
          {isShuffling ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <RotateCcw className="w-8 h-8 animate-spin text-amber-400" />
              <span className="font-cinzel text-sm">Barajando las cartas del Main Deck...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
              {hand.map((card, idx) => (
                <div
                  key={`${card.slotId}-${idx}`}
                  onClick={() => setSelectedCard(card)}
                  className={`group relative rounded-xl overflow-hidden bg-slate-900 border transition-all duration-200 cursor-pointer hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.6)] ${
                    selectedCard?.slotId === card.slotId
                      ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-2 ring-amber-400/50'
                      : card.isOwned
                      ? 'border-slate-700/80 hover:border-amber-400/70'
                      : 'border-dashed border-rose-500/50 opacity-90'
                  }`}
                >
                  {/* Card Aspect Ratio Wrapper */}
                  <div className="relative aspect-[3/4.3] w-full bg-slate-950">
                    <img
                      src={card.imageUrl}
                      alt={card.nameEs}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Foil Shine Overlay for Special Rarities */}
                    {card.isHighestFoil && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-purple-400/10 to-transparent pointer-events-none mix-blend-overlay" />
                    )}

                    {/* Top Role / Ownership Tag */}
                    <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950/90 text-amber-300 border border-amber-500/30">
                        {card.role === 'starter'
                          ? 'Iniciador'
                          : card.role === 'staple_handtrap'
                          ? 'Handtrap'
                          : card.role === 'searcher'
                          ? 'Buscador'
                          : card.role === 'boss'
                          ? 'Jefe'
                          : 'Extender'}
                      </span>

                      {card.assignedRarity && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${card.assignedRarity.colorClass} border ${card.assignedRarity.borderClass}`}>
                          {card.assignedRarity.code}
                        </span>
                      )}
                    </div>

                    {/* Not Owned Badge */}
                    {!card.isOwned && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center pointer-events-none">
                        <span className="text-[11px] font-bold text-rose-300 bg-rose-950/90 border border-rose-600/70 px-2 py-1 rounded-lg shadow-md">
                          Faltante
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Label */}
                  <div className="p-2 bg-slate-900 border-t border-slate-800 text-left">
                    <p className="text-xs font-semibold text-slate-200 truncate" title={card.nameEs}>
                      {card.nameEs}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {card.cardType || card.category.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Card Quick Detail Drawer in Hand Simulator */}
          {selectedCard && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-700 max-w-2xl mx-auto w-full flex items-center gap-4">
              <img
                src={selectedCard.imageUrl}
                alt={selectedCard.nameEs}
                className="w-14 h-20 object-cover rounded-lg shadow-md border border-slate-700"
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-300 truncate">{selectedCard.nameEs}</h4>
                  <span className="text-[10px] text-slate-400">({selectedCard.nameEn})</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Rol táctico: <b className="text-amber-400 capitalize">{selectedCard.role.replace('_', ' ')}</b>
                  {selectedCard.atk !== undefined && ` · ATK/${selectedCard.atk}`}
                  {selectedCard.def !== undefined && ` · DEF/${selectedCard.def}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedCard.isOwned
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {selectedCard.isOwned ? '✓ En tu Colección' : '✗ Carta Faltante'}
                  </span>
                  {selectedCard.assignedRarity && (
                    <span className="text-[10px] text-amber-400">
                      Rareza sugerida: <b>{selectedCard.assignedRarity.name}</b>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-xs text-slate-400 hover:text-slate-200 p-1"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>* Basado en la probabilidad hipergeométrica de apertura de 5 cartas sobre {mainDeck.length} cartas del Main Deck.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-semibold"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
