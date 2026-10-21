# Conversión a APK Móvil y PWA con Modo Offline Completo

Transformación de la aplicación en una experiencia móvil nativa instalable mediante un enfoque dual: Progressive Web App (PWA) instalable directamente en el móvil con caché completa sin conexión (cartas, buscador e imágenes), y suite de configuración Capacitor con guía interactiva y descarga de archivos de compilación para generar el APK de Android.

---

### Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> Decisiones confirmadas por el usuario en la fase de clarificación previa:

- **Método de Instalación Móvil**: Enfoque dual completo — PWA instalable de forma instantánea desde el navegador sin intermediarios (`standalone` nativo) + Configuración y suite de exportación para compilar el APK nativo con Capacitor.
- **Nivel de Funcionamiento Offline**: Caché completa offline de cartas, sets, rarezas, mazos guardados e imágenes de cartas de YGOPRODeck mediante Service Worker y Workbox (`CacheFirst` y `StaleWhileRevalidate`).
- **Guía de Compilación**: Centro interactivo dentro de la app con tutorial paso a paso guiado para generar el archivo APK (mediante Android Studio, CLI de Capacitor o generador de nube) y botón de descarga en 1 clic de los archivos listos (`capacitor.config.json`, `AndroidManifest.xml`, y scripts de compilación).

---

## 1. Visión General y Experiencia Móvil

### Qué Ofrece la Solución
1. **Instalación Directa PWA (1 Toque)**:
   - Botón destacado en el encabezado y menú móvil para instalar la aplicación en Android o iOS con un solo toque.
   - Experiencia de pantalla completa independiente (`display: standalone`), sin barras de navegador, con iconos optimizados de alta resolución y splash screen nativa.
2. **Caché Offline Integral**:
   - Acceso sin cobertura o en modo avión a todo el catálogo de cartas, colecciones guardadas, generador de mazos y guía de rarezas 3D.
   - Indicador discreto de estado de conectividad que informa al usuario cuando está utilizando datos cacheados sin conexión.
3. **Centro de Creación de APK (Capacitor Studio)**:
   - Nueva sección / modal interactivo "Instalar en Móvil / Generar APK".
   - Generación y descarga directa del paquete de configuración nativo para Android.
   - Asistente interactivo paso a paso con comandos listos para copiar, requisitos previos y opciones de compilación rápida (Android Studio local o PWABuilder / Cloud APK en 2 minutos).

---

## 2. Experiencia de Usuario y Diseño Visual

### 2.1. Flujo de Instalación PWA en Móvil
1. El usuario abre la web en su móvil (Chrome, Edge, Samsung Internet, Safari).
2. Se muestra una barra superior o botón flotante estilizado: **"📲 Instalar App en el Móvil"**.
3. Al pulsar:
   - En Android/Chromium: Abre inmediatamente el diálogo nativo de instalación del sistema operativo ("Añadir a la pantalla de inicio").
   - En iOS Safari: Abre un asistente visual ilustrado explicando cómo pulsar "Compartir" y "Añadir a pantalla de inicio".
4. Una vez instalada, la app se abre como una aplicación móvil autónoma con su propio icono en el cajón de aplicaciones y pantalla de carga temática Yu-Gi-Oh!.

### 2.2. Modal y Centro Interactivo "Compilar APK"
1. Pestaña o acceso directo accesible desde el menú superior: **"Descargar / Compilar APK"**.
2. **Selector de Modalidad**:
   - *Método 1 (Instantáneo sin programar)*: PWA Builder oficial para generar APK firmado de Google Play / Android directo en 1 clic.
   - *Método 2 (Capacitor Local)*: Guía paso a paso con comandos automáticos (`npm run build`, `npx cap sync`, `npx cap open android`).
3. **Descarga de Recursos**:
   - Botón para descargar el archivo de configuración `capacitor.config.json` y el manifiesto nativo ya preconfigurado con permisos de almacenamiento y pantalla completa.
4. **Comprobador de Entorno**:
   - Tarjetas interactivas con estados de verificación (PWA lista, Service Worker activo, Manifiesto válido, Caché cargada).

### 2.3. Indicador de Estado de Conectividad
- Notificación pill flotante y minimalista en la esquina inferior cuando se pierde la conexión: *"Modo Sin Conexión activo — Tu catálogo e imágenes se están cargando desde la memoria caché local"*.

---

## 3. Decisiones de Producto y Estrategia Técnica

### 3.1. Arquitectura de Instalación Dual
- **Estrategia Elegida**: Integrar `vite-plugin-pwa` para generar automáticamente el Web App Manifest y el Service Worker optimizado con Workbox, complementado con la configuración formal de `@capacitor/core` y `@capacitor/android`.
- **Por Qué**: Brinda al usuario gratificación instantánea (puede instalar la app en su teléfono inmediatamente sin compilar nada mediante la PWA) y a la vez le proporciona el código y la guía completa para generar el archivo binario `.apk` nativo si desea distribuirlo o instalarlo manualmente.

### 3.2. Estrategia de Caché Offline (Cartas e Imágenes)
- **Estrategia Elegida**:
  - `CacheFirst` para recursos estáticos y fuentes tipográficas con validez extendida (1 año).
  - `StaleWhileRevalidate` con límite de 500 entradas para peticiones de imágenes de cartas de YGOPRODeck (`images.ygoprodeck.com`), garantizando que las cartas visualizadas previamente queden permanentemente disponibles sin red.
  - Almacenamiento local `localStorage` para colecciones del usuario, mazos creados y lista de deseos.

---

## 4. Arquitectura del Sistema y Flujo de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DISPOSITIVO MÓVIL                             │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │     Modo PWA Directo      │      │    APK Android Nativo       │   │
│   │  (Web Standalone Runner)  │      │  (Capacitor WebView Engine) │   │
│   └─────────────┬─────────────┘      └──────────────┬──────────────┘   │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE APLICACIÓN REACT                        │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │   PWAInstallButton    │  │ OfflineToast    │  │  ApkExportModal  │  │
│  │ (beforeinstallprompt) │  │ (Online/Offline)│  │ (Guía y Configs) │  │
│  └───────────┬───────────┘  └────────┬───────┘  └────────┬─────────┘  │
│              └───────────────────────┼───────────────────┘            │
│                                      ▼                                 │
│                     ┌──────────────────────────────────┐               │
│                     │       React App & Módulos        │               │
│                     │ (Buscador, Rarezas 3D, Mazos)    │               │
│                     └────────────────┬─────────────────┘               │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CAPA SERVICE WORKER & STORAGE                     │
│                                                                        │
│  ┌─────────────────────┐   ┌───────────────────┐   ┌────────────────┐  │
│  │ Workbox Runtime SW  │   │  Cache de Cartas  │   │ LocalStorage   │  │
│  │  (vite-plugin-pwa)  │──▶│  e Imágenes YGO   │   │ (Colección &   │  │
│  │                     │   │   (images CDN)    │   │  Mazos YDK)    │  │
│  └─────────────────────┘   └───────────────────┘   └────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Mapeo de Componentes e Interacciones

- **`usePWAInstall`**: Hook personalizado para interceptar el evento nativo `beforeinstallprompt`, detectar modo `standalone` y gestionar compatibilidad específica para iOS WebKit.
- **`PWAInstallButton`**: Botón de acción con badge animado que permite instalar la aplicación al instante; se oculta automáticamente si la aplicación ya se ejecuta instalada.
- **`OfflineIndicator`**: Componente de aviso que reacciona a los eventos de red `window.online` y `window.offline`.
- **`ApkExportModal`**: Asistente interactivo con pestañas de guía (Android Studio vs PWA-to-APK en nube), visor de comandos con botón de copia, y generador de descarga de `capacitor.config.json`.
- **Configuración `vite.config.ts`**: Registro del plugin `VitePWA` con manifiesto completo (iconos 192px, 512px, maskable, colores de tema Yu-Gi-Oh!) y reglas de precaching Workbox.
