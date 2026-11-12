# 🚀 AstroTelemetry Explorer

> **Demo interactivo desarrollado para NASA Space Apps Challenge por Maureen Barahona**  
> 🌐 Portfolio & Contacto: [maureenbarahona.foo](https://maureenbarahona.foo)

---

## 🛰️ Acerca del Proyecto

**AstroTelemetry Explorer** es una plataforma de telemetría de misiones espaciales profundas y consola HUD (Heads-Up Display) de grado aeroespacial. Fue diseñada y desarrollada por **Maureen Barahona** como prototipo de demostración para el hackathon internacional **NASA Space Apps Challenge**.

La aplicación fusiona **glassmorphism técnico contemporáneo** con **instrumentación táctica HUD**, ofreciendo visualizaciones científicas en tiempo real de efemérides orbitales, propagación de ondas de radiofrecuencia (RF), cálculo de maniobras de propulsión ($\Delta v$) y seguimiento de sensores de espacio profundo de la NASA y la ESA.

---

## 👨‍🚀 Misiones Espaciales Monitoreadas

1. **James Webb Space Telescope (JWST):** Órbita Halo en el punto de Lagrange Sol-Tierra L2 (1.515 M km), enlace Ka-Band a 28 Mbps con Goldstone DSS-14, refrigeración criogénica MIRI a 6.4 K.
2. **Voyager 1:** Frontera interestelar / Heliopausa (24.483 mil millones de km / 163.65 AU), retardo de señal de 22.6 horas luz, portadora S-band ultra-débil (-158.4 dBm) con Madrid DSS-63.
3. **Europa Clipper:** Trayectoria heliocéntrica hacia Júpiter (628 M km), enlace Ka-band con Canberra DSS-43, radar de penetración de hielo REASON.
4. **Artemis II Orion:** Vuelo circumlunar tripulado (384,400 km), enlace óptico láser O2O (1550 nm) a 622 Mbps, maniobras del Módulo de Servicio Europeo (ESM).
5. **Mars Reconnaissance Orbiter (MRO):** Órbita areocéntrica heliosincrónica a 400 km de altitud en Marte, enlace X-band de alta resolución para la cámara HiRISE y relé de Perseverance.
6. **Parker Solar Probe:** Órbita perihelio extrema en la corona solar interna (6.12 M km del Sol), velocidad récord de 176.4 km/s y escudo térmico a 1,380 °C.

---

## 🎛️ Componentes Especializados del HUD Aeroespacial

- **Orbit Track Vector Dial:** Dial polar vectorial SVG con marcas calibradas cada 15 grados, indicador de anomalía verdadera ($\nu$), periapsis ($Pe$), apoapsis ($Ap$) y multiplicador de simulación orbital ($1\times, 5\times, 20\times$).
- **Spectrum Frequency Waveform:** Visualizador espectral RF con barras lineales dinámicas en *Telemetry Cyan* y *Propulsion Amber*, analizador de constelación $I/Q$ (QPSK/BPSK), selector de banda (S, X, Ka, Óptica) y sintetizador de tono de audio demodulado vía Web Audio API.
- **Coordinate Crosshairs & Deep Sky Targeter:** Retícula táctica de apuntamiento con coordenadas ecuatoriales celestes (Ascensión Recta $\alpha$, Declinación $\delta$), brillo aparente, constelación y pico espectral en nanómetros.
- **Orbital Ephemeris Stage:** Canvas interactivo 2D/3D con modos de cámara (3D Oblique, Polar Top-Down, In-Plane), trazado cónico de trayectorias y vector de comunicación láser con la Tierra.
- **Flight Sequencer & Delta-V Planner:** Calculador interactivo de maniobras según la ecuación del cohete de Tsiolkovsky, con simulación de ignición, cuenta regresiva, estela de empuje y deducción de masa de propelente.
- **Subsystems Telemetry Matrix:** Monitoreo del bus de voltaje principal, loop de helio criogénico, desaturación de momento angular de volantes de inercia (RWA) y enganche del Star Tracker.

---

## 🏗️ Arquitectura de Despliegue Clean Code (Docker & Cloud Run)

El proyecto cuenta con una arquitectura de despliegue de nivel empresarial lista para producción:

- **Multi-Stage Build en 5 fases:** `base` (Debian Slim con glibc) $\rightarrow$ `dependencies` $\rightarrow$ `builder` $\rightarrow$ `prod-deps` $\rightarrow$ `runner`.
- **Mitigación del bug de npm #4828:** Uso de `node:22-slim` con `glibc` estándar para garantizar compatibilidad nativa con binarios Rust/C++ de Vite 8 y Rolldown.
- **Mínimo Privilegio de Seguridad:** Ejecución bajo el usuario no-root `USER node` (UID 1000).
- **Gestión de Señales Unix (PID 1):** Inclusión de `tini` para captura limpia de `SIGTERM` y reaping de procesos zombi.
- **Compatibilidad Nativa con Google Cloud Run:**
  - El servidor `server.ts` se precompila en tiempo de build con `esbuild` hacia `dist/server.js`, logrando un tiempo de arranque en frío (*cold start*) de **< 20 milisegundos**.
  - Enlace de red en `0.0.0.0` y soporte para el puerto dinámico inyectado por Google Cloud (`PORT=8080`).
  - Sondas de salud en `/api/health`, `/health` y `/healthz`.

---

## 🚀 Ejecución y Despliegue

### 1. Desarrollo Local
```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Iniciar servidor de desarrollo en puerto 3000
npm run dev
```

### 2. Construcción del Contenedor Docker
```bash
# Compilar imagen de producción optimizada
DOCKER_BUILDKIT=1 docker build -t astrotelemetry-explorer:latest .

# Ejecutar localmente en el puerto 8080
docker run -d -p 8080:8080 --name astrotelemetry astrotelemetry-explorer:latest
```

### 3. Con Docker Compose
```bash
docker compose up -d --build
```

### 4. Despliegue en Google Cloud Run
```bash
# Despliegue directo con Google Cloud SDK
gcloud run deploy astrotelemetry-explorer \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

---

## 👩‍💻 Autora & Créditos

- **Desarrolladora:** Maureen Barahona
- **Sitio Web:** [https://maureenbarahona.foo](https://maureenbarahona.foo)
- **Evento:** NASA Space Apps Challenge
- **Licencia:** Apache-2.0
