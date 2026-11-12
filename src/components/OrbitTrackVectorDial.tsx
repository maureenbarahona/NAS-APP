import React, { useState, useEffect } from 'react';
import { Spacecraft } from '../types/telemetry';

interface OrbitTrackVectorDialProps {
  spacecraft: Spacecraft;
  onAnomalyChange?: (deg: number) => void;
}

export const OrbitTrackVectorDial: React.FC<OrbitTrackVectorDialProps> = ({
  spacecraft,
  onAnomalyChange,
}) => {
  const [anomaly, setAnomaly] = useState(spacecraft.orbitalElements.trueAnomalyDeg);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Sync with spacecraft changes
  useEffect(() => {
    setAnomaly(spacecraft.orbitalElements.trueAnomalyDeg);
  }, [spacecraft.id, spacecraft.orbitalElements.trueAnomalyDeg]);

  // Orbit animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnomaly((prev) => {
        const next = (prev + 0.3 * simSpeed) % 360;
        if (onAnomalyChange) onAnomalyChange(next);
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, onAnomalyChange]);

  const radius = 105;
  const cx = 130;
  const cy = 130;
  const ecc = spacecraft.orbitalElements.eccentricity;
  const isHyperbolic = ecc >= 1.0;

  // Calculate position along orbit
  const rad = (anomaly * Math.PI) / 180;
  // Scaled orbital radius using polar conic equation r = a(1 - e^2)/(1 + e*cos(theta))
  const scale = 80;
  const rNorm = isHyperbolic
    ? Math.min(110, Math.max(35, scale / (1 + 0.8 * Math.cos(rad))))
    : (scale * (1 - Math.min(0.85, ecc) ** 2)) / (1 + Math.min(0.85, ecc) * Math.cos(rad));
  const scX = cx + rNorm * Math.cos(rad);
  const scY = cy + rNorm * Math.sin(rad);

  // Velocity vector tangent angle
  const velAngle = rad + Math.PI / 2 + (ecc > 0.3 ? 0.2 * Math.sin(rad) : 0);
  const velLen = 24;
  const vx = scX + velLen * Math.cos(velAngle);
  const vy = scY + velLen * Math.sin(velAngle);

  // Generate 15-degree calibrated tick marks
  const ticks = Array.from({ length: 24 }).map((_, i) => {
    const angle = i * 15;
    const aRad = (angle * Math.PI) / 180;
    const isMajor = angle % 45 === 0;
    const isQuadrant = angle % 90 === 0;
    const innerR = isQuadrant ? radius - 14 : isMajor ? radius - 10 : radius - 5;
    const outerR = radius;
    const x1 = cx + innerR * Math.cos(aRad);
    const y1 = cy + innerR * Math.sin(aRad);
    const x2 = cx + outerR * Math.cos(aRad);
    const y2 = cy + outerR * Math.sin(aRad);
    const labelX = cx + (radius - 22) * Math.cos(aRad);
    const labelY = cy + (radius - 22) * Math.sin(aRad);

    return { angle, x1, y1, x2, y2, isMajor, isQuadrant, labelX, labelY };
  });

  return (
    <div className="flex flex-col items-center select-none">
      {/* SVG Vector Dial */}
      <div className="relative w-[260px] h-[260px]">
        <svg
          viewBox="0 0 260 260"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(0,229,255,0.18)]"
        >
          {/* Subtle outer bezel */}
          <circle
            cx={cx}
            cy={cy}
            r={radius + 8}
            fill="none"
            stroke="rgba(0, 229, 255, 0.12)"
            strokeWidth="1"
          />
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(0, 229, 255, 0.28)"
            strokeWidth="1.5"
          />
          <circle
            cx={cx}
            cy={cy}
            r={radius - 16}
            fill="none"
            stroke="rgba(138, 153, 173, 0.12)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Calibrated Ticks */}
          {ticks.map((t) => (
            <g key={t.angle}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isQuadrant ? '#00e5ff' : t.isMajor ? '#c3f5ff' : '#8a99ad'}
                strokeWidth={t.isQuadrant ? 2 : t.isMajor ? 1.5 : 1}
                opacity={t.isQuadrant ? 0.9 : t.isMajor ? 0.7 : 0.4}
              />
              {t.isQuadrant && (
                <text
                  x={t.labelX}
                  y={t.labelY + 3}
                  textAnchor="middle"
                  fill="#8a99ad"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                >
                  {t.angle}°
                </text>
              )}
            </g>
          ))}

          {/* Central Body (Earth / Sun / Mars / Jupiter) */}
          <circle
            cx={cx}
            cy={cy}
            r={12}
            fill="#0b0e17"
            stroke="#00e5ff"
            strokeWidth="1.5"
          />
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#00e5ff"
            className="animate-pulse"
          />

          {/* Center Crosshairs */}
          <line
            x1={cx - 18}
            y1={cy}
            x2={cx + 18}
            y2={cy}
            stroke="rgba(0,229,255,0.4)"
            strokeWidth="1"
          />
          <line
            x1={cx}
            y1={cy - 18}
            x2={cx}
            y2={cy + 18}
            stroke="rgba(0,229,255,0.4)"
            strokeWidth="1"
          />

          {/* Trajectory Arc / Ellipse Preview */}
          {!isHyperbolic ? (
            <ellipse
              cx={cx - ecc * 18}
              cy={cy}
              rx={scale}
              ry={scale * Math.sqrt(Math.max(0.2, 1 - ecc * ecc))}
              fill="none"
              stroke="rgba(0, 229, 255, 0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          ) : (
            <path
              d={`M ${cx - 70} ${cy - 80} Q ${cx + 30} ${cy} ${cx - 70} ${cy + 80}`}
              fill="none"
              stroke="rgba(255, 92, 0, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}

          {/* Periapsis (P) & Apoapsis (A) Markers */}
          <g>
            <circle cx={cx + scale * (1 - ecc)} cy={cy} r={3} fill="#00e5ff" />
            <text
              x={cx + scale * (1 - ecc) + 8}
              y={cy + 3}
              fill="#00e5ff"
              fontSize="8"
              fontFamily="JetBrains Mono"
              fontWeight="700"
            >
              Pe
            </text>

            {!isHyperbolic && (
              <>
                <circle cx={cx - scale * (1 + ecc)} cy={cy} r={3} fill="#8a99ad" />
                <text
                  x={cx - scale * (1 + ecc) - 14}
                  y={cy + 3}
                  fill="#8a99ad"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fontWeight="700"
                >
                  Ap
                </text>
              </>
            )}
          </g>

          {/* Spacecraft Position Marker */}
          <line
            x1={cx}
            y1={cy}
            x2={scX}
            y2={scY}
            stroke="rgba(0, 229, 255, 0.25)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Spacecraft Node */}
          <circle
            cx={scX}
            cy={scY}
            r={6}
            fill="#040711"
            stroke="#00e5ff"
            strokeWidth="2"
          />
          <circle
            cx={scX}
            cy={scY}
            r={3}
            fill="#ffffff"
          />

          {/* Velocity Vector Arrow */}
          <line
            x1={scX}
            y1={scY}
            x2={vx}
            y2={vy}
            stroke="#ff5c00"
            strokeWidth="2"
          />
          <circle cx={vx} cy={vy} r={2} fill="#ff5c00" />
        </svg>

        {/* Tactical HUD Angle Tag in center bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-[#0b0e17]/90 border border-[#00e5ff]/30 rounded text-center">
          <span className="label-caps text-[#8a99ad]">ν :</span>
          <span className="font-mono text-xs font-bold text-[#00e5ff] tabular-nums">
            {anomaly.toFixed(1)}°
          </span>
        </div>
      </div>

      {/* Orbit Controls Bar */}
      <div className="w-full mt-3 flex items-center justify-between gap-1.5 px-2.5 py-2 bg-[#0b0e17]/80 border border-[#00e5ff]/20 rounded">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="min-h-[38px] px-3 py-1 text-xs font-mono uppercase font-semibold rounded transition-colors border border-white/20 hover:border-[#00e5ff] text-[#e0e2ef] touch-manipulation flex items-center justify-center"
          >
            {isPlaying ? 'PAUSE' : 'RESUME'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {[1, 5, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`min-h-[38px] px-2.5 py-1 text-xs font-mono uppercase font-semibold rounded transition-colors touch-manipulation flex items-center justify-center ${
                simSpeed === spd
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                  : 'text-[#8a99ad] hover:text-white border border-transparent'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        <button
          onClick={() => setAnomaly(0)}
          className="min-h-[38px] px-2.5 py-1 text-xs font-mono font-semibold text-[#8a99ad] hover:text-[#00e5ff] transition-colors touch-manipulation flex items-center justify-center"
          title="Reset to Periapsis"
        >
          RESET
        </button>
      </div>
    </div>
  );
};
