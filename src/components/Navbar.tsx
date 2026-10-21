import React from 'react';
import { Layers, BookmarkCheck, ExternalLink, Star, Camera, Wand2, Sparkles, Search, Compass, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'sets' | 'my-collection' | 'desired' | 'deck-builder' | 'global-search' | 'rarity-guide';
  setActiveTab: (tab: 'sets' | 'my-collection' | 'desired' | 'deck-builder' | 'global-search' | 'rarity-guide') => void;
  uniqueOwnedCount: number;
  totalCopiesCount: number;
  desiredCount: number;
  onOpenStats: () => void;
  onOpenScanner: () => void;
  onOpenApkModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  uniqueOwnedCount,
  totalCopiesCount,
  desiredCount,
  onOpenStats,
  onOpenScanner,
  onOpenApkModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand Wordmark (Single line, characterful display font) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-400/40">
            <span className="font-cinzel font-black text-slate-950 text-base tracking-tighter">YG</span>
          </div>
          <button
            onClick={() => setActiveTab('sets')}
            className="text-left font-cinzel font-bold text-lg md:text-xl text-slate-100 tracking-tight hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            YU-GI-OH! <span className="text-amber-400">TCG EUROPA</span>
          </button>
        </div>

        {/* Zone 2: Clean single-line text links for desktop */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('sets')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'sets' ? 'text-amber-400 font-semibold' : 'hover:text-slate-100'
            }`}
          >
            Expansiones Europeas
          </button>

          <button
            onClick={() => setActiveTab('my-collection')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'my-collection' ? 'text-amber-400 font-semibold' : 'hover:text-slate-100'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span>Mi Colección ({uniqueOwnedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('desired')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'desired' ? 'text-amber-400 font-semibold' : 'hover:text-slate-100'
            }`}
          >
            <Star className={`w-4 h-4 ${desiredCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span>Deseadas ({desiredCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('deck-builder')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'deck-builder'
                ? 'text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>Generador de Mazos</span>
          </button>

          <button
            onClick={() => setActiveTab('rarity-guide')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'rarity-guide' ? 'text-amber-400 font-semibold' : 'hover:text-slate-100'
            }`}
          >
            <span>Guía de Rarezas</span>
          </button>

          <button
            onClick={() => setActiveTab('global-search')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'global-search' ? 'text-amber-400 font-semibold' : 'hover:text-slate-100'
            }`}
          >
            Buscador EU
          </button>

          <a
            href="https://www.db.yugioh-card.com/yugiohdb/?request_locale=es"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            title="Base de datos oficial de cartas Yu-Gi-Oh! de Konami"
          >
            <span>BD Konami</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Zone 3: Primary Actions (PWA / APK + OCR Camera Scanner + Backup/Stats) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* PWA Install Button (Direct Mobile & Desktop Install) */}
          <PWAInstallButton onOpenApkGuide={onOpenApkModal} />

          {/* Direct APK Compilation Guide */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl border border-slate-700/80 transition-all whitespace-nowrap shrink-0 hover:text-amber-300"
            title="Descargar o compilar APK para móviles Android"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">APK</span>
          </button>

          {/* Mobile OCR Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.25)] transition-all whitespace-nowrap shrink-0 min-h-[36px]"
            title="Escanear carta física con la cámara de tu móvil"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">Escanear</span>
          </button>

          <button
            onClick={onOpenStats}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all whitespace-nowrap shrink-0"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Respaldo ({totalCopiesCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};

