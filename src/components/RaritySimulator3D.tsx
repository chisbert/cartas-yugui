import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RarityGuideEntry, RarityHotspot } from '../data/raritiesGuideData';
import { soundFx } from '../services/soundFx';
import { RotateCcw, Play, Pause, SunMedium, Sparkles, HelpCircle } from 'lucide-react';

interface RaritySimulator3DProps {
  entry: RarityGuideEntry;
  activeHotspot: RarityHotspot | null;
  onSelectHotspot: (hotspot: RarityHotspot | null) => void;
}

export const RaritySimulator3D: React.FC<RaritySimulator3DProps> = ({
  entry,
  activeHotspot,
  onSelectHotspot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Auto-rotación para demostrar el brillo
  useEffect(() => {
    if (!isAutoRotating) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let start = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - start) / 1000;
      const angleY = Math.sin(elapsed * 1.5) * 14;
      const angleX = Math.cos(elapsed * 1.5) * -10;
      setRotX(angleX);
      setRotY(angleY);
      setGlarePos({
        x: 50 + (angleY / 14) * 40,
        y: 50 + (angleX / 10) * 40,
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoRotating]);

  // Manejo de movimiento del ratón
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isAutoRotating) setIsAutoRotating(false);
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const nextRotX = ((y - centerY) / centerY) * -18;
      const nextRotY = ((x - centerX) / centerX) * 18;

      setRotX(nextRotX);
      setRotY(nextRotY);
      setGlarePos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });

      if (!isInteracting) {
        setIsInteracting(true);
        if (entry.foilType !== 'none') {
          soundFx.playFoilChime();
        }
      }
    },
    [isAutoRotating, isInteracting, entry.foilType]
  );

  const handleMouseLeave = () => {
    setIsInteracting(false);
    if (!isAutoRotating) {
      setRotX(0);
      setRotY(0);
      setGlarePos({ x: 50, y: 50 });
    }
  };

  // Manejo táctil para móviles
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isAutoRotating) setIsAutoRotating(false);
    if (!cardRef.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const nextRotX = ((y - centerY) / centerY) * -16;
    const nextRotY = ((x - centerX) / centerX) * 16;

    setRotX(nextRotX);
    setRotY(nextRotY);
    setGlarePos({
      x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (y / rect.height) * 100)),
    });
  };

  const handleReset = () => {
    setIsAutoRotating(false);
    setRotX(0);
    setRotY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div className="flex flex-col items-center w-full select-none" ref={containerRef}>
      {/* 3D Card Stage Container */}
      <div
        className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[1/1.45] perspective-[1000px] flex items-center justify-center p-2"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
      >
        {/* Physical 3D Card */}
        <div
          ref={cardRef}
          style={{
            transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: isInteracting ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
          className={`relative w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border transition-all duration-200 ${
            entry.foilType === 'gold_rare'
              ? 'border-yellow-400/90 ring-4 ring-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.35)]'
              : entry.foilType === 'quarter_century'
              ? 'border-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.4)]'
              : entry.foilType === 'ghost_rare'
              ? 'border-slate-300 shadow-[0_0_30px_rgba(255,255,255,0.25)]'
              : 'border-slate-800'
          }`}
        >
          {/* Card Base Artwork */}
          <img
            src={entry.sampleCardImage}
            alt={entry.sampleCardName}
            className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
              entry.foilType === 'ghost_rare'
                ? 'grayscale contrast-125 brightness-110 filter'
                : ''
            }`}
          />

          {/* ========================================================
              FOIL SHADER OVERLAYS SEGÚN EL TIPO DE RAREZA
              ======================================================== */}

          {/* 1. Común: Sin lámina, leve reflejo mate neutro */}
          {entry.foilType === 'none' && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-20"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
              }}
            />
          )}

          {/* 2. Rara: Título plateado brillante reflectante */}
          {entry.foilType === 'silver_title' && (
            <>
              {/* Título Silver Foil */}
              <div
                className="absolute top-[3.8%] left-[7.5%] right-[16%] h-[7.2%] pointer-events-none rounded-sm mix-blend-color-dodge transition-opacity"
                style={{
                  background: `linear-gradient(${105 + rotY * 3}deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.95) 50%, rgba(186,230,253,0.4) 100%)`,
                  opacity: Math.min(1, Math.abs(rotY) / 10 + 0.4),
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.5) 0%, transparent 60%)`,
                }}
              />
            </>
          )}

          {/* 3. Súper Rara: Arte holográfico completo suave */}
          {entry.foilType === 'super_holo' && (
            <div
              className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-color-dodge rounded overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(254, 240, 138, 0.7) 0%, rgba(217, 70, 239, 0.5) 35%, rgba(56, 189, 248, 0.45) 70%, transparent 95%)`,
                opacity: 0.65 + Math.abs(rotX + rotY) / 60,
              }}
            />
          )}

          {/* 4. Ultra Rara: Título dorado + Arte holográfico */}
          {entry.foilType === 'ultra_gold' && (
            <>
              {/* Gold Title Foil */}
              <div
                className="absolute top-[3.8%] left-[7.5%] right-[16%] h-[7.2%] pointer-events-none rounded mix-blend-color-dodge"
                style={{
                  background: `linear-gradient(${115 + rotY * 4}deg, rgba(217, 119, 6, 0.4) 0%, rgba(254, 240, 138, 1) 45%, rgba(245, 158, 11, 0.9) 70%, transparent 100%)`,
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
                }}
              />
              {/* Holo Art Box */}
              <div
                className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-color-dodge rounded"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(253, 224, 71, 0.75) 0%, rgba(236, 72, 153, 0.55) 35%, rgba(14, 165, 233, 0.5) 70%, transparent 95%)`,
                  opacity: 0.75 + Math.abs(rotX + rotY) / 50,
                }}
              />
            </>
          )}

          {/* 5. Secreta Rara: Título arcoíris + líneas diagonales plateadas en el arte */}
          {entry.foilType === 'secret_diagonal' && (
            <>
              {/* Título arcoíris */}
              <div
                className="absolute top-[3.8%] left-[7.5%] right-[16%] h-[7.2%] pointer-events-none rounded mix-blend-color-dodge"
                style={{
                  background: `linear-gradient(${90 + rotY * 5}deg, #f43f5e, #fbbf24, #10b981, #06b6d4, #a855f7)`,
                  opacity: 0.85,
                }}
              />
              {/* Diagonal Foil Stripes */}
              <div
                className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-color-dodge overflow-hidden rounded"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    ${45 + rotY * 2}deg,
                    transparent,
                    transparent 6px,
                    rgba(255, 255, 255, 0.5) 7px,
                    rgba(192, 132, 252, 0.7) 9px,
                    transparent 11px
                  )`,
                  opacity: 0.75,
                }}
              />
              <div
                className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-color-dodge"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(168, 85, 247, 0.5) 40%, transparent 75%)`,
                }}
              />
            </>
          )}

          {/* 6. Quarter Century Secret: Título dorado prismático + Logo 25th + Borde prismático */}
          {entry.foilType === 'quarter_century' && (
            <>
              {/* Título Dorado 25th */}
              <div
                className="absolute top-[3.8%] left-[7.5%] right-[16%] h-[7.2%] pointer-events-none rounded mix-blend-color-dodge"
                style={{
                  background: `linear-gradient(${120 + rotY * 4}deg, #fbbf24 0%, #fff 40%, #f59e0b 80%)`,
                  filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))',
                }}
              />
              {/* Marco y arte con destellos prismáticos */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-60"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    ${-45 + rotY * 2}deg,
                    transparent,
                    transparent 8px,
                    rgba(251, 191, 36, 0.5) 9px,
                    rgba(244, 63, 94, 0.4) 11px,
                    transparent 14px
                  )`,
                }}
              />
              {/* Sello del 25º Aniversario en la caja de texto */}
              <div
                className="absolute bottom-[20%] left-[25%] right-[25%] h-[9%] pointer-events-none flex items-center justify-center font-cinzel font-black text-[10px] tracking-wider text-amber-300 mix-blend-color-dodge border border-amber-400/50 rounded-md bg-amber-950/40 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                style={{
                  opacity: 0.9,
                  transform: `scale(${1 + Math.abs(rotY) / 50})`,
                }}
              >
                25th QUARTER CENTURY
              </div>
            </>
          )}

          {/* 7. Collector's Rare: Bordes con textura grabada + Arte prismático */}
          {entry.foilType === 'collectors' && (
            <>
              {/* Textura en los bordes */}
              <div
                className="absolute inset-[3%] pointer-events-none border-[6px] border-transparent rounded-lg mix-blend-color-dodge opacity-80"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,0.4) 0px,
                    rgba(255,255,255,0.4) 2px,
                    transparent 2px,
                    transparent 5px
                  )`,
                }}
              />
              <div
                className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-color-dodge"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(224, 242, 254, 0.8) 0%, rgba(56, 189, 248, 0.5) 45%, transparent 75%)`,
                  opacity: 0.7,
                }}
              />
            </>
          )}

          {/* 8. Ultimate Rare: Relieve 3D marcado */}
          {entry.foilType === 'ultimate_emboss' && (
            <>
              {/* Efecto de relieve 3D sobre el arte */}
              <div
                className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-overlay rounded overflow-hidden"
                style={{
                  boxShadow: `inset ${(rotY * 0.8).toFixed(1)}px ${(rotX * 0.8).toFixed(1)}px 12px rgba(0,0,0,0.85)`,
                  filter: 'contrast(150%)',
                }}
              />
              <div
                className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-color-dodge opacity-60"
                style={{
                  backgroundImage: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(251, 191, 36, 0.7) 0%, rgba(180, 83, 9, 0.4) 50%, transparent 80%)`,
                }}
              />
            </>
          )}

          {/* 9. Ghost Rare: Monocromático plateado holográfico */}
          {entry.foilType === 'ghost_rare' && (
            <div
              className="absolute top-[18.2%] left-[12%] right-[12%] h-[43.5%] pointer-events-none mix-blend-color-dodge rounded overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.95) 0%, rgba(203, 213, 225, 0.7) 40%, rgba(148, 163, 184, 0.3) 70%, transparent 95%)`,
                opacity: 0.85 + Math.abs(rotY) / 30,
              }}
            />
          )}

          {/* 10. Gold Rare: Marco totalmente dorado */}
          {entry.foilType === 'gold_rare' && (
            <>
              <div
                className="absolute inset-0 pointer-events-none rounded-xl mix-blend-color-dodge border-[7px] border-amber-300"
                style={{
                  background: `linear-gradient(${45 + rotY * 3}deg, rgba(251,191,36,0.3) 0%, rgba(254,240,138,0.7) 50%, rgba(217,119,6,0.3) 100%)`,
                  opacity: 0.8,
                }}
              />
            </>
          )}

          {/* 11. Platinum / Prismatic / Starlight */}
          {(entry.foilType === 'platinum_secret' ||
            entry.foilType === 'prismatic' ||
            entry.foilType === 'starlight') && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-70"
              style={{
                backgroundImage:
                  entry.foilType === 'prismatic'
                    ? `repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.4) 5px), repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.4) 5px)`
                    : `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(192, 132, 252, 0.4) 40%, rgba(56, 189, 248, 0.3) 70%, transparent 90%)`,
              }}
            />
          )}

          {/* Glare universal de luz móvil */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-150"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 65%)`,
              opacity: isInteracting || isAutoRotating ? 0.7 : 0.25,
            }}
          />

          {/* Puntos calientes interactivos (Hotspots) sobre la carta */}
          {entry.hotspots.map((hs) => {
            const isSelected = activeHotspot?.id === hs.id;
            return (
              <button
                key={hs.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(isSelected ? null : hs);
                }}
                style={{
                  left: `${hs.x}%`,
                  top: `${hs.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-20 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg transition-transform ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 scale-125 ring-4 ring-amber-400/50'
                    : 'bg-slate-900/90 text-amber-300 border border-amber-400/80 hover:scale-110'
                }`}
                title={hs.title}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Control Toolbar */}
      <div className="flex items-center gap-3 mt-4">
        {/* Toggle Auto Rotation */}
        <button
          onClick={() => setIsAutoRotating((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isAutoRotating
              ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isAutoRotating ? 'Pausar Giro' : 'Auto-Giro 3D'}</span>
        </button>

        {/* Reset Angle */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
          title="Restablecer posición de la carta"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Centrar</span>
        </button>

        <div className="text-[11px] text-slate-500 font-mono-numbers hidden sm:flex items-center gap-1">
          <SunMedium className="w-3.5 h-3.5 text-amber-400/80" />
          <span>Mueve el cursor para cambiar la luz</span>
        </div>
      </div>
    </div>
  );
};
