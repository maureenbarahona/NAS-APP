# Arquitectura Clean Code y Best Practices para Deploy con Dockerfile

Esta guía detalla la arquitectura limpia, modular y de nivel producción para construir, optimizar y desplegar aplicaciones web y servicios backend a partir de un **Dockerfile**.

---

## 1. Los 7 Pilares de Clean Code aplicados a Dockerfiles

### 1.1 Principio de Responsabilidad Única (SRP) en Multi-Stage Builds
Un solo archivo `Dockerfile` divide sus etapas con propósitos aislados e independientes:
1. **`base`**: Imagen base mínima oficial (`node:22-slim` con Debian Bookworm) con `tini` y `curl`. Utiliza `glibc` estándar para garantizar compatibilidad total con binarios nativos en Rust/C++ (Vite 8, Rolldown, esbuild) y evitar el bug de npm #4828 presente en Alpine.
2. **`dependencies`**: Descarga e instalación de dependencias completas (incluidas `devDependencies` para compilar TypeScript y Vite).
3. **`builder`**: Compilación de la aplicación estática y de servidor.
4. **`prod-deps`**: Instalación limpia únicamente de librerías de producción (`--omit=dev`).
5. **`runner`**: Contenedor final hiper-ligero (sin herramientas de compilación, sin código fuente TypeScript, solo artefactos compilados y dependencias de producción).

*Resultado:* El tamaño final de la imagen se reduce de **~1.2 GB** a menos de **110 MB**, eliminando vulnerabilidades en herramientas de desarrollo.

---

### 1.2 Estrategia de Caché de Capas (Layer Caching Optimization)
Docker ejecuta cada instrucción como una capa inmutable:
- **MAL:**
  ```dockerfile
  COPY . .
  RUN npm install
  ```
  *(Cualquier cambio en un archivo `.tsx` o `.css` invalida el caché de `npm install`, descargando todos los paquetes de nuevo).*
- **BIEN (Clean Code):**
  ```dockerfile
  COPY package.json package-lock.json* ./
  RUN npm install --include=dev --prefer-offline --no-audit
  COPY . .
  RUN npm run build
  ```
  *(Las dependencias se cachean; solo se reinstalan si cambia `package.json`).*

---

### 1.3 Principio de Mínimo Privilegio (Least Privilege Security)
Por defecto, los contenedores corren como `root` dentro de su namespace. Si un atacante compromete la aplicación con una vulnerabilidad (e.g. ejecución remota de código), adquiere privilegios de root en el contenedor.
- **Solución Clean Code:**
  ```dockerfile
  RUN chown -R node:node /app
  USER node
  ```
  Se ejecuta bajo el usuario sin privilegios `node` (UID 1000).

---

### 1.4 Manejo de PID 1, Reaping de Zombis y Graceful Shutdown
En Linux, el proceso con **PID 1** tiene la responsabilidad de cosechar procesos huérfanos ("zombies") y reenviar señales del sistema operativo (`SIGTERM`, `SIGINT`). Node.js **no** fue diseñado para actuar como PID 1.
- Si ejecutas `CMD ["node", "server.js"]` sin un init system, al hacer `docker stop`, Node ignorará `SIGTERM` hasta que Docker fuerce un `SIGKILL` a los 10 segundos, interrumpiendo conexiones abiertas de usuarios bruscamente.
- **Solución:**
  Instalar `tini` como entrypoint:
  ```dockerfile
  RUN apk add --no-cache tini
  ENTRYPOINT ["/sbin/tini", "--"]
  CMD ["node", "--import", "tsx", "server.ts"]
  ```

---

### 1.5 Observabilidad y Probes de Salud (Healthcheck)
Los orquestadores (Docker Swarm, Kubernetes, AWS ECS, Google Cloud Run) necesitan saber cuándo el contenedor está listo para recibir tráfico (**Readiness**) y si sigue vivo (**Liveness**):
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

En el servidor (`server.ts`):
```typescript
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
  });
});
```

---

### 1.6 Blindaje de Contexto (.dockerignore)
Evita transferir archivos innecesarios al Docker daemon:
- No enviar `.git` (ahorra cientos de megabytes en el contexto de build).
- No enviar `node_modules` locales (evita mezclar binarios de tu SO anfitrión con Linux Alpine).
- **Prohibido enviar `.env` o llaves `.pem`** (previene filtración accidental de credenciales).

---

### 1.7 Doce Factores (12-Factor App) & Desacoplamiento de Entornos
- La imagen Docker debe ser **inmutable**: la misma imagen construida en CI se prueba en Staging y se despliega en Producción.
- Las variables de entorno (`PORT`, `DATABASE_URL`, `API_KEY`) se inyectan en **tiempo de ejecución**, nunca en tiempo de compilación.

---

## 2. Comandos Esenciales para Operación

### 2.1 Construcción Local con BuildKit
```bash
# Habilitar BuildKit para compilación concurrente de stages
export DOCKER_BUILDKIT=1

# Construir la imagen
docker build -t astrotelemetry-explorer:latest .
```

### 2.2 Ejecución con Restricciones de Seguridad y Recursos
```bash
docker run -d \
  --name astrotelemetry \
  --restart unless-stopped \
  -p 3000:3000 \
  --memory="512m" \
  --cpus="1.5" \
  --security-opt no-new-privileges:true \
  astrotelemetry-explorer:latest
```

### 2.3 Inspección de Salud y Logs
```bash
# Ver estado del contenedor y su healthcheck
docker ps

# Ver logs en streaming
docker logs -f astrotelemetry

# Verificar endpoint de salud
curl -i http://localhost:3000/api/health
```

---

## 3. Despliegue con Docker Compose
Para entornos de prueba local o servidores individuales:
```bash
# Levantar en segundo plano con reconstrucción
docker compose up -d --build

# Ver logs combinados
docker compose logs -f

# Detener ordenadamente
docker compose down
```
