import React, { useState, useRef, useEffect, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { YugiohCard } from '../types/yugioh';
import { correlateOcrText, MatchResult } from '../services/cardScannerService';
import { soundFx } from '../services/soundFx';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
  Plus,
  Star,
  Layers,
  FlipHorizontal,
} from 'lucide-react';

interface MobileScannerProps {
  isOpen: boolean;
  onClose: () => void;
  availableCards: YugiohCard[];
  onAddQuick: (card: YugiohCard, preferredRarityCode?: string) => void;
  onToggleDesired: (cardCode: string) => void;
  isCardDesired: (cardCode: string) => boolean;
}

export const MobileScanner: React.FC<MobileScannerProps> = ({
  isOpen,
  onClose,
  availableCards,
  onAddQuick,
  onToggleDesired,
  isCardDesired,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);

  // Resultado del escaneo
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [sessionScannedCount, setSessionScannedCount] = useState<number>(0);
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // Iniciar la cámara
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está soportada en este navegador o entorno.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Comprobar soporte de linterna / flash
      const track = newStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
      setHasTorchSupport(Boolean(capabilities?.torch));
    } catch (err: unknown) {
      console.warn('Error al iniciar cámara:', err);
      const msg = err instanceof Error ? err.message : 'No se pudo acceder a la cámara del dispositivo.';
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowedError')
          ? 'Permiso de cámara denegado. Puedes usar el botón de subir foto para escanear.'
          : 'No se pudo activar la cámara. Puedes subir una foto desde la galería.'
      );
    }
  }, [facingMode]);

  // Detener la cámara al cerrar
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setMatchResult(null);
      setAddedSuccess(false);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Alternar linterna (Flash)
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const nextState = !torchEnabled;
      await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchEnabled(nextState);
    } catch (err) {
      console.warn('Error al activar linterna:', err);
    }
  };

  // Alternar cámara frontal / trasera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Preprocesar imagen en canvas para mejorar contraste de OCR
  const preprocessCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Convertir a escala de grises y aumentar contraste
    const contrast = 1.25; // factor de contraste
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      // Luminancia perceptual
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const adjusted = factor * (gray - 128) + 128;
      const clamped = Math.min(255, Math.max(0, adjusted));

      d[i] = clamped;
      d[i + 1] = clamped;
      d[i + 2] = clamped;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  // Ejecutar OCR y correlación sobre el canvas
  const processImageForOcr = async (canvas: HTMLCanvasElement) => {
    setIsProcessing(true);
    setProgressStatus('Iniciando motor OCR de cartas...');
    setProgressPercent(10);
    setMatchResult(null);
    setAddedSuccess(false);

    try {
      const processedCanvas = preprocessCanvas(canvas);

      setProgressStatus('Extrayendo texto de la carta...');
      const result = await Tesseract.recognize(processedCanvas, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgressPercent(20 + Math.round((m.progress || 0) * 60));
            setProgressStatus(`Reconociendo caracteres: ${Math.round((m.progress || 0) * 100)}%`);
          }
        },
      });

      const extractedText = result.data.text || '';
      setRecognizedText(extractedText);
      setProgressPercent(85);
      setProgressStatus('Correlacionando con el catálogo de cartas...');

      const match = await correlateOcrText(extractedText, availableCards);

      setProgressPercent(100);
      if (match) {
        soundFx.playFoilChime();
        setMatchResult(match);
        // Preseleccionar la primera rareza disponible
        setSelectedRarity(match.card.availableRarities[0]?.code || 'C');

        // Añadir copia automáticamente a la colección
        onAddQuick(match.card, match.card.availableRarities[0]?.code);
        setSessionScannedCount((c) => c + 1);
        setAddedSuccess(true);
      } else {
        setProgressStatus('No se pudo identificar la carta con suficiente confianza.');
      }
    } catch (err) {
      console.error('Error durante OCR:', err);
      setProgressStatus('Error al procesar la imagen.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Capturar frame actual del vídeo
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    processImageForOcr(canvas);
  };

  // Procesar imagen subida desde archivo / galería
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          processImageForOcr(canvas);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-0 sm:my-auto max-h-[95dvh] sm:max-h-[90vh] pb-safe">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-slate-100 truncate">
                Escáner OCR de Cartas Físicas
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Apunta al nombre o código de la carta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {sessionScannedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-[11px] font-mono-numbers font-bold">
                +{sessionScannedCount}
              </span>
            )}

            <button
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport / Camera Body */}
        <div className="relative bg-black aspect-[4/3] sm:aspect-[16/10] overflow-hidden flex items-center justify-center">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Hidden Canvas for Frame Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Card Alignment Overlay / Guide Frame */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative w-full max-w-[280px] aspect-[3/4.4] rounded-2xl border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.3)] flex flex-col justify-between p-3 bg-amber-500/5">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-300" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-300" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-300" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-300" />

              {/* Top Title Target Box */}
              <div className="w-full h-7 rounded border border-dashed border-amber-300/80 bg-amber-400/10 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-amber-200 uppercase tracking-wider">
                  Nombre de la Carta
                </span>
              </div>

              {/* Bottom Passcode / Set Code Target Box */}
              <div className="flex items-center justify-between text-[9px] text-amber-300 font-mono-numbers opacity-80">
                <span className="px-1 py-0.5 rounded bg-black/60">ID Konami</span>
                <span className="px-1 py-0.5 rounded bg-black/60">Código Set</span>
              </div>
            </div>
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm text-slate-200 max-w-sm">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Foto de Carta</span>
              </button>
            </div>
          )}

          {/* Scanning / OCR Progress Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-3 z-20">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-100">{progressStatus}</p>
              <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Camera Quick Controls Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {hasTorchSupport && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                  torchEnabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
                title="Linterna / Flash"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={toggleFacingMode}
              className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-300 hover:bg-slate-800 transition-colors"
              title="Cambiar cámara frontal / trasera"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Matched Card Result Card */}
        {matchResult && (
          <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-t border-b border-amber-500/40 space-y-3 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 rounded-lg bg-slate-950 overflow-hidden border border-amber-400/60 shrink-0 shadow-md">
                  <img
                    src={matchResult.card.imageUrlSmall || matchResult.card.imageUrl}
                    alt={matchResult.card.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono-numbers text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {matchResult.card.cardCode}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Detectada ({Math.round(matchResult.confidence * 100)}%)
                    </span>
                  </div>
                  <h4 className="font-cinzel text-sm sm:text-base font-bold text-slate-100 line-clamp-1">
                    {matchResult.card.name}
                  </h4>
                  <p className="text-xs text-slate-400 italic line-clamp-1">
                    {matchResult.card.nameEn} · [{matchResult.card.type}]
                  </p>
                </div>
              </div>

              {/* Desired Button */}
              <button
                onClick={() => {
                  soundFx.playStarClick();
                  onToggleDesired(matchResult.card.cardCode);
                }}
                className={`p-2 rounded-xl border transition-all shrink-0 ${
                  isCardDesired(matchResult.card.cardCode)
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300'
                }`}
                title="Marcar como Deseada"
              >
                <Star
                  className={`w-4 h-4 ${
                    isCardDesired(matchResult.card.cardCode) ? 'fill-slate-950' : ''
                  }`}
                />
              </button>
            </div>

            {/* Rarity Selector for this scanned card */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Rareza a registrar:</span>
                <select
                  value={selectedRarity}
                  onChange={(e) => {
                    setSelectedRarity(e.target.value);
                    onAddQuick(matchResult.card, e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono-numbers text-xs focus:outline-none focus:border-amber-500"
                >
                  {matchResult.card.availableRarities.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              {addedSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-mono-numbers">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  +1 Copia guardada en tu álbum
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          {/* File Upload Alternative */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Subir Foto</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Main Action: Escanear / Capturar Carta */}
          <button
            onClick={captureFrame}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Escaneando...</span>
              </>
            ) : matchResult ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Escanear Siguiente Carta</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Escanear Carta</span>
              </>
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
