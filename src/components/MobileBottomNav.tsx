import React, { useState } from 'react';
import {
  Layers,
  BookmarkCheck,
  Star,
  Wand2,
  Menu,
  Sparkles,
  Search,
  Camera,
  Smartphone,
  HardDrive,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'sets' | 'my-collection' | 'desired' | 'deck-builder' | 'global-search' | 'rarity-guide';
  setActiveTab: (tab: 'sets' | 'my-collection' | 'desired' | 'deck-builder' | 'global-search' | 'rarity-guide') => void;
  uniqueOwnedCount: number;
  desiredCount: number;
  onOpenScanner: () => void;
  onOpenApkModal: () => void;
  onOpenStats: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  uniqueOwnedCount,
  desiredCount,
  onOpenScanner,
  onOpenApkModal,
  onOpenStats,
  isMuted = false,
  onToggleMute,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleTabClick = (tab: 'sets' | 'my-collection' | 'desired' | 'deck-builder' | 'global-search' | 'rarity-guide') => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  const isMoreActive = activeTab === 'rarity-guide' || activeTab === 'global-search';

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
      <nav
        aria-label="Navegación móvil inferior"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-slate-800/90 pb-safe md:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          {/* Tab 1: Expansiones / Sets */}
          <button
            onClick={() => handleTabClick('sets')}
            className={`flex flex-col items-center justify-center h-full min-w-[44px] min-h-[44px] transition-all relative ${
              activeTab === 'sets' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Layers className="w-5 h-5 transition-transform active:scale-90" />
              {activeTab === 'sets' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">Sets</span>
          </button>

          {/* Tab 2: Mi Colección */}
          <button
            onClick={() => handleTabClick('my-collection')}
            className={`flex flex-col items-center justify-center h-full min-w-[44px] min-h-[44px] transition-all relative ${
              activeTab === 'my-collection' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <BookmarkCheck className="w-5 h-5 transition-transform active:scale-90" />
              {uniqueOwnedCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono-numbers text-[9px] font-black leading-tight shadow-sm">
                  {uniqueOwnedCount > 999 ? '999+' : uniqueOwnedCount}
                </span>
              )}
              {activeTab === 'my-collection' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">Mi Álbum</span>
          </button>

          {/* Tab 3: Generador de Mazos */}
          <button
            onClick={() => handleTabClick('deck-builder')}
            className={`flex flex-col items-center justify-center h-full min-w-[44px] min-h-[44px] transition-all relative ${
              activeTab === 'deck-builder' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Wand2 className="w-5 h-5 transition-transform active:scale-90" />
              {activeTab === 'deck-builder' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">Mazos</span>
          </button>

          {/* Tab 4: Deseadas */}
          <button
            onClick={() => handleTabClick('desired')}
            className={`flex flex-col items-center justify-center h-full min-w-[44px] min-h-[44px] transition-all relative ${
              activeTab === 'desired' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Star
                className={`w-5 h-5 transition-transform active:scale-90 ${
                  desiredCount > 0 ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
              {desiredCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono-numbers text-[9px] font-black leading-tight shadow-sm">
                  {desiredCount > 99 ? '99+' : desiredCount}
                </span>
              )}
              {activeTab === 'desired' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">Deseadas</span>
          </button>

          {/* Tab 5: Más Menú */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-w-[44px] min-h-[44px] transition-all relative ${
              isMoreActive || isMoreMenuOpen ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5 transition-transform active:scale-90" />
              {isMoreActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">Más</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet for "Más" options */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn md:hidden">
          <div
            className="w-full bg-slate-900 border-t border-slate-700 rounded-t-3xl shadow-2xl p-5 pb-safe space-y-4 animate-slideUp max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-cinzel text-base font-bold text-slate-100">
                Herramientas y Navegación
              </h3>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Rarezas 3D */}
              <button
                onClick={() => handleTabClick('rarity-guide')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  activeTab === 'rarity-guide'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold block">Guía Rarezas 3D</span>
                  <span className="text-[10px] text-slate-400">Simulador de brillos y relieves</span>
                </div>
              </button>

              {/* Buscador EU */}
              <button
                onClick={() => handleTabClick('global-search')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  activeTab === 'global-search'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Search className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="font-bold block">Buscador Global</span>
                  <span className="text-[10px] text-slate-400">13.000+ cartas en español</span>
                </div>
              </button>

              {/* Escáner Cámara */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenScanner();
                }}
                className="p-3 rounded-2xl border bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800 text-left flex flex-col justify-between gap-2"
              >
                <Camera className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold block">Escanear Carta</span>
                  <span className="text-[10px] text-slate-400">Cámara móvil con OCR</span>
                </div>
              </button>

              {/* APK / Instalación */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenApkModal();
                }}
                className="p-3 rounded-2xl border bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-left flex flex-col justify-between gap-2"
              >
                <Smartphone className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold block">Instalar / APK</span>
                  <span className="text-[10px] text-slate-400">PWA offline o Android APK</span>
                </div>
              </button>

              {/* Respaldo JSON */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenStats();
                }}
                className="p-3 rounded-2xl border bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800 text-left flex flex-col justify-between gap-2"
              >
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold block">Respaldo Colección</span>
                  <span className="text-[10px] text-slate-400">Exportar e importar JSON</span>
                </div>
              </button>

              {/* Sonidos On/Off */}
              {onToggleMute && (
                <button
                  onClick={onToggleMute}
                  className="p-3 rounded-2xl border bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800 text-left flex flex-col justify-between gap-2"
                >
                  {!isMuted ? (
                    <Volume2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <span className="font-bold block">Efectos Sonoros</span>
                    <span className="text-[10px] text-slate-400">
                      {!isMuted ? 'Activados' : 'Silenciados'}
                    </span>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMoreMenuOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-xs transition-colors hover:bg-slate-700"
            >
              Cerrar Menú
            </button>
          </div>
        </div>
      )}
    </>
  );
};
