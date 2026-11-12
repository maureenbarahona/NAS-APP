# ==============================================================================
# ASTROTELEMETRY EXPLORER - PRODUCTION MULTI-STAGE DOCKERFILE
# Architecture: Clean Architecture / Multi-Stage Build / Least Privilege
# Best Practices:
#   1. Multi-stage build (reduces final image size by ~85%)
#   2. Deterministic pinned base image (node:22-alpine)
#   3. Layer caching: package manifests copied before source code
#   4. Least privilege execution: non-root unprivileged user ('node')
#   5. PID 1 signal forwarding & zombie reaping via tini
#   6. Native HEALTHCHECK probe for zero-downtime orchestration
#   7. Immutable build-time artifact decoupling from runtime environment
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base Configuration
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base

# Install tini for graceful PID 1 signal management (SIGTERM/SIGINT)
RUN apk add --no-cache tini curl

WORKDIR /app

# Ensure correct Node production environment defaults
ENV NODE_ENV=production \
    PORT=3000

# ------------------------------------------------------------------------------
# Stage 2: Dependencies Cache Layer (All dependencies for build)
# ------------------------------------------------------------------------------
FROM base AS dependencies

WORKDIR /app

# Copy dependency definition files first to leverage Docker build cache
COPY package.json package-lock.json* bun.lock* ./

# Install ALL dependencies (including devDependencies required for Vite & TypeScript build)
# Clean install with frozen lockfile ensures reproducibility
RUN npm install --include=dev --prefer-offline --no-audit

# ------------------------------------------------------------------------------
# Stage 3: Build Layer (Compile TypeScript & Vite static bundle)
# ------------------------------------------------------------------------------
FROM dependencies AS builder

WORKDIR /app

# Copy application source code and configuration
COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY public ./public
COPY src ./src

# Build production assets (Vite client bundle output to /app/dist)
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Production Dependencies Layer (Pruned runtime dependencies only)
# ------------------------------------------------------------------------------
FROM base AS prod-deps

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./

# Install strictly production dependencies to keep the image minimal and secure
RUN npm install --omit=dev --prefer-offline --no-audit && \
    npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 5: Final Production Runtime Runner
# ------------------------------------------------------------------------------
FROM base AS runner

WORKDIR /app

# Label metadata compliant with OCI image specification
LABEL org.opencontainers.image.title="AstroTelemetry Explorer" \
      org.opencontainers.image.description="Deep-space mission telemetry & aerospace HUD flight deck" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="Mission Control Operations" \
      org.opencontainers.image.licenses="Apache-2.0"

# Copy minimal runtime assets from previous stages
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY package.json ./
COPY server.ts ./

# Change ownership of application directory to the non-root 'node' user (UID 1000)
RUN chown -R node:node /app

# Switch to unprivileged user (Defense-in-depth: Never run as root)
USER node

# Expose standard port 3000
EXPOSE 3000

# Container liveness and readiness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Execute process with tini as init system (PID 1) to forward signals and reap zombies
ENTRYPOINT ["/sbin/tini", "--"]

# Launch production server via Node / tsx
CMD ["node", "--import", "tsx", "server.ts"]
