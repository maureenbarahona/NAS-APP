import React, { useState } from 'react';
import { Box, Layers, ShieldCheck, Activity, Copy, Check, Terminal, Cpu, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

export const DockerDeployConsole: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'dockerfile' | 'dockerfileAlpine' | 'npmrc' | 'dockerignore' | 'dockercompose' | 'server'>('dockerfile');
  const [copied, setCopied] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    uptimeSeconds: number;
    memoryMb: number;
    latencyMs: number;
  } | null>({
    status: 'healthy (200 OK)',
    uptimeSeconds: 1420,
    memoryMb: 42.6,
    latencyMs: 4,
  });
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const fileContents = {
    dockerfile: `# 1. Base Stage: Node 22 Debian Slim (glibc nativo - Resuelve error Rolldown/Musl)
FROM node:22-slim AS base
RUN apt-get update && \\
    apt-get install -y --no-install-recommends tini curl && \\
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000

# 2. Dependencies Stage: Layer caching + ERESOLVE protection
FROM base AS dependencies
WORKDIR /app
COPY package.json package-lock.json* bun.lock* .npmrc* ./
RUN npm install --include=dev --legacy-peer-deps --no-audit

# 3. Builder Stage: Compile Vite static assets
FROM dependencies AS builder
WORKDIR /app
COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY public ./public
COPY src ./src
RUN npm run build

# 4. Production Dependencies: Pruned runtime packages
FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* bun.lock* .npmrc* ./
RUN npm install --omit=dev --legacy-peer-deps --no-audit && \\
    npm cache clean --force

# 5. Runner Stage: Least privilege non-root container
FROM base AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY package.json ./
COPY server.ts ./

# Defense-in-depth: Unprivileged node user (UID 1000)
RUN chown -R node:node /app
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "--import", "tsx", "server.ts"]`,

    dockerfileAlpine: `# Alternativa Alpine Linux con parche para rolldown-musl y libc6-compat
FROM node:22-alpine AS base
RUN apk add --no-cache tini curl libc6-compat
WORKDIR /app
ENV NODE_ENV=production PORT=3000

FROM base AS dependencies
WORKDIR /app
COPY package.json package-lock.json* bun.lock* .npmrc* ./
# En Alpine, se instala explícitamente el binario musl para evitar npm bug #4828
RUN npm install --include=dev --legacy-peer-deps --no-audit && \\
    npm install --no-save @rolldown/binding-linux-x64-musl --legacy-peer-deps

FROM dependencies AS builder
WORKDIR /app
COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* bun.lock* .npmrc* ./
RUN npm install --omit=dev --legacy-peer-deps --no-audit && \\
    npm cache clean --force

FROM base AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY package.json ./
COPY server.ts ./
RUN chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:3000/api/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "--import", "tsx", "server.ts"]`,

    npmrc: `# ==============================================================================
# NPM CONFIGURATION BEST PRACTICES FOR DOCKER & CI/CD
# Soluciona el error ERESOLVE (conflictos de peer dependencies en React 19 / Vite 8)
# ==============================================================================
legacy-peer-deps=true
audit=false
fund=false
update-notifier=false`,

    dockerignore: `# Dependencies & Build artifacts
node_modules
dist
build
.git
.github
*.tsbuildinfo

# Secrets & Environment (CRITICAL)
.env
.env.*.local
*.pem
*.key

# Editor metadata
.vscode
.idea
.DS_Store

# Docker meta
Dockerfile*
docker-compose*.yml
docs`,

    dockercompose: `services:
  astrotelemetry-app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    image: astrotelemetry-explorer:latest
    container_name: astrotelemetry-explorer
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    security_opt:
      - no-new-privileges:true
    user: "node"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval: 20s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: "1.50"
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"`,

    server: `// Production Server (server.ts) with Healthcheck & Graceful Shutdown
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

// Healthcheck Probe Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Static Vite Assets & SPA Fallback
app.use(express.static(path.resolve(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(\`App running on port \${PORT}\`);
});

// Graceful Shutdown
const shutdown = (signal: string) => {
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestProbe = () => {
    setIsPinging(true);
    setTimeout(() => {
      setHealthStatus({
        status: 'healthy (200 OK)',
        uptimeSeconds: Math.floor(1420 + Math.random() * 20),
        memoryMb: parseFloat((41.5 + Math.random() * 3).toFixed(1)),
        latencyMs: Math.floor(3 + Math.random() * 4),
      });
      setIsPinging(false);
    }, 450);
  };

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Header Banner */}
      <div className="hud-panel p-5 rounded">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#00e5ff]/20 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <Box className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-wide">
                ARQUITECTURA CLEAN CODE & DOCKER DEPLOY
              </h2>
              <p className="text-xs text-[#8a99ad] mt-0.5">
                Multi-Stage Build · Mínimo Privilegio (Non-root) · PID 1 Tini · Healthcheck Probes · Layer Caching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="label-caps px-2 py-1 rounded bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 text-[10px]">
              OCI COMPLIANT
            </span>
            <span className="label-caps px-2 py-1 rounded bg-[#ff5c00]/15 text-[#ff5c00] border border-[#ff5c00]/30 text-[10px]">
              PRODUCTION GRADE
            </span>
          </div>
        </div>

        {/* 5-Stage Multi-Stage Pipeline Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              stage: 'STAGE 1: BASE',
              image: 'node:22-slim',
              desc: 'Debian glibc + tini + curl',
              badge: 'Zero Musl Bugs',
              color: 'border-[#8a99ad]/30',
            },
            {
              stage: 'STAGE 2: DEPS',
              image: 'package.json layer',
              desc: 'Cache layer devDependencies',
              badge: 'Build Cache',
              color: 'border-[#00e5ff]/40',
            },
            {
              stage: 'STAGE 3: BUILD',
              image: 'Vite & TypeScript',
              desc: 'Compilación a /app/dist',
              badge: 'Artifact Generation',
              color: 'border-[#7c4dff]/40',
            },
            {
              stage: 'STAGE 4: PROD-DEPS',
              image: 'npm --omit=dev',
              desc: 'Pruning runtime packages',
              badge: 'Minimal Footprint',
              color: 'border-[#ff5c00]/40',
            },
            {
              stage: 'STAGE 5: RUNNER',
              image: 'USER node (~110 MB)',
              desc: 'Healthcheck + non-root',
              badge: 'Final Secure Image',
              color: 'border-[#00e5ff] bg-[#00e5ff]/10',
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-3 bg-[#040711]/80 rounded border ${s.color} flex flex-col justify-between`}
            >
              <div>
                <span className="text-[10px] text-[#8a99ad] block font-bold">{s.stage}</span>
                <span className="text-xs text-white font-semibold mt-1 block truncate">
                  {s.image}
                </span>
                <span className="text-[11px] text-[#bac9cc] mt-1 block leading-tight">
                  {s.desc}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#00e5ff] mt-2 block font-semibold">
                {s.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Code Inspector & Health Probe Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Viewer & Tab Selector (8 cols) */}
        <div className="lg:col-span-8 hud-panel p-4 rounded flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            {/* File Switcher Tabs */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setActiveFile('dockerfile')}
                className={`px-3 py-1 rounded transition-colors font-semibold ${
                  activeFile === 'dockerfile'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                    : 'text-[#8a99ad] hover:text-white border border-transparent'
                }`}
              >
                Dockerfile (Slim)
              </button>
              <button
                onClick={() => setActiveFile('dockerfileAlpine')}
                className={`px-3 py-1 rounded transition-colors font-semibold ${
                  activeFile === 'dockerfileAlpine'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                    : 'text-[#8a99ad] hover:text-white border border-transparent'
                }`}
              >
                Dockerfile.alpine (Fix)
              </button>
              <button
                onClick={() => setActiveFile('npmrc')}
                className={`px-3 py-1 rounded transition-colors font-semibold ${
                  activeFile === 'npmrc'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                    : 'text-[#8a99ad] hover:text-white border border-transparent'
                }`}
              >
                .npmrc
              </button>
              <button
                onClick={() => setActiveFile('dockerignore')}
                className={`px-3 py-1 rounded transition-colors font-semibold ${
                  activeFile === 'dockerignore'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                    : 'text-[#8a99ad] hover:text-white border border-transparent'
                }`}
              >
                .dockerignore
              </button>
              <button
                onClick={() => setActiveFile('dockercompose')}
                className={`px-3 py-1 rounded transition-colors font-semibold ${
                  activeFile === 'dockercompose'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                    : 'text-[#8a99ad] hover:text-white border border-transparent'
                }`}
              >
                docker-compose.yml
              </button>
              <button
                onClick={() => setActiveFile('server')}
                className={`px-3 py-1 rounded transition-colors font-semibold ${
                  activeFile === 'server'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                    : 'text-[#8a99ad] hover:text-white border border-transparent'
                }`}
              >
                server.ts
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="btn-flight-cyan px-2.5 py-1 rounded text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00e5ff]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIADO' : 'COPIAR CÓDIGO'}</span>
            </button>
          </div>

          {/* Syntax Box */}
          <div className="relative bg-[#040711] rounded border border-white/10 p-3 max-h-[480px] overflow-y-auto text-xs text-[#bac9cc] leading-relaxed">
            <pre className="whitespace-pre-wrap font-mono">
              <code>{fileContents[activeFile]}</code>
            </pre>
          </div>
        </div>

        {/* Right: Security & Healthcheck Monitor (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Healthcheck Probe Card */}
          <div className="hud-panel p-4 rounded flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00e5ff]" />
                <span className="label-caps text-[#c3f5ff]">
                  CONTAINER HEALTHCHECK PROBE
                </span>
              </div>
              <button
                onClick={handleTestProbe}
                disabled={isPinging}
                className="px-2 py-0.5 bg-[#0b0e17] border border-[#00e5ff]/40 hover:bg-[#00e5ff]/20 text-[#00e5ff] text-[10px] rounded transition-colors"
              >
                {isPinging ? 'TESTING...' : 'PING PROBE'}
              </button>
            </div>

            <div className="text-xs text-[#8a99ad]">
              Endpoint: <strong className="text-white">GET /api/health</strong>
            </div>

            {healthStatus && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-[#040711] border border-white/10 rounded">
                  <span className="text-[10px] text-[#8a99ad] block">STATUS</span>
                  <span className="text-[#00e5ff] font-bold">{healthStatus.status}</span>
                </div>
                <div className="p-2 bg-[#040711] border border-white/10 rounded">
                  <span className="text-[10px] text-[#8a99ad] block">LATENCY</span>
                  <span className="text-white font-bold">{healthStatus.latencyMs} ms</span>
                </div>
                <div className="p-2 bg-[#040711] border border-white/10 rounded">
                  <span className="text-[10px] text-[#8a99ad] block">HEAP MEMORY</span>
                  <span className="text-[#ffb59a] font-bold">{healthStatus.memoryMb} MB</span>
                </div>
                <div className="p-2 bg-[#040711] border border-white/10 rounded">
                  <span className="text-[10px] text-[#8a99ad] block">UPTIME</span>
                  <span className="text-white font-bold">{healthStatus.uptimeSeconds}s</span>
                </div>
              </div>
            )}

            <div className="text-[11px] text-[#8a99ad] border-t border-white/10 pt-2">
              Usado por Kubernetes (liveness/readiness), AWS ECS y Docker Swarm para auto-healing sin downtime.
            </div>
          </div>

          {/* Clean Code Principles Checklist */}
          <div className="hud-panel p-4 rounded flex flex-col gap-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <ShieldCheck className="w-4 h-4 text-[#00e5ff]" />
              <span className="label-caps text-[#c3f5ff]">
                CLEAN CODE AUDIT & BEST PRACTICES
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {[
                { title: 'Least Privilege', desc: 'USER node sin permisos root', ok: true },
                { title: 'Layer Caching', desc: 'package.json copiado antes que src', ok: true },
                { title: 'Multi-Stage Build', desc: 'Sin herramientas de build en prod', ok: true },
                { title: 'PID 1 Tini', desc: 'Reaping de zombies y SIGTERM limpio', ok: true },
                { title: 'Hardened .dockerignore', desc: 'Cero filtración de .env o secrets', ok: true },
                { title: 'Resource Constraints', desc: 'Límites de CPU y memoria en compose', ok: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-1.5 bg-[#040711]/60 rounded border border-white/5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5ff] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-[11px]">{item.title}</strong>
                    <span className="text-[10px] text-[#8a99ad]">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
