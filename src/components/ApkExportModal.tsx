import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  Code,
  Terminal,
  ExternalLink,
  X,
  FileCode,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPwaInstall?: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  isOpen,
  onClose,
  onTriggerPwaInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'capacitor' | 'downloads'>('quick');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadFile = (filename: string, content: string, contentType = 'application/json') => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const capacitorConfigContent = JSON.stringify(
    {
      appId: 'com.yugioh.deckmaster',
      appName: 'Yu-Gi-Oh! Deck & Card Master EU',
      webDir: 'dist',
      bundledWebRuntime: false,
      server: {
        androidScheme: 'https',
        cleartext: true,
      },
      android: {
        backgroundColor: '#0B0F17',
        allowMixedContent: true,
      },
      plugins: {
        SplashScreen: {
          launchShowDuration: 2000,
          backgroundColor: '#0B0F17',
          showSpinner: false,
          androidScaleType: 'CENTER_CROP',
        },
      },
    },
    null,
    2
  );

  const androidManifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yugioh.deckmaster">

    <!-- Permisos para sincronización y carga offline de cartas -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:screenOrientation="portrait"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const buildScriptContent = `#!/bin/bash
# Script automatizado de compilación para generar APK de Android
echo "=== Compilando Yu-Gi-Oh! Deck Master para Android ==="

# 1. Compilar los archivos de producción web
echo "[1/4] Ejecutando npm run build..."
npm run build

# 2. Instalar dependencias de Capacitor si no existen
echo "[2/4] Verificando dependencias de Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android --save

# 3. Sincronizar activos con el proyecto de Android
echo "[3/4] Sincronizando con Android..."
npx cap add android || true
npx cap sync android

# 4. Abrir en Android Studio para compilar el APK
echo "[4/4] Abriendo Android Studio..."
echo "En Android Studio: Menú 'Build' > 'Build Bundle(s) / APK(s)' > 'Build APK(s)'"
npx cap open android
`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden pb-safe">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                Instalar en Móvil / APK
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                PWA nativa offline y configuración APK para Android
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-6 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'quick'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Método 1: PWA / APK Directo</span>
          </button>

          <button
            onClick={() => setActiveTab('capacitor')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'capacitor'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Método 2: Compilar con Capacitor</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'downloads'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Descarga de Archivos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs sm:text-sm">
          {/* TAB 1: PWA Instantánea / Cloud APK */}
          {activeTab === 'quick' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Opción A: Instalación Directa en tu Teléfono (¡Recomendado!)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Esta aplicación ya está configurada con <strong>Progressive Web App (PWA) de nivel nativo</strong>.
                  Al instalarla desde el navegador de tu móvil, se comporta exactamente igual que un APK tradicional:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-semibold block">📱 Pantalla Completa</span>
                    <span className="text-slate-400 text-[11px]">Sin barra del navegador, con icono propio en la pantalla de inicio.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-semibold block">⚡ 100% Sin Conexión</span>
                    <span className="text-slate-400 text-[11px]">Cartas, imágenes cacheadas y colecciones disponibles sin internet.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-cyan-400 font-semibold block">🔄 Siempre Actualizada</span>
                    <span className="text-slate-400 text-[11px]">Sin necesidad de reinstalar manualmente archivos APK al haber expansiones nuevas.</span>
                  </div>
                </div>

                {onTriggerPwaInstall && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onTriggerPwaInstall();
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Abrir Diálogo de Instalación en este Dispositivo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Opción B: Cloud APK con PWABuilder */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Opción B: Generar APK firmado en la nube (PWABuilder de Microsoft)</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Sin Android Studio
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Si necesitas un archivo <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">.apk</code> o <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">.aab</code> para instalar en un móvil o subir a Google Play Store sin instalar herramientas pesadas:
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  <li>Entra en la herramienta oficial gratuita <a href="https://www.pwabuilder.com/" target="_blank" rel="noreferrer" className="text-amber-400 font-semibold underline inline-flex items-center gap-1">PWABuilder.com <ExternalLink className="w-3 h-3" /></a>.</li>
                  <li>Pega la URL de tu aplicación publicada.</li>
                  <li>Pulsa en <strong>"Build My PWA" ➜ Android ➜ Package</strong>.</li>
                  <li>Descargarás un archivo ZIP con el <strong>APK firmado listo para instalar en cualquier móvil Android</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Capacitor Step-by-Step CLI */}
          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Sigue estos comandos en tu terminal local para convertir el código fuente en un proyecto nativo de Android Studio y generar el APK:
              </p>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                    Compilar los archivos web para producción
                  </span>
                  <button
                    onClick={() => handleCopy('npm run build', 1)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto">
                  npm run build
                </pre>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                    Instalar Capacitor y el motor de Android
                  </span>
                  <button
                    onClick={() => handleCopy('npm install @capacitor/core @capacitor/cli @capacitor/android', 2)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 2 ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto">
                  npm install @capacitor/core @capacitor/cli @capacitor/android
                </pre>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
                    Añadir la plataforma Android y sincronizar
                  </span>
                  <button
                    onClick={() => handleCopy('npx cap add android && npx cap sync', 3)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 3 ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto">
                  npx cap add android && npx cap sync
                </pre>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">4</span>
                    Abrir en Android Studio y generar el APK
                  </span>
                  <button
                    onClick={() => handleCopy('npx cap open android', 4)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 4 ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto">
                  npx cap open android
                </pre>
                <p className="text-[11px] text-slate-400 pt-1">
                  💡 Una vez abierto Android Studio: ve al menú superior <strong>Build ➜ Build Bundle(s) / APK(s) ➜ Build APK(s)</strong>.
                  El archivo generado estará listo en <code className="text-amber-300">android/app/build/outputs/apk/debug/app-debug.apk</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Downloads */}
          {activeTab === 'downloads' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Descarga los archivos de configuración preconfigurados para incorporarlos a tu proyecto local:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <FileCode className="w-4 h-4" />
                      <span>capacitor.config.json</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ID com.yugioh.deckmaster, esquemas https y configuración de pantalla completa.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile('capacitor.config.json', capacitorConfigContent)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <Code className="w-4 h-4" />
                      <span>AndroidManifest.xml</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Permisos de red e internet, orientación retrato y configuración de iconos adaptativos.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile('AndroidManifest.xml', androidManifestContent, 'text/xml')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar XML</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <Terminal className="w-4 h-4" />
                      <span>build-apk.sh</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Script bash automatizado para compilar y sincronizar Android en un solo comando.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile('build-apk.sh', buildScriptContent, 'text/x-sh')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Script</span>
                  </button>
                </div>
              </div>

              {/* Preview of capacitor.config.json */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  Vista previa de capacitor.config.json:
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-44">
                  {capacitorConfigContent}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Iconos de alta resolución (192px y 512px) listos en /public</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
