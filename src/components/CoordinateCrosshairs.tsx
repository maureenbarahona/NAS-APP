import React, { useState } from 'react';
import { CelestialTarget } from '../types/telemetry';
import { Target, Crosshair, Sparkles, Compass } from 'lucide-react';

interface CoordinateCrosshairsProps {
  targets: CelestialTarget[];
  activeTarget: CelestialTarget | null;
  onSelectTarget: (target: CelestialTarget) => void;
}

export const CoordinateCrosshairs: React.FC<CoordinateCrosshairsProps> = ({
  targets,
  activeTarget,
  onSelectTarget,
}) => {
  const [reticleOffset, setReticleOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const selected = activeTarget || targets[0];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setReticleOffset({ x, y });
    setIsLocked(false);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    setReticleOffset({ x, y });
    setIsLocked(false);
  };

  const handleLockTarget = (target: CelestialTarget) => {
    onSelectTarget(target);
    setReticleOffset({ x: 0, y: 0 });
    setIsLocked(true);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#7c4dff]/25 pb-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#7c4dff]" />
          <span className="label-caps text-[#d6c9ff]">
            DEEP SKY CELESTIAL TARGETER
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`label-caps px-2 py-0.5 rounded text-[10px] font-mono ${
            isLocked
              ? 'bg-[#7c4dff]/20 text-[#d6c9ff] border border-[#7c4dff]/50'
              : 'bg-[#ff5c00]/20 text-[#ff5c00] border border-[#ff5c00]/50'
          }`}>
            {isLocked ? '● RETICLE LOCKED' : '▲ MANUAL SLEW'}
          </span>
        </div>
      </div>

      {/* Target Selector Bar with 44px touch targets */}
      <div className="flex flex-wrap gap-2">
        {targets.map((t) => {
          const isSelected = selected.id === t.id && isLocked;
          return (
            <button
              key={t.id}
              onClick={() => handleLockTarget(t)}
              className={`min-h-[44px] px-3.5 py-2 text-left font-mono text-xs rounded transition-all flex items-center gap-2 touch-manipulation ${
                isSelected
                  ? 'bg-[#7c4dff]/25 text-[#f1e9ff] border border-[#7c4dff] shadow-[0_0_10px_rgba(124,77,255,0.3)]'
                  : 'bg-[#040711]/60 text-[#8a99ad] hover:text-white border border-white/10 hover:border-white/25'
              }`}
            >
              <Target className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#00e5ff]' : 'text-[#8a99ad]'}`} />
              <span className="truncate max-w-[160px] font-medium">{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Astronomical Celestial Map Stage with Minimalist Reticle Overlay */}
      <div
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasTouch}
        className="relative w-full h-72 sm:h-80 bg-[#040711] rounded border border-[#7c4dff]/25 overflow-hidden cursor-crosshair group touch-none"
      >
        {/* Starfield simulation background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#10132b]/40 via-[#040711] to-[#040711]" />

        {/* Deep sky background stars */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
          <circle cx="15%" cy="25%" r="1" fill="#ffffff" opacity="0.6" />
          <circle cx="28%" cy="75%" r="1.5" fill="#c3f5ff" opacity="0.8" />
          <circle cx="45%" cy="18%" r="1" fill="#ffffff" opacity="0.5" />
          <circle cx="72%" cy="32%" r="2" fill="#ffd59e" opacity="0.9" />
          <circle cx="85%" cy="80%" r="1.2" fill="#ffffff" opacity="0.7" />
          <circle cx="62%" cy="65%" r="1" fill="#c3f5ff" opacity="0.6" />
          <circle cx="18%" cy="50%" r="1.8" fill="#ffffff" opacity="0.8" />
          <circle cx="90%" cy="20%" r="1.5" fill="#f1e9ff" opacity="0.75" />
          <circle cx="38%" cy="40%" r="1" fill="#ffffff" opacity="0.4" />
          <circle cx="55%" cy="85%" r="1.2" fill="#ffffff" opacity="0.5" />

          {/* Coordinate Equatorial Grid Lines */}
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(124,77,255,0.15)" strokeDasharray="3 4" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(124,77,255,0.15)" strokeDasharray="3 4" />
          <circle cx="50%" cy="50%" r="70" fill="none" stroke="rgba(124,77,255,0.12)" strokeDasharray="2 3" />
          <circle cx="50%" cy="50%" r="110" fill="none" stroke="rgba(124,77,255,0.08)" strokeDasharray="4 4" />
        </svg>

        {/* Nebula Glow around Target */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-[#7c4dff]/15 via-[#00e5ff]/10 to-transparent blur-2xl pointer-events-none" />

        {/* Minimalist Coordinate Crosshairs Overlay (centered on offset or target) */}
        <div
          className="absolute pointer-events-none transition-transform duration-150 ease-out"
          style={{
            top: `calc(50% + ${reticleOffset.y}px)`,
            left: `calc(50% + ${reticleOffset.x}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Outer Circular Reticle */}
            <div className="absolute inset-0 rounded-full border border-[#00e5ff]/50 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#7c4dff]/60" />

            {/* Crosshair Horizontal & Vertical Laser Hairlines */}
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent" />
            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[#00e5ff] to-transparent" />

            {/* Corner Targeting Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00e5ff]" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#00e5ff]" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#00e5ff]" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00e5ff]" />

            {/* Center Reticle Point */}
            <div className="w-2 h-2 rounded-full border border-[#00e5ff] bg-white/60 animate-ping" />
            <div className="absolute w-1 h-1 rounded-full bg-[#00e5ff]" />

            {/* Tactical Tag floating beside reticle */}
            <div className="absolute -top-6 left-12 whitespace-nowrap bg-[#040711]/90 border border-[#00e5ff]/40 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#00e5ff] shadow-sm">
              FOV 0.42° · {selected.catalogId}
            </div>
          </div>
        </div>

        {/* Interactive HUD Corner Telemetry Overlay */}
        <div className="absolute top-3 left-3 bg-[#0b0e17]/85 border border-white/10 rounded px-2.5 py-1.5 pointer-events-none font-mono text-xs">
          <div className="flex items-center gap-2 text-[#7c4dff] text-[10px] font-bold">
            <Compass className="w-3 h-3" />
            <span>CELESTIAL EQUATORIAL COORDINATES</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-[11px]">
            <div>
              <span className="text-[#8a99ad]">RA (α): </span>
              <strong className="text-white tabular-nums">{selected.ra}</strong>
            </div>
            <div>
              <span className="text-[#8a99ad]">DEC (δ): </span>
              <strong className="text-white tabular-nums">{selected.dec}</strong>
            </div>
            <div>
              <span className="text-[#8a99ad]">CONST: </span>
              <strong className="text-[#c3f5ff]">{selected.constellation}</strong>
            </div>
            <div>
              <span className="text-[#8a99ad]">APP MAG: </span>
              <strong className="text-[#ffb59a] tabular-nums">{selected.magnitude.toFixed(1)}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Right Reticle Recenter Trigger */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLockTarget(selected);
              }}
              className="px-2.5 py-1 bg-[#7c4dff]/30 border border-[#7c4dff] hover:bg-[#7c4dff] text-white font-mono text-xs rounded transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(124,77,255,0.4)]"
            >
              <Target className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>LOCK TARGET</span>
            </button>
          )}
          <span className="px-2 py-0.5 bg-[#040711]/80 border border-white/10 rounded font-mono text-[10px] text-[#8a99ad]">
            CLICK CANVAS TO SLEW
          </span>
        </div>
      </div>

      {/* Target Scientific Objective Card */}
      <div className="p-3 bg-[#0b0e17]/80 border border-[#7c4dff]/20 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7c4dff]" />
            <span className="font-semibold text-sm text-[#e0e2ef]">{selected.name}</span>
            <span className="text-xs font-mono text-[#8a99ad]">({selected.type})</span>
          </div>
          <p className="text-xs text-[#8a99ad] mt-1">
            {selected.scienceObjective}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <div className="px-2 py-1 bg-[#040711] border border-white/10 rounded">
            <span className="text-[10px] text-[#8a99ad] block">SPECTRAL PEAK</span>
            <span className="text-[#00e5ff] font-bold tabular-nums">
              {selected.spectroscopyPeakNm} nm
            </span>
          </div>
          <div className="px-2 py-1 bg-[#040711] border border-white/10 rounded">
            <span className="text-[10px] text-[#8a99ad] block">DISTANCE</span>
            <span className="text-white font-bold tabular-nums">
              {selected.distanceLy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
