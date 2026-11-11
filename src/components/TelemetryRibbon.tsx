import React, { useState, useEffect } from 'react';
import { Spacecraft } from '../types/telemetry';
import { Clock, Globe, Signal, Shield, ArrowUpRight } from 'lucide-react';

interface TelemetryRibbonProps {
  spacecraft: Spacecraft;
}

export const TelemetryRibbon: React.FC<TelemetryRibbonProps> = ({ spacecraft }) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [metSeconds, setMetSeconds] = useState<number>(spacecraft.missionElapsedSeconds);

  useEffect(() => {
    setMetSeconds(spacecraft.missionElapsedSeconds);
  }, [spacecraft.id, spacecraft.missionElapsedSeconds]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
      setMetSeconds((s) => s + 1);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatMET = (totalSec: number) => {
    const days = Math.floor(totalSec / 86400);
    const rem = totalSec % 86400;
    const hours = Math.floor(rem / 3600);
    const minutes = Math.floor((rem % 3600) / 60);
    const seconds = rem % 60;
    return `T+${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#040711]/95 border-b border-[#00e5ff]/15 px-6 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-[11px] font-mono select-none">
      {/* Left: Spacecraft Identification & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[#8a99ad]">PLATFORM:</span>
          <span className="text-white font-bold tracking-wider">{spacecraft.callsign}</span>
        </div>

        <span className="text-[#8a99ad]">·</span>

        <div className="flex items-center gap-1.5">
          <span className="text-[#8a99ad]">TRAJECTORY:</span>
          <span className="text-[#00e5ff] font-semibold">{spacecraft.centralBody.toUpperCase()} ORBIT</span>
        </div>
      </div>

      {/* Middle: Mission Elapsed Time & UTC Clock */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="text-[#8a99ad]">MET:</span>
          <span className="text-white font-bold tabular-nums">{formatMET(metSeconds)}</span>
        </div>

        <span className="text-[#8a99ad] hidden sm:inline">·</span>

        <div className="hidden sm:flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#8a99ad]" />
          <span className="text-[#8a99ad]">SYS UTC:</span>
          <span className="text-[#c3f5ff] tabular-nums">{utcTime}</span>
        </div>
      </div>

      {/* Right: Signal Delay & Link Quality */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="text-[#8a99ad]">1-WAY LIGHT TIME:</span>
          <span className="text-[#ffb59a] font-bold tabular-nums">
            {spacecraft.lightDelaySeconds > 3600
              ? `${(spacecraft.lightDelaySeconds / 3600).toFixed(2)}h`
              : `${spacecraft.lightDelaySeconds.toFixed(2)}s`}
          </span>
        </div>

        <span className="text-[#8a99ad]">·</span>

        <div className="flex items-center gap-1.5">
          <span className="text-[#8a99ad]">GROUND LINK:</span>
          <span className="text-white font-semibold">{spacecraft.rfDownlink.dsnAntenna.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};
