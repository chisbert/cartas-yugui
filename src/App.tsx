import { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_EUROPEAN_SETS } from './data/setsData';
import { ExpansionSet, FilterState, YugiohCard } from './types/yugioh';
import { useCollection } from './hooks/useCollection';
import { soundFx } from './services/soundFx';
import { Navbar } from './components/Navbar';
import { PredictiveSearchBar } from './components/PredictiveSearchBar';
import { SetSelector } from './components/SetSelector';
import { FilterBar } from './components/FilterBar';
import { CardGrid } from './components/CardGrid';
import { BinderView } from './components/BinderView';
import { CardDetailModal } from './components/CardDetailModal';
import { CollectionStatsModal } from './components/CollectionStatsModal';
import { GlobalSearch } from './components/GlobalSearch';
import { MyCollection } from './components/MyCollection';
import { DesiredCardsView } from './components/DesiredCardsView';
import { MobileScanner } from './components/MobileScanner';
import { RarityGuideView } from './components/RarityGuideView';
import { DeckBuilderView } from './components/DeckBuilderView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ApkExportModal } from './components/ApkExportModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { META_DECK_RECIPES } from './data/metaDecksData';
import { ApiSetSummary, fetchAllOfficialSets, fetchCardsBySet } from './services/yugiohApi';
import { Trophy, ExternalLink, Star, Loader2, Camera } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  ownership: 'all',
  rarity: 'all',
  category: 'all',
  attribute: 'all',
  sortBy: 'number',
  sortOrder: 'asc',
};

export default function App() {
  const [sets, setSets] = useState<ExpansionSet[]>(INITIAL_EUROPEAN_SETS);
  const [selectedSetId, setSelectedSetId] = useState<string>('RA01-ES');
  const [activeTab, setActiveTab] = useState<'sets' | 'my-collection' | 'desired' | 'deck-builder' | 'global-search' | 'rarity-guide'>('sets');
  const [viewMode, setViewMode] = useState<'grid' | 'binder'>('grid');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMuted());
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedCardForModal, setSelectedCardForModal] = useState<YugiohCard | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [highlightDesiredMode, setHighlightDesiredMode] = useState(true);
  const [globalSearchInitialQuery, setGlobalSearchInitialQuery] = useState('');
  const [selectedRarityForGuide, setSelectedRarityForGuide] = useState<string | undefined>(undefined);
  const [selectedArchetypeForDeckBuilder, setSelectedArchetypeForDeckBuilder] = useState<string | undefined>(undefined);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Catálogo completo de todos los sets oficiales de Yu-Gi-Oh! en el mundo
  const [allOfficialSets, setAllOfficialSets] = useState<ApiSetSummary[]>([]);
  const [isLoadingSet, setIsLoadingSet] = useState(false);

  const {
    collection,
    isCardOwned,
    isCardDesired,
    toggleDesired,
    getTotalCopies,
    setRarityCopies,
    addQuickCopy,
    removeQuickCopy,
    getSetStats,
    exportCollectionJSON,
    importCollectionJSON,
    clearCollection,
    globalStats,
  } = useCollection();

  // Cargar listado de todos los sets oficiales al iniciar
  useEffect(() => {
    fetchAllOfficialSets().then((data) => {
      if (data && data.length > 0) {
        setAllOfficialSets(data);
      }
    });

    // Cargar automáticamente las cartas completas del set inicial (RA01)
    fetchCardsBySet('25th Anniversary Rarity Collection').then((fullCards) => {
      if (fullCards && fullCards.length > 0) {
        setSets((prev) =>
          prev.map((s) => (s.code === 'RA01' ? { ...s, cards: fullCards, totalCards: fullCards.length } : s))
        );
      }
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleRefreshSets = useCallback(async () => {
    localStorage.removeItem('yugioh_all_official_sets_cache_v3');
    const fresh = await fetchAllOfficialSets();
    setAllOfficialSets(fresh);
  }, []);

  // Seleccionar o cargar un set oficial dinámicamente en español
  const handleSelectSet = useCallback(
    async (setId: string, customSetName?: string) => {
      setIsLoadingSet(true);
      try {
        const targetName = customSetName || setId;
        const cards = await fetchCardsBySet(targetName);

        setSets((prev) => {
          const index = prev.findIndex(
            (s) =>
              s.id.toLowerCase() === setId.toLowerCase() ||
              s.code.toLowerCase() === setId.toLowerCase() ||
              (customSetName && s.nameEn.toLowerCase() === customSetName.toLowerCase())
          );

          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              cards: cards.length > 0 ? cards : updated[index].cards,
              totalCards: cards.length > 0 ? cards.length : updated[index].totalCards,
            };
            return updated;
          } else {
            const summary = allOfficialSets.find(
              (s) =>
                s.set_name.toLowerCase() === targetName.toLowerCase() ||
                s.set_code.toLowerCase() === setId.toLowerCase()
            );

            const newSet: ExpansionSet = {
              id: summary?.set_code || setId,
              code: summary?.set_code || setId,
              name: targetName,
              nameEn: targetName,
              releaseDate: summary?.tcg_date || 'Oficial TCG',
              region: 'Europa / TCG',
              description: `Expansión oficial de Yu-Gi-Oh! con ${cards.length} cartas registradas y traducidas al español.`,
              bannerType: 'booster',
              totalCards: cards.length || summary?.num_of_cards || 0,
              cards,
            };

            return [newSet, ...prev];
          }
        });

        const existing = sets.find(
          (s) =>
            s.id.toLowerCase() === setId.toLowerCase() ||
            s.code.toLowerCase() === setId.toLowerCase() ||
            (customSetName && s.nameEn.toLowerCase() === customSetName.toLowerCase())
        );

        setSelectedSetId(existing ? existing.id : setId);
        setFilters((prev) => ({ ...prev, searchQuery: '' }));
      } catch (err) {
        console.error('Error cargando cartas del set:', err);
      } finally {
        setIsLoadingSet(false);
      }
    },
    [sets, allOfficialSets]
  );

  // Expansión actualmente seleccionada
  const currentSet = useMemo(() => {
    return (
      sets.find(
        (s) =>
          s.id.toLowerCase() === selectedSetId.toLowerCase() ||
          s.code.toLowerCase() === selectedSetId.toLowerCase()
      ) || sets[0]
    );
  }, [sets, selectedSetId]);

  // Lista de todas las cartas disponibles en sets cargados para el buscador predictivo y escáner
  const allAvailableCards = useMemo(() => {
    const map = new Map<number, YugiohCard>();
    for (const set of sets) {
      for (const card of set.cards) {
        if (!map.has(card.id)) {
          map.set(card.id, card);
        }
      }
    }
    return Array.from(map.values());
  }, [sets]);

  // Estadísticas del set actual
  const currentSetStats = useMemo(() => {
    return getSetStats(currentSet.cards);
  }, [currentSet, getSetStats]);

  // Filtrado y ordenación de cartas del set actual
  const filteredCards = useMemo(() => {
    return currentSet.cards
      .filter((card) => {
        // Filtro de búsqueda
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = card.name.toLowerCase().includes(q);
          const matchNameEn = card.nameEn.toLowerCase().includes(q);
          const matchCode = card.cardCode.toLowerCase().includes(q);
          const matchNumber = card.setNumber.includes(q);
          const matchDesc = card.desc.toLowerCase().includes(q);
          if (!matchName && !matchNameEn && !matchCode && !matchNumber && !matchDesc) {
            return false;
          }
        }

        // Filtro de posesión y deseadas
        const owned = isCardOwned(card.cardCode);
        const desired = isCardDesired(card.cardCode);

        if (filters.ownership === 'owned' && !owned) return false;
        if (filters.ownership === 'unowned' && owned) return false;
        if (filters.ownership === 'desired' && !desired) return false;

        // Filtro de categoría
        if (filters.category !== 'all' && card.cardCategory !== filters.category) {
          return false;
        }

        // Filtro de rareza
        if (filters.rarity !== 'all') {
          const hasRarity = card.availableRarities.some((r) => r.code === filters.rarity);
          if (!hasRarity) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'number') {
          const numA = parseInt(a.setNumber.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.setNumber.replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        }
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name, 'es');
        }
        if (filters.sortBy === 'atk') {
          return (b.atk || 0) - (a.atk || 0);
        }
        if (filters.sortBy === 'copies') {
          return getTotalCopies(b.cardCode) - getTotalCopies(a.cardCode);
        }
        return 0;
      });
  }, [currentSet, filters, isCardOwned, isCardDesired, getTotalCopies]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        uniqueOwnedCount={globalStats.uniqueOwned}
        totalCopiesCount={globalStats.totalCopiesCount}
        desiredCount={globalStats.desiredCount}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28 md:pb-8">
        {/* Global Predictive Search Bar at the Top */}
        <PredictiveSearchBar
          allLoadedCards={allAvailableCards}
          onOpenDetail={(card) => setSelectedCardForModal(card)}
          onAddQuick={(card) => addQuickCopy(card)}
          onToggleDesired={toggleDesired}
          isCardOwned={isCardOwned}
          isCardDesired={isCardDesired}
          getTotalCopies={getTotalCopies}
          onViewAllResults={(searchQuery) => {
            setGlobalSearchInitialQuery(searchQuery);
            setActiveTab('global-search');
          }}
        />

        {activeTab === 'sets' && (
          <>
            {/* Set Selector Component with all 400+ sets */}
            <SetSelector
              sets={sets}
              selectedSetId={currentSet.id}
              onSelectSet={handleSelectSet}
              getSetStats={getSetStats}
              allOfficialSets={allOfficialSets}
              isLoadingSet={isLoadingSet}
              onRefreshSets={handleRefreshSets}
            />

            {/* Current Set Hero & Header */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 z-10 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-numbers text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {currentSet.code} · Edición Europea TCG
                  </span>
                  <span className="text-xs text-slate-400">
                    Lanzamiento: {currentSet.releaseDate}
                  </span>
                  <span className="text-xs text-emerald-400/90 font-mono-numbers px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                    {currentSet.cards.length} cartas en el set
                  </span>
                </div>

                <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                  {currentSet.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {currentSet.description}
                </p>

                {/* Shading rule & Wishlist explainer banner */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500 inline-block" />
                    <span><strong>Carta sombreada:</strong> No obtenida todavía</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] inline-block" />
                    <span><strong>Carta iluminada:</strong> En tu colección</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse inline-block" />
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      Borde dorado pulsante: Deseada
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Box */}
              <div className="w-full lg:w-72 shrink-0 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Progreso de la Expansión
                  </span>
                  <span className="font-mono-numbers text-base font-bold text-amber-400">
                    {currentSetStats.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${currentSetStats.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono-numbers">
                  <span>
                    Obtenidas: <strong className="text-slate-200">{currentSetStats.owned}</strong> / {currentSet.cards.length}
                  </span>
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {currentSetStats.desiredInSet || 0} deseadas
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Bar Component with View Switcher & Sound Toggle */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalCardsCount={currentSet.cards.length}
              filteredCount={filteredCards.length}
              ownedCount={currentSetStats.owned}
              desiredCount={currentSetStats.desiredInSet || 0}
              highlightDesiredMode={highlightDesiredMode}
              setHighlightDesiredMode={setHighlightDesiredMode}
              viewMode={viewMode}
              setViewMode={setViewMode}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />

            {/* View Mode Switching: 3x3 Binder vs Grid */}
            {isLoadingSet ? (
              <div className="py-24 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-200">
                  Cargando cartas de la expansión...
                </p>
                <p className="text-xs text-slate-400">
                  Descargando datos oficiales, códigos europeos y rarezas.
                </p>
              </div>
            ) : viewMode === 'binder' ? (
              <BinderView
                cards={filteredCards}
                setName={currentSet.name}
                setCode={currentSet.code}
                isCardOwned={isCardOwned}
                isCardDesired={isCardDesired}
                highlightDesiredMode={highlightDesiredMode}
                getTotalCopies={getTotalCopies}
                collection={collection}
                onOpenDetail={(card) => setSelectedCardForModal(card)}
                onAddQuick={(card) => addQuickCopy(card)}
                onRemoveQuick={(card) => removeQuickCopy(card)}
                onToggleDesired={toggleDesired}
              />
            ) : (
              <CardGrid
                cards={filteredCards}
                isCardOwned={isCardOwned}
                isCardDesired={isCardDesired}
                highlightDesiredMode={highlightDesiredMode}
                getTotalCopies={getTotalCopies}
                collection={collection}
                onOpenDetail={(card) => setSelectedCardForModal(card)}
                onAddQuick={(card) => addQuickCopy(card)}
                onRemoveQuick={(card) => removeQuickCopy(card)}
                onToggleDesired={toggleDesired}
                onResetFilters={() => setFilters(INITIAL_FILTERS)}
              />
            )}
          </>
        )}

        {/* Tab 2: Mi Colección */}
        {activeTab === 'my-collection' && (
          <MyCollection
            sets={sets}
            collection={collection}
            isCardOwned={isCardOwned}
            isCardDesired={isCardDesired}
            highlightDesiredMode={highlightDesiredMode}
            getTotalCopies={getTotalCopies}
            onOpenDetail={(card) => setSelectedCardForModal(card)}
            onAddQuick={(card) => addQuickCopy(card)}
            onRemoveQuick={(card) => removeQuickCopy(card)}
            onToggleDesired={toggleDesired}
            onGoToSets={() => setActiveTab('sets')}
          />
        )}

        {/* Tab 3: Cartas Deseadas (Wishlist) */}
        {activeTab === 'desired' && (
          <DesiredCardsView
            sets={sets}
            collection={collection}
            isCardOwned={isCardOwned}
            isCardDesired={isCardDesired}
            highlightDesiredMode={highlightDesiredMode}
            setHighlightDesiredMode={setHighlightDesiredMode}
            getTotalCopies={getTotalCopies}
            onOpenDetail={(card) => setSelectedCardForModal(card)}
            onAddQuick={(card) => addQuickCopy(card)}
            onRemoveQuick={(card) => removeQuickCopy(card)}
            onToggleDesired={toggleDesired}
            onGoToSets={() => setActiveTab('sets')}
          />
        )}

        {/* Tab 4: Catálogo Maestro Global (13.000+ Cartas) */}
        {activeTab === 'global-search' && (
          <GlobalSearch
            collection={collection}
            isCardOwned={isCardOwned}
            isCardDesired={isCardDesired}
            highlightDesiredMode={highlightDesiredMode}
            getTotalCopies={getTotalCopies}
            onOpenDetail={(card) => setSelectedCardForModal(card)}
            onAddQuick={(card) => addQuickCopy(card)}
            onRemoveQuick={(card) => removeQuickCopy(card)}
            onToggleDesired={toggleDesired}
            initialQuery={globalSearchInitialQuery}
          />
        )}

        {/* Tab 5: Generador de Mazos Competitivos */}
        {activeTab === 'deck-builder' && (
          <DeckBuilderView
            collection={collection}
            allCards={allAvailableCards}
            isCardDesired={isCardDesired}
            onToggleDesired={toggleDesired}
            onOpenCardDetail={(card) => setSelectedCardForModal(card)}
            initialArchetypeId={selectedArchetypeForDeckBuilder}
          />
        )}

        {/* Tab 6: Guía de Identificación de Rarezas */}
        {activeTab === 'rarity-guide' && (
          <RarityGuideView
            initialRarityCode={selectedRarityForGuide}
            onExploreRarityInCatalog={(rarityCode) => {
              setFilters((prev) => ({ ...prev, rarity: rarityCode }));
              setActiveTab('sets');
            }}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile Camera Scanner safely elevated above bottom bar) */}
      <button
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-20 right-4 z-30 md:hidden p-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-[0_4px_25px_rgba(251,191,36,0.4)] flex items-center justify-center active:scale-90 transition-transform min-w-[50px] min-h-[50px]"
        title="Escanear carta con la cámara"
      >
        <Camera className="w-5 h-5" />
      </button>

      {/* Persistent Mobile Bottom Navigation Bar (Thumb Zone) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        uniqueOwnedCount={globalStats.uniqueOwned}
        desiredCount={globalStats.desiredCount}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6 text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-slate-300">YU-GI-OH! TCG EUROPA</span>
            <span>· Base de datos completa en español</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.db.yugioh-card.com/yugiohdb/?request_locale=es"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>Base de Datos Oficial Konami</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <span>Cartas y marcas registradas © Studio Dice / SHUEISHA, TV TOKYO, KONAMI</span>
          </div>
        </div>
      </footer>

      {/* Mobile OCR Card Scanner Modal */}
      <MobileScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        availableCards={allAvailableCards}
        onAddQuick={addQuickCopy}
        onToggleDesired={toggleDesired}
        isCardDesired={isCardDesired}
      />

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCardForModal}
        onClose={() => setSelectedCardForModal(null)}
        collectionData={selectedCardForModal ? collection[selectedCardForModal.cardCode] || {} : {}}
        isDesired={selectedCardForModal ? isCardDesired(selectedCardForModal.cardCode) : false}
        onToggleDesired={toggleDesired}
        onSetRarityCopies={setRarityCopies}
        onAddQuick={addQuickCopy}
        onRemoveQuick={removeQuickCopy}
        onOpenRarityGuide={(rarityCode) => {
          setSelectedRarityForGuide(rarityCode);
          setSelectedCardForModal(null);
          setActiveTab('rarity-guide');
        }}
        onOpenDeckBuilder={(card) => {
          const foundRecipe = META_DECK_RECIPES.find((r) =>
            r.mainDeck.some((s) => s.nameEs === card.name || s.nameEn === card.nameEn || s.passcode === card.id) ||
            r.extraDeck.some((s) => s.nameEs === card.name || s.nameEn === card.nameEn || s.passcode === card.id)
          );
          if (foundRecipe) {
            setSelectedArchetypeForDeckBuilder(foundRecipe.id);
          }
          setSelectedCardForModal(null);
          setActiveTab('deck-builder');
        }}
      />

      {/* Collection Stats and Backup Modal */}
      <CollectionStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        sets={sets}
        getSetStats={getSetStats}
        globalStats={globalStats}
        onExport={exportCollectionJSON}
        onImport={importCollectionJSON}
        onClear={clearCollection}
      />

      {/* APK Compilation and Mobile Export Guide Modal */}
      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Floating Offline Connectivity Badge */}
      <OfflineIndicator />
    </div>
  );
}
