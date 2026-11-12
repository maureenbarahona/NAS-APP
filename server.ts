/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Clean Code Architecture - Production HTTP Server
 * Layers:
 *   - Configuration & Environment
 *   - Security & Observability Middleware
 *   - Health Check & Liveness Probes
 *   - Static Asset Delivery (Vite Production Build)
 *   - Graceful Lifecycle & Signal Management (SIGTERM/SIGINT)
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run injects PORT=8080 by default; local environments fallback gracefully
const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0'; // Essential for Cloud Run: must bind to all interfaces
const startTime = Date.now();

// -----------------------------------------------------------------------------
// 1. Core Middleware & Security Headers
// -----------------------------------------------------------------------------
app.disable('x-powered-by');
app.use(express.json());

// Basic security and caching headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// -----------------------------------------------------------------------------
// 2. Healthcheck & Observability Endpoints (Cloud Run, K8s & Docker Probes)
// -----------------------------------------------------------------------------
const healthHandler = (_req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      memory: {
        rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      },
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  };

  res.status(200).json(healthData);
};

// Aliases for any container orchestrator probe convention
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/healthz', healthHandler);

// -----------------------------------------------------------------------------
// 3. Static Assets & Client-Side SPA Routing
// -----------------------------------------------------------------------------
// Resolves distPath whether running from root via tsx or from /dist/server.js
const distPath = fs.existsSync(path.join(__dirname, 'index.html'))
  ? __dirname
  : path.resolve(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  // Serve static files with caching policy
  app.use(
    express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        // Immutable cache for fingerprinted assets
        if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          // HTML files must not be cached aggressively
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      },
    })
  );

  // Fallback to index.html for SPA routing
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  // Development or pre-build notice
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>AstroTelemetry Server</title></head>
        <body style="background:#040711;color:#00e5ff;font-family:monospace;padding:2rem;">
          <h1>AstroTelemetry Production Server</h1>
          <p>Health check endpoint active at <a href="/api/health" style="color:#ffffff;">/api/health</a></p>
          <p>Static build not found at /dist. Run 'npm run build' before starting the production container.</p>
        </body>
      </html>
    `);
  });
}

// -----------------------------------------------------------------------------
// 4. Server Initialization & Graceful Shutdown
// -----------------------------------------------------------------------------
const server = app.listen(PORT, HOST, () => {
  console.log(`[INFO] AstroTelemetry server listening on http://${HOST}:${PORT}`);
  console.log(`[INFO] Health check available at http://${HOST}:${PORT}/api/health`);
  console.log(`[INFO] Running in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown handler
const shutdown = (signal: string) => {
  console.log(`[INFO] Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('[INFO] HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  // Force shutdown if connections do not close in time
  setTimeout(() => {
    console.error('[ERROR] Forcing shutdown after 10s timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

export default app;
