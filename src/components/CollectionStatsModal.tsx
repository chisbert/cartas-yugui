import React, { useRef, useState } from 'react';
import { ExpansionSet, YugiohCard } from '../types/yugioh';
import { OFFICIAL_RARITIES } from '../data/rarities';
import { X, Download, Upload, Trash2, Award, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface CollectionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sets: ExpansionSet[];
  getSetStats: (cards: YugiohCard[]) => { total: number; owned: number; percentage: number; totalCopies: number };
  globalStats: {
    uniqueOwned: number;
    totalCopiesCount: number;
    rarityBreakdown: Record<string, number>;
  };
  onExport: () => void;
  onImport: (jsonString: string) => boolean;
  onClear: () => void;
}

export const CollectionStatsModal: React.FC<CollectionStatsModalProps> = ({
  isOpen,
  onClose,
  sets,
  getSetStats,
  globalStats,
  onExport,
  onImport,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImport(content);
      if (success) {
        setImportStatus('¡Colección importada correctamente!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Error al leer el archivo JSON.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col my-0 sm:my-auto pb-safe">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-slate-100">
              Resumen de Colección & Respaldo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Cartas Únicas Obtenidas</span>
              <p className="text-2xl font-bold font-mono-numbers text-amber-400 mt-1">
                {globalStats.uniqueOwned}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Total de Copias Registradas</span>
              <p className="text-2xl font-bold font-mono-numbers text-slate-100 mt-1">
                {globalStats.totalCopiesCount}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Expansiones Rastreadas</span>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-400 mt-1">
                {sets.length}
              </p>
            </div>
          </div>

          {/* Rarity Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Desglose por Rango de Rareza en Europa
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(OFFICIAL_RARITIES).map(([code, def]) => {
                const count = globalStats.rarityBreakdown[code] || 0;
                return (
                  <div
                    key={code}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono-numbers font-bold px-1.5 py-0.5 rounded border ${def.colorClass} ${def.borderClass}`}>
                        {code}
                      </span>
                      <span className="text-xs text-slate-300 truncate max-w-[100px]" title={def.name}>
                        {def.shortName}
                      </span>
                    </div>
                    <span className="font-mono-numbers text-xs font-bold text-slate-200">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress per set */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Progreso por Expansión Europea
            </h4>
            <div className="space-y-2">
              {sets.map((set) => {
                const s = getSetStats(set.cards);
                return (
                  <div key={set.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{set.name}</span>
                      <span className="font-mono-numbers text-amber-400 font-bold">
                        {s.owned}/{set.cards.length} ({s.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup / Export / Import / Reset */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Copia de Seguridad y Portabilidad
            </h4>

            {importStatus && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Exportar Colección (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Importar Respaldo (.json)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 text-xs font-medium transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar Álbum</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-rose-300 font-medium">¿Seguro?</span>
                  <button
                    onClick={() => {
                      onClear();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                  >
                    Sí, vaciar
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1.5 rounded-lg text-slate-400 text-xs hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
