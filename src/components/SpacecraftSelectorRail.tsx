import React from 'react';
import { Spacecraft } from '../types/telemetry';
import { Rocket, Satellite, Compass } from 'lucide-react';

interface SpacecraftSelectorRailProps {
  spacecraftList: Spacecraft[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const SpacecraftSelectorRail: React.FC<SpacecraftSelectorRailProps> = ({
  spacecraftList,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="label-caps text-[#8a99ad]">ACTIVE FLIGHT PLATFORMS</span>
        <span className="text-[10px] font-mono text-[#00e5ff] font-semibold">
          {spacecraftList.length} IN TRACK
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {spacecraftList.map((sc) => {
          const isSelected = sc.id === selectedId;
          const isBurn = sc.status === 'ACTIVE BURN';
          const isStandby = sc.status === 'STANDBY';

          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc.id)}
              className={`p-3 text-left rounded transition-all relative border text-xs font-mono group ${
                isSelected
                  ? 'bg-[#181b25] border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-[#0b0e17]/80 hover:bg-[#181b25]/60 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Corner accent bracket for selected item */}
              {isSelected && (
                <>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00e5ff]" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00e5ff]" />
                </>
              )}

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-white group-hover:text-[#c3f5ff] text-sm">
                  {sc.name}
                </span>

                {/* Status Badge */}
                <span
                  className={`label-caps px-1.5 py-0.5 rounded text-[9px] ${
                    isBurn
                      ? 'bg-[#ff5c00]/20 text-[#ff5c00] border border-[#ff5c00]/40'
                      : isStandby
                      ? 'bg-white/10 text-[#8a99ad] border border-white/20'
                      : 'bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30'
                  }`}
                >
                  {sc.status}
                </span>
              </div>

              <div className="text-[11px] text-[#8a99ad] truncate mb-2">
                {sc.trajectoryDescription}
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] text-[#8a99ad] pt-1.5 border-t border-white/5">
                <div>
                  DIST: <strong className="text-white tabular-nums">{sc.distanceDisplay}</strong>
                </div>
                <div className="text-right">
                  VEL: <strong className="text-[#00e5ff] tabular-nums">{sc.velocityKmS.toFixed(2)} km/s</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
