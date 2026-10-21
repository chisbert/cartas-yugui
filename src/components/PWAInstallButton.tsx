import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenApkGuide?: () => void;
  variant?: 'navbar' | 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenApkGuide,
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone/native app mode, don't show the install prompt
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
        <Smartphone className="w-3.5 h-3.5" />
        <span>Versión Móvil</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else if (onOpenApkGuide) {
      onOpenApkGuide();
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
          variant === 'compact'
            ? 'px-2.5 py-1 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg'
            : 'px-3 py-1.5 text-xs text-slate-900 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.25)] border border-amber-300/60'
        }`}
        title="Instalar como aplicación nativa en tu teléfono"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Instalar en iOS' : 'Instalar en Móvil'}</span>
      </button>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-slate-100">Instalar en iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apple requiere Safari para instalar aplicaciones en la pantalla de inicio:
            </p>

            <ol className="text-xs text-slate-300 space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Toca el botón <strong className="text-amber-300 flex items-center gap-1 inline">Compartir <Share2 className="w-3 h-3 inline" /></strong> en la barra inferior de Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Desliza hacia abajo y pulsa <strong className="text-amber-300 flex items-center gap-1 inline">Añadir a pantalla de inicio <PlusSquare className="w-3 h-3 inline" /></strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Pulsa <strong>Añadir</strong> en la esquina superior derecha. ¡Listo!</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
