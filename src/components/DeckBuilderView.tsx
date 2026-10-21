import React, { useState, useMemo, useCallback } from 'react';
import { UserCollectionData, YugiohCard } from '../types/yugioh';
import { META_DECK_RECIPES, MetaDeckRecipe } from '../data/metaDecksData';
import {
  evaluateAllRecipesAffinity,
  generateOptimizedDeck,
  generateYdkContent,
  downloadYdkFile,
  copyDeckToClipboard,
  BuiltDeckCard,
} from '../services/deckGeneratorService';
import { DeckMatBoard } from './DeckMatBoard';
import { HandSimulatorModal } from './HandSimulatorModal';
import { soundFx } from '../services/soundFx';
import {
  Wand2,
  Sparkles,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  Star,
  Swords,
  Shield,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Award,
} from 'lucide-react';

interface DeckBuilderViewProps {
  collection: UserCollectionData;
  allCards: YugiohCard[];
  isCardDesired: (cardCode: string) => boolean;
  onToggleDesired: (cardCode: string) => void;
  onOpenCardDetail: (card: YugiohCard) => void;
  initialArchetypeId?: string;
}

export const DeckBuilderView: React.FC<DeckBuilderViewProps> = ({
  collection,
  allCards,
  isCardDesired,
  onToggleDesired,
  onOpenCardDetail,
  initialArchetypeId,
}) => {
  // Calcular afinidad de todos los arquetipos meta con la colección actual
  const affinities = useMemo(() => {
    return evaluateAllRecipesAffinity(collection, allCards);
  }, [collection, allCards]);

  // Selección del arquetipo activo: por defecto el de mayor afinidad o el initialArchetypeId si se proporcionó
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(() => {
    if (initialArchetypeId) return initialArchetypeId;
    return affinities[0]?.recipe.id || META_DECK_RECIPES[0].id;
  });

  // Opciones de configuración del generador
  const [prioritizeHighFoil, setPrioritizeHighFoil] = useState(true);
  const [useSubstitutes, setUseSubstitutes] = useState(true);

  // Estados de modales y feedback
  const [isHandSimulatorOpen, setIsHandSimulatorOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [wishlistNotification, setWishlistNotification] = useState<string | null>(null);

  // Receta seleccionada actual
  const currentRecipe = useMemo(() => {
    return META_DECK_RECIPES.find((r) => r.id === selectedRecipeId) || META_DECK_RECIPES[0];
  }, [selectedRecipeId]);

  // Baraja generada con el algoritmo adaptativo
  const generatedDeck = useMemo(() => {
    return generateOptimizedDeck(currentRecipe, collection, allCards, {
      prioritizeHighFoil,
      useSubstitutes,
    });
  }, [currentRecipe, collection, allCards, prioritizeHighFoil, useSubstitutes]);

  // Manejo de exportación a archivo .YDK
  const handleExportYdk = useCallback(() => {
    soundFx.playAddCard();
    const ydkContent = generateYdkContent(generatedDeck);
    downloadYdkFile(generatedDeck.recipe.name, ydkContent);
  }, [generatedDeck]);

  // Manejo de copia al portapapeles
  const handleCopyClipboard = useCallback(async () => {
    soundFx.playCardFoilShine();
    const success = await copyDeckToClipboard(generatedDeck);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  }, [generatedDeck]);

  // Manejador para añadir todas las cartas faltantes a la lista de deseos
  const handleAddAllMissingToWishlist = useCallback(() => {
    soundFx.playAddCard();
    let count = 0;
    for (const missing of generatedDeck.missingCards) {
      // Intentar encontrar el cardCode en allCards o usar el passcode
      const card = allCards.find((c) => c.id === missing.passcode);
      if (card && !isCardDesired(card.cardCode)) {
        onToggleDesired(card.cardCode);
        count++;
      }
    }
    setWishlistNotification(
      `¡Se han añadido las cartas faltantes a tu lista de Deseadas!`
    );
    setTimeout(() => setWishlistNotification(null), 3500);
  }, [generatedDeck, allCards, isCardDesired, onToggleDesired]);

  // Manejador al hacer click en una carta del tapete
  const handleSelectCard = useCallback(
    (card: BuiltDeckCard) => {
      soundFx.playCardSelect();
      const matched = allCards.find((c) => c.id === card.passcode || c.cardCode === card.cardCode);
      if (matched) {
        onOpenCardDetail(matched);
      }
    },
    [allCards, onOpenCardDetail]
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Hero */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-numbers text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Algoritmo de Optimización TCG</span>
            </span>
            <span className="text-xs text-slate-400">
              Adapta recetas meta mundiales directamente a tu colección registrada
            </span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Generador de <span className="text-amber-400">Mazos Competitivos</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Elige una receta del metajuego o deja que el algoritmo analice tu álbum de cartas. 
            Priorizará automáticamente las <b>rarezas más prestigiosas</b> que poseas (Quarter Century, Starlight, Coleccionista, Secretas), 
            sustituirá huecos y te proporcionará un tapete con simulador de mano y exportador universal <b>.YDK</b>.
          </p>
        </div>
      </div>

      {/* Wishlist Floating Notification */}
      {wishlistNotification && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950/95 border border-emerald-600 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
          <span>{wishlistNotification}</span>
        </div>
      )}

      {/* Section 1: Selector de Arquetipos Meta con Afinidad */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-lg font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Arquetipos Meta & Compatibilidad con tu Colección</span>
          </h2>
          <span className="text-xs text-slate-400">
            Ordenados de mayor a menor afinidad
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {affinities.map(({ recipe, matchPercentage, ownedMainCards, totalMainCards }, idx) => {
            const isSelected = recipe.id === selectedRecipeId;
            const isTopAffinity = idx === 0 && matchPercentage > 0;

            return (
              <div
                key={recipe.id}
                onClick={() => {
                  soundFx.playCardSelect();
                  setSelectedRecipeId(recipe.id);
                }}
                className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {recipe.tier}
                    </span>

                    {isTopAffinity && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Mayor Afinidad</span>
                      </span>
                    )}

                    <span className="text-[10px] font-medium text-slate-400">
                      {recipe.playstyle}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-cinzel text-base font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {recipe.subtitle}
                  </p>
                </div>

                {/* Affinity Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Cartas en posesión:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {ownedMainCards}/{totalMainCards} ({matchPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        matchPercentage >= 75
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : matchPercentage >= 40
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-slate-600 to-slate-500'
                      }`}
                      style={{ width: `${Math.max(matchPercentage, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Detalle del Mazo Seleccionado & Barra de Acciones */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* Header of Active Deck */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentRecipe.tier} · {currentRecipe.playstyle}
              </span>
              <span className="text-xs text-slate-400">
                Dificultad: <b className="text-slate-200">{currentRecipe.difficulty}</b>
              </span>
            </div>

            <h2 className="font-cinzel text-2xl font-bold text-slate-100">
              {currentRecipe.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {currentRecipe.description}
            </p>
          </div>

          {/* Action Buttons: Hand Simulator, Export YDK, Copy */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                soundFx.playCardFoilShine();
                setIsHandSimulatorOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-95 min-h-[42px]"
              title="Probar manos de apertura de 5 cartas con barajado físico"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Probar Mano Inicial (5 Cartas)</span>
            </button>

            <button
              onClick={handleExportYdk}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all active:scale-95 min-h-[42px]"
              title="Descargar archivo universal .YDK para EDOPro, Omega, Master Duel o YGOPRODeck"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Descargar .YDK</span>
            </button>

            <button
              onClick={handleCopyClipboard}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all active:scale-95 min-h-[42px]"
              title="Copiar lista de cartas estructurada para Discord o foros"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copiar Lista</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Strategy Synopsis */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200 mr-2">Estrategia recomendada:</span>
            <span className="text-slate-400 leading-relaxed">{currentRecipe.strategySummary}</span>
          </div>
        </div>

        {/* Algorithm Configuration Toggles & Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Metric 1: Main Deck Readiness */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Afinidad con Colección
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-amber-400">
                {generatedDeck.matchPercentage}%
              </span>
              <span className="text-xs text-slate-400">
                ({generatedDeck.ownedMainCount}/{generatedDeck.totalMain} en Main)
              </span>
            </div>
            <div className="mt-2 text-[10px] text-emerald-400">
              ✓ {generatedDeck.totalMain - generatedDeck.missingCards.reduce((a, b) => a + b.missingCount, 0)} copias listas para jugar
            </div>
          </div>

          {/* Metric 2: Ratios Competitivos */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Ratios del Main Deck
            </span>
            <div className="text-xs space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Monstruos:</span>
                <b>{generatedDeck.ratios.monsters}</b>
              </div>
              <div className="flex justify-between">
                <span>Magias:</span>
                <b>{generatedDeck.ratios.spells}</b>
              </div>
              <div className="flex justify-between">
                <span>Trampas:</span>
                <b>{generatedDeck.ratios.traps}</b>
              </div>
            </div>
          </div>

          {/* Metric 3: Handtraps & Starters */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Consistencia Táctica
            </span>
            <div className="text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Iniciadores de Combo:</span>
                <b className="text-emerald-400 font-mono">{generatedDeck.ratios.starters}</b>
              </div>
              <div className="flex justify-between">
                <span>Handtraps / Staples:</span>
                <b className="text-purple-400 font-mono">{generatedDeck.ratios.handtraps}</b>
              </div>
              <div className="flex justify-between">
                <span>Extra Deck:</span>
                <b className="text-slate-200 font-mono">{generatedDeck.totalExtra}/15</b>
              </div>
            </div>
          </div>

          {/* Algorithm Config Switches */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block font-cinzel">
              Ajustes del Algoritmo
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={prioritizeHighFoil}
                onChange={(e) => setPrioritizeHighFoil(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span className="truncate">Priorizar Rareza Máxima (Foil)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useSubstitutes}
                onChange={(e) => setUseSubstitutes(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span className="truncate">Sustitutos Inteligentes</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 3: Tapete Interactivo Main / Extra / Side */}
      <DeckMatBoard
        mainDeck={generatedDeck.mainDeck}
        extraDeck={generatedDeck.extraDeck}
        sideDeck={generatedDeck.sideDeck}
        missingCards={generatedDeck.missingCards}
        isCardDesired={isCardDesired}
        onToggleDesired={onToggleDesired}
        onSelectCard={handleSelectCard}
        onAddAllMissingToWishlist={handleAddAllMissingToWishlist}
      />

      {/* Hand Simulator Modal */}
      <HandSimulatorModal
        isOpen={isHandSimulatorOpen}
        onClose={() => setIsHandSimulatorOpen(false)}
        mainDeck={generatedDeck.mainDeck}
        deckName={currentRecipe.name}
      />
    </div>
  );
};
