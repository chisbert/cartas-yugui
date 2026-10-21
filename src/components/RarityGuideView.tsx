import React, { useState, useEffect } from 'react';
import { RARITIES_GUIDE_DATA, RarityGuideEntry, RarityHotspot } from '../data/raritiesGuideData';
import { RaritySimulator3D } from './RaritySimulator3D';
import { soundFx } from '../services/soundFx';
import {
  Sparkles,
  Search,
  Layers,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

interface RarityGuideViewProps {
  initialRarityCode?: string;
  onExploreRarityInCatalog: (rarityCode: string) => void;
}

export const RarityGuideView: React.FC<RarityGuideViewProps> = ({
  initialRarityCode,
  onExploreRarityInCatalog,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(initialRarityCode || 'UR');
  const [activeHotspot, setActiveHotspot] = useState<RarityHotspot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Si cambia la rareza inicial desde un modal externo
  useEffect(() => {
    if (initialRarityCode) {
      setSelectedCode(initialRarityCode);
      setActiveHotspot(null);
    }
  }, [initialRarityCode]);

  const currentEntry: RarityGuideEntry =
    RARITIES_GUIDE_DATA.find((r) => r.code === selectedCode) || RARITIES_GUIDE_DATA[3];

  const handleSelectRarity = (entry: RarityGuideEntry) => {
    setSelectedCode(entry.code);
    setActiveHotspot(null);
    if (entry.foilType !== 'none') {
      soundFx.playFoilChime();
    }
  };

  const categories = ['all', 'Básica', 'Holográfica Clásica', 'Edición Especial de Coleccionista'];

  const filteredList = RARITIES_GUIDE_DATA.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 z-10 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Laboratorio de Autenticación & Verificación Física</span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Cómo Identificar la Rareza de tus Cartas
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Aprende a diferenciar con certeza todas las rarezas oficiales de Yu-Gi-Oh! TCG Europa.
            Usa el <strong>Simulador 3D interactivo</strong> para mover la carta bajo la luz, examinar el tratamiento del título, el patrón del foil, los hologramas y las marcas de relieve al tacto.
          </p>
        </div>
      </div>

      {/* Category Tabs & Rarity Strip */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'Todas las Rarezas (12)' : cat}
            </button>
          ))}
        </div>

        {/* Horizontal Rarity Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredList.map((entry) => {
            const isSelected = entry.code === currentEntry.code;
            return (
              <button
                key={entry.code}
                onClick={() => handleSelectRarity(entry)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-mono-numbers font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-amber-300">
                  {entry.code}
                </span>
                <span>{entry.name.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspection Arena (2 Columns: 3D Simulator + Physical Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Col 1: 3D Interactive Simulator (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow-xl">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Simulador 3D en Vivo</span>
            </span>
            <span className="font-mono-numbers text-[11px] text-slate-500">
              Ejemplo: {currentEntry.sampleCardCode}
            </span>
          </div>

          <RaritySimulator3D
            entry={currentEntry}
            activeHotspot={activeHotspot}
            onSelectHotspot={setActiveHotspot}
          />

          {/* Active Hotspot Detail Card */}
          {activeHotspot ? (
            <div className="w-full mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 mb-1 text-amber-300 font-bold">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{activeHotspot.title}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeHotspot.description}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-center text-[11px] text-slate-500">
              Pulsa en los círculos numerados sobre la carta para inspeccionar cada elemento.
            </p>
          )}
        </div>

        {/* Col 2: Detailed Physical Anatomy & Rules (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Quick Tip */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono-numbers text-sm font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentEntry.code}
                </span>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100">
                  {currentEntry.name}
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {currentEntry.rarityTier}
              </span>
            </div>

            {/* Quick Identifier Pill Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5">
                  El Truco Rápido Infalible
                </h4>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {currentEntry.quickTip}
                </p>
              </div>
            </div>
          </div>

          {/* Physical 4-Point Anatomy Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-slate-200 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span>Anatomía Física de la Carta</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Point 1: Title Foil */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Letras del Título</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentEntry.titleFoil}
                </p>
              </div>

              {/* Point 2: Artwork Foil */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Ilustración (Arte)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentEntry.artFoil}
                </p>
              </div>

              {/* Point 3: Frame & Stars */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Marco, Estrellas y Atributo</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentEntry.frameTreatment}
                </p>
              </div>

              {/* Point 4: Tactile Feel */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>4. Textura al Tacto</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentEntry.textureFeel}
                </p>
              </div>
            </div>
          </div>

          {/* Common Confusion Box & Explorer Action */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-0.5">
                  Evita esta Confusión Común
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentEntry.commonConfusion}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                ¿Quieres ver cartas que tengan esta rareza?
              </span>
              <button
                onClick={() => onExploreRarityInCatalog(currentEntry.code)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
              >
                <span>Filtrar cartas {currentEntry.code} en el Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Summary Cheat-Sheet Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Tabla Comparativa Rápida de Rarezas</span>
          </h3>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Guía de bolsillo oficial TCG Europa
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs divide-y divide-slate-800">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Rareza</th>
                <th className="p-3.5">Título</th>
                <th className="p-3.5">Arte</th>
                <th className="p-3.5">Borde / Relieve</th>
                <th className="p-3.5">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
              {RARITIES_GUIDE_DATA.map((r) => {
                const isSelected = r.code === currentEntry.code;
                return (
                  <tr
                    key={r.code}
                    onClick={() => handleSelectRarity(r)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="p-3.5 font-mono-numbers font-bold text-amber-300">
                      {r.code}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-200 whitespace-nowrap">
                      {r.name}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {r.titleFoil.split('.')[0]}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {r.artFoil.split('.')[0]}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {r.textureFeel.split(';')[0]}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRarity(r);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] whitespace-nowrap"
                      >
                        Ver 3D
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
