import React, { useState } from 'react';
import { Spacecraft, TelemetryEvent } from '../types/telemetry';
import { Cpu, Zap, Thermometer, RefreshCw, Disc, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SubsystemsMatrixProps {
  spacecraft: Spacecraft;
  onUpdateSubsystems: (updates: Partial<Spacecraft['subsystems']>) => void;
  onAddLog: (event: TelemetryEvent) => void;
}

export const SubsystemsMatrix: React.FC<SubsystemsMatrixProps> = ({
  spacecraft,
  onUpdateSubsystems,
  onAddLog,
}) => {
  const [isDumpingMomentum, setIsDumpingMomentum] = useState<boolean>(false);
  const subs = spacecraft.subsystems;

  const handleDumpMomentum = () => {
    setIsDumpingMomentum(true);
    setTimeout(() => {
      onUpdateSubsystems({
        reactionWheelsRpm: [250, -180, 120],
      });
      setIsDumpingMomentum(false);

      const now = new Date();
      const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
      onAddLog({
        id: `momentum-${Date.now()}`,
        timestamp: timeStr,
        subsystem: 'NAV',
        severity: 'nominal',
        message: 'RCS thruster pulse momentum dump executed: Reaction wheels desaturated to baseline <300 RPM.',
      });
    }, 1800);
  };

  const handleToggleStarTracker = () => {
    const nextLocked = !subs.starTrackerLocked;
    onUpdateSubsystems({ starTrackerLocked: nextLocked });

    const now = new Date();
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
    onAddLog({
      id: `tracker-${Date.now()}`,
      timestamp: timeStr,
      subsystem: 'NAV',
      severity: nextLocked ? 'nominal' : 'warning',
      message: nextLocked
        ? 'Star Tracker autonomous quat lock established on Guide Star Catalog.'
        : 'Star Tracker lock disengaged: Operating on inertial gyro dead-reckoning.',
    });
  };

  return (
    <div className="hud-panel p-4 rounded flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00e5ff]" />
          <span className="label-caps text-[#c3f5ff]">
            SUBSYSTEMS HARDWARE TELEMETRY MATRIX
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#8a99ad]">HEALTH:</span>
          <span className="text-[#00e5ff] font-bold">100% NOMINAL</span>
        </div>
      </div>

      {/* Hardware Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Module 1: Electrical Power Subsystem (EPS) */}
        <div className="p-3 bg-[#040711]/80 rounded border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-caps text-[#8a99ad]">ELECTRICAL POWER (EPS)</span>
            <Zap className="w-3.5 h-3.5 text-[#ffb59a]" />
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {subs.busVoltageV.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#8a99ad] ml-1">V DC</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-[#00e5ff] tabular-nums">
                {subs.solarOutputW}
              </span>
              <span className="text-xs font-mono text-[#8a99ad] ml-1">W GEN</span>
            </div>
          </div>

          {/* Bus Health Bar */}
          <div className="w-full bg-[#0b0e17] h-2 rounded border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00e5ff] to-[#c3f5ff]"
              style={{ width: `${Math.min(100, (subs.busVoltageV / 36) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#8a99ad] mt-1.5 block">
            REGULATED MAIN POWER BUS · LITHIUM-ION STORAGE
          </span>
        </div>

        {/* Module 2: Thermal & Cryogenics Loop */}
        <div className="p-3 bg-[#040711]/80 rounded border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-caps text-[#8a99ad]">CRYO & THERMAL LOOP</span>
            <Thermometer className="w-3.5 h-3.5 text-[#00e5ff]" />
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-[#00e5ff] tabular-nums">
                {subs.cryoTempK.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#8a99ad] ml-1">KELVIN</span>
            </div>
            <div className="text-right text-xs font-mono text-[#8a99ad]">
              <span>{(subs.cryoTempK - 273.15).toFixed(1)}°C</span>
            </div>
          </div>

          {/* Cryo Bar */}
          <div className="w-full bg-[#0b0e17] h-2 rounded border border-white/10 overflow-hidden">
            <div
              className={`h-full ${
                subs.cryoTempK < 10
                  ? 'bg-gradient-to-r from-[#00e5ff] to-[#7c4dff]'
                  : 'bg-gradient-to-r from-[#00e5ff] to-[#ff5c00]'
              }`}
              style={{ width: `${Math.min(100, (subs.cryoTempK / 350) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#8a99ad] mt-1.5 block">
            HELIUM PULSE TUBE COOLER · SUNSHIELD GRADIENT
          </span>
        </div>

        {/* Module 3: Attitude Determination & Control (ADCS) */}
        <div className="p-3 bg-[#040711]/80 rounded border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-caps text-[#8a99ad]">STAR TRACKER (ADCS)</span>
            {subs.starTrackerLocked ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#00e5ff]" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-[#ff5c00]" />
            )}
          </div>

          <div className="my-3 flex items-center justify-between font-mono">
            <div>
              <span className={`text-base font-bold ${
                subs.starTrackerLocked ? 'text-[#00e5ff]' : 'text-[#ff5c00]'
              }`}>
                {subs.starTrackerLocked ? 'QUAT LOCK NOMINAL' : 'INERTIAL DRIFT'}
              </span>
              <div className="text-[10px] text-[#8a99ad]">
                {subs.starTrackerLocked ? '3-HEAD AUTONOMOUS SENSOR' : 'DRIFTING GYROS'}
              </div>
            </div>

            <button
              onClick={handleToggleStarTracker}
              className="min-h-[44px] px-3.5 py-2 bg-[#0b0e17] border border-white/20 hover:border-[#00e5ff] rounded text-xs font-mono font-semibold text-white transition-colors touch-manipulation flex items-center justify-center shrink-0"
            >
              {subs.starTrackerLocked ? 'DISENGAGE' : 'RE-LOCK'}
            </button>
          </div>

          <span className="text-[10px] font-mono text-[#8a99ad]">
            POINTING ERROR JITTER: &lt; 0.007 ARCSEC
          </span>
        </div>
      </div>

      {/* 3-Axis Reaction Wheel Momentum Dials */}
      <div className="p-3 bg-[#040711]/80 rounded border border-white/10 flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Disc className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span className="label-caps text-[#8a99ad]">
              REACTION WHEEL ASSEMBLY (RWA) MOMENTUM GAUGES
            </span>
          </div>

          <button
            onClick={handleDumpMomentum}
            disabled={isDumpingMomentum}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded transition-all touch-manipulation ${
              isDumpingMomentum
                ? 'bg-[#ff5c00]/30 text-[#ff5c00] border border-[#ff5c00] animate-pulse'
                : 'bg-[#0b0e17] text-[#00e5ff] border border-[#00e5ff]/40 hover:bg-[#00e5ff]/20'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDumpingMomentum ? 'animate-spin' : ''}`} />
            <span>{isDumpingMomentum ? 'DUMPING RCS...' : 'DESATURATE (DUMP MOMENTUM)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
          {subs.reactionWheelsRpm.map((rpm, idx) => {
            const axis = idx === 0 ? 'X-AXIS (PITCH)' : idx === 1 ? 'Y-AXIS (YAW)' : 'Z-AXIS (ROLL)';
            const maxRpm = 4000;
            const pct = Math.min(100, (Math.abs(rpm) / maxRpm) * 100);

            return (
              <div key={axis} className="p-2.5 bg-[#0b0e17] border border-white/10 rounded">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8a99ad]">
                  <span>{axis}</span>
                  <span className="text-white font-bold tabular-nums">{rpm} RPM</span>
                </div>

                <div className="w-full bg-[#040711] h-1.5 rounded mt-2 border border-white/10 overflow-hidden">
                  <div
                    className={`h-full ${
                      pct > 75 ? 'bg-[#ff5c00]' : 'bg-[#00e5ff]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-[#8a99ad] mt-1">
                  <span>0</span>
                  <span>{pct.toFixed(0)}% SAT</span>
                  <span>4000</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
