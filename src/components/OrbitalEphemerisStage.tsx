import React, { useState, useEffect, useRef } from 'react';
import { Spacecraft } from '../types/telemetry';
import { Maximize2, RotateCcw, Eye, Play, Pause, Compass } from 'lucide-react';

interface OrbitalEphemerisStageProps {
  spacecraft: Spacecraft;
}

export const OrbitalEphemerisStage: React.FC<OrbitalEphemerisStageProps> = ({ spacecraft }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'oblique' | 'topDown' | 'side'>('oblique');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [orbitAngle, setOrbitAngle] = useState<number>(spacecraft.orbitalElements.trueAnomalyDeg);
  const [zoom, setZoom] = useState<number>(1);

  // Sync initial angle on spacecraft change
  useEffect(() => {
    setOrbitAngle(spacecraft.orbitalElements.trueAnomalyDeg);
  }, [spacecraft.id, spacecraft.orbitalElements.trueAnomalyDeg]);

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setOrbitAngle((prev) => (prev + dt * 15) % 360);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          const cx = width / 2;
          const cy = height / 2;
          const ecc = spacecraft.orbitalElements.eccentricity;
          const isHyperbolic = ecc >= 1.0;

          // Background deep space grid
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
          ctx.lineWidth = 1;
          const gridSize = 40 * zoom;
          for (let x = (cx % gridSize); x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = (cy % gridSize); y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Perspective scaling
          const pitch = viewMode === 'topDown' ? 1.0 : viewMode === 'side' ? 0.25 : 0.65;
          const baseRadius = 140 * zoom;

          // Draw Orbit Trajectory Path
          ctx.save();
          ctx.translate(cx, cy);

          // Orbit trajectory ellipse or hyperbola
          ctx.beginPath();
          if (!isHyperbolic) {
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            const a = baseRadius;
            const b = baseRadius * Math.sqrt(Math.max(0.1, 1 - ecc * ecc)) * pitch;
            const focusOffset = a * ecc;
            ctx.ellipse(-focusOffset, 0, a, b, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = 'rgba(255, 92, 0, 0.45)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            for (let deg = -80; deg <= 80; deg += 4) {
              const rRad = (deg * Math.PI) / 180;
              const r = (baseRadius * 0.7) / (1 + 0.8 * Math.cos(rRad));
              const px = r * Math.cos(rRad) - 60;
              const py = r * Math.sin(rRad) * pitch;
              if (deg === -80) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Central Celestial Body (e.g., Earth / Sun / Mars / Jupiter)
          const bodyGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
          if (spacecraft.centralBody === 'Earth') {
            bodyGrad.addColorStop(0, '#60a5fa');
            bodyGrad.addColorStop(0.6, '#1e3a8a');
            bodyGrad.addColorStop(1, '#0b0e17');
          } else if (spacecraft.centralBody === 'Sun') {
            bodyGrad.addColorStop(0, '#ffffff');
            bodyGrad.addColorStop(0.4, '#f59e0b');
            bodyGrad.addColorStop(1, '#b45309');
          } else if (spacecraft.centralBody === 'Mars') {
            bodyGrad.addColorStop(0, '#fca5a5');
            bodyGrad.addColorStop(0.6, '#b91c1c');
            bodyGrad.addColorStop(1, '#450a0a');
          } else {
            bodyGrad.addColorStop(0, '#fed7aa');
            bodyGrad.addColorStop(0.6, '#c2410c');
            bodyGrad.addColorStop(1, '#431407');
          }

          // Body atmosphere glow
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fillStyle = bodyGrad;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Central Body label
          ctx.fillStyle = '#c3f5ff';
          ctx.font = '600 10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(spacecraft.centralBody.toUpperCase(), 0, 34);

          // Calculate current spacecraft location along trajectory
          const theta = (orbitAngle * Math.PI) / 180;
          let scR = baseRadius;
          if (!isHyperbolic) {
            scR = (baseRadius * (1 - Math.min(0.85, ecc) ** 2)) / (1 + Math.min(0.85, ecc) * Math.cos(theta));
          } else {
            scR = Math.min(baseRadius * 1.5, Math.max(baseRadius * 0.4, (baseRadius * 0.7) / (1 + 0.8 * Math.cos(theta))));
          }
          const scX = scR * Math.cos(theta);
          const scY = scR * Math.sin(theta) * pitch;

          // Earth-Ground link laser line
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(scX, scY);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Velocity vector
          const vAngle = theta + Math.PI / 2;
          const vx = scX + 32 * Math.cos(vAngle);
          const vy = scY + 32 * Math.sin(vAngle) * pitch;

          ctx.beginPath();
          ctx.moveTo(scX, scY);
          ctx.lineTo(vx, vy);
          ctx.strokeStyle = '#ff5c00';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Velocity arrow head
          ctx.beginPath();
          ctx.arc(vx, vy, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ff5c00';
          ctx.fill();

          // Spacecraft Halo & Node
          ctx.beginPath();
          ctx.arc(scX, scY, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(scX, scY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#00e5ff';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Spacecraft label callout
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 11px JetBrains Mono';
          ctx.textAlign = 'left';
          ctx.fillText(spacecraft.callsign, scX + 16, scY - 8);

          ctx.fillStyle = '#00e5ff';
          ctx.font = '500 9px JetBrains Mono';
          ctx.fillText(`${spacecraft.velocityKmS.toFixed(2)} km/s · ν ${orbitAngle.toFixed(0)}°`, scX + 16, scY + 6);

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, viewMode, orbitAngle, zoom, spacecraft]);

  return (
    <div className="hud-panel p-4 rounded flex flex-col gap-3">
      {/* Viewport Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00e5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#00e5ff]" />
          <span className="label-caps text-[#c3f5ff]">
            ORBITAL TRAJECTORY VISUALIZER
          </span>
          <span className="text-[#8a99ad] text-xs">·</span>
          <span className="font-mono text-xs text-[#8a99ad] hidden sm:inline">
            {spacecraft.trajectoryDescription}
          </span>
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-[#040711]/80 rounded border border-white/10 text-[10px] font-mono">
            <button
              onClick={() => setViewMode('oblique')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'oblique'
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-semibold'
                  : 'text-[#8a99ad] hover:text-white'
              }`}
            >
              3D OBLIQUE
            </button>
            <button
              onClick={() => setViewMode('topDown')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'topDown'
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-semibold'
                  : 'text-[#8a99ad] hover:text-white'
              }`}
            >
              TOP-DOWN (POLAR)
            </button>
            <button
              onClick={() => setViewMode('side')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'side'
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-semibold'
                  : 'text-[#8a99ad] hover:text-white'
              }`}
            >
              IN-PLANE
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded bg-[#0b0e17] border border-white/10 text-[#00e5ff] hover:bg-[#00e5ff]/20 transition-colors"
            title={isPlaying ? 'Pause orbital propagation' : 'Resume propagation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setZoom((z) => Math.max(0.6, Math.min(1.8, z === 1 ? 1.4 : 1)))}
            className="p-1.5 rounded bg-[#0b0e17] border border-white/10 text-[#8a99ad] hover:text-white transition-colors"
            title="Toggle Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full h-80 bg-[#040711] rounded border border-white/10 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full block"
        />

        {/* HUD Inset Corner Reticle Overlay */}
        <div className="absolute top-2 left-2 pointer-events-none font-mono text-[11px] bg-[#0b0e17]/85 border border-[#00e5ff]/20 px-2 py-1 rounded">
          <div className="text-[#8a99ad]">DISTANCE TO EARTH:</div>
          <div className="text-white font-bold text-sm tabular-nums">
            {spacecraft.distanceDisplay}
          </div>
          <div className="text-[10px] text-[#00e5ff]">
            1-WAY LIGHT TIME: {spacecraft.lightDelaySeconds.toFixed(2)}s
          </div>
        </div>

        {/* Orbit State Vectors Inset */}
        <div className="absolute bottom-2 right-2 pointer-events-none font-mono text-[10px] bg-[#0b0e17]/85 border border-[#00e5ff]/20 px-2 py-1 rounded text-right">
          <div>
            <span className="text-[#8a99ad]">SEMI-MAJOR AXIS: </span>
            <span className="text-white font-bold tabular-nums">
              {spacecraft.orbitalElements.semiMajorAxisKm.toLocaleString()} km
            </span>
          </div>
          <div>
            <span className="text-[#8a99ad]">ECCENTRICITY (e): </span>
            <span className="text-[#00e5ff] font-bold tabular-nums">
              {spacecraft.orbitalElements.eccentricity.toFixed(4)}
            </span>
          </div>
          <div>
            <span className="text-[#8a99ad]">INCLINATION (i): </span>
            <span className="text-white font-bold tabular-nums">
              {spacecraft.orbitalElements.inclinationDeg}°
            </span>
          </div>
        </div>
      </div>

      {/* Ephemeris Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">CURRENT VELOCITY</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-[#00e5ff] tabular-nums">
              {spacecraft.velocityKmS.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#8a99ad]">km/s</span>
          </div>
        </div>

        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">PERIAPSIS (Pe)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-white tabular-nums">
              {spacecraft.orbitalElements.periapsisKm.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#8a99ad]">km</span>
          </div>
        </div>

        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">APOAPSIS (Ap)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-white tabular-nums">
              {spacecraft.orbitalElements.apoapsisKm > 99999999
                ? 'ESCAPE'
                : `${spacecraft.orbitalElements.apoapsisKm.toLocaleString()} km`}
            </span>
          </div>
        </div>

        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">ORBITAL PERIOD</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-[#c3f5ff] tabular-nums">
              {spacecraft.orbitalElements.periodHours > 90000
                ? 'HYPERBOLIC'
                : `${(spacecraft.orbitalElements.periodHours / 24).toFixed(1)} d`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
