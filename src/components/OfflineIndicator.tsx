import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 sm:left-6 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-amber-950/90 border border-amber-500/50 text-amber-200 shadow-2xl backdrop-blur-md animate-bounce"
    >
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      </div>
      <div className="text-xs">
        <p className="font-semibold text-amber-300">Modo Sin Conexión</p>
        <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
          Usando catálogo y cartas en caché
        </p>
      </div>
    </div>
  );
};
