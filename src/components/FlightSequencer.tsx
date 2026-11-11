import React, { useState } from 'react';
import { Spacecraft, TelemetryEvent } from '../types/telemetry';
import { Flame, Gauge, Zap, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

interface FlightSequencerProps {
  spacecraft: Spacecraft;
  onExecuteBurn: (deltaVKmS: number, propellantUsedKg: number) => void;
  onAddLog: (event: TelemetryEvent) => void;
}

export const FlightSequencer: React.FC<FlightSequencerProps> = ({
  spacecraft,
  onExecuteBurn,
  onAddLog,
}) => {
  const [deltaV, setDeltaV] = useState<number>(25.0); // m/s
  const [burnVector, setBurnVector] = useState<'PROGRADE' | 'RETROGRADE' | 'NORMAL' | 'RADIAL'>('PROGRADE');
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [burnCountdown, setBurnCountdown] = useState<number>(0);
  const [burnProgress, setBurnProgress] = useState<number>(0);

  // Compute burn duration and propellant mass using rocket formula
  const isp = 320; // Specific impulse seconds for bipropellant thruster
  const g0 = 9.80665;
  const currentMass = 4000 + spacecraft.subsystems.propellantKg;
  // dM = m0 * (1 - exp(-dv / (isp * g0)))
  const deltaVMs = Math.abs(deltaV);
  const propellantEstimateKg = (currentMass * (1 - Math.exp(-deltaVMs / (isp * g0))));
  const thrusterThrustN = 440; // 440 N apogee engine
  const mDot = thrusterThrustN / (isp * g0);
  const burnDurationSec = Math.max(1, Math.round(propellantEstimateKg / mDot));

  const handleStartBurn = () => {
    if (isBurning || propellantEstimateKg > spacecraft.subsystems.propellantKg) return;

    setIsBurning(true);
    setBurnCountdown(burnDurationSec);
    setBurnProgress(0);

    // Audio thrum effect
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + burnDurationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + burnDurationSec);
    } catch {
      // Audio fallback
    }

    const startTime = Date.now();
    const totalMs = burnDurationSec * 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / totalMs) * 100);
      setBurnProgress(progress);
      setBurnCountdown(Math.max(0, Math.ceil((totalMs - elapsed) / 1000)));

      if (elapsed >= totalMs) {
        clearInterval(timer);
        setIsBurning(false);

        // Apply velocity delta
        const signedDeltaV = burnVector === 'RETROGRADE' ? -(deltaV / 1000) : (deltaV / 1000);
        onExecuteBurn(signedDeltaV, propellantEstimateKg);

        const now = new Date();
        const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
        onAddLog({
          id: `burn-${Date.now()}`,
          timestamp: timeStr,
          subsystem: 'PROP',
          severity: 'burn',
          message: `Maneuver burn COMPLETE: Δv ${deltaV.toFixed(1)} m/s (${burnVector}). Consumed ${propellantEstimateKg.toFixed(1)} kg prop.`,
        });
      }
    }, 100);
  };

  return (
    <div className="hud-panel p-4 rounded flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#ff5c00]/25 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#ff5c00]" />
          <span className="label-caps text-[#ffdbce]">
            FLIGHT SEQUENCER & PROPULSION PLANNER
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`label-caps px-2 py-0.5 rounded text-[10px] font-mono ${
            isBurning
              ? 'bg-[#ff5c00] text-[#040711] font-bold animate-pulse'
              : 'bg-[#ff5c00]/15 text-[#ff5c00] border border-[#ff5c00]/40'
          }`}>
            {isBurning ? '● ACTIVE BURN IN PROGRESS' : 'STANDBY FOR BURN'}
          </span>
        </div>
      </div>

      {/* Burn Vector Selection */}
      <div>
        <label className="label-caps text-[#8a99ad] mb-1.5 block">
          MANEUVER ORIENTATION VECTOR
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['PROGRADE', 'RETROGRADE', 'NORMAL', 'RADIAL'] as const).map((vec) => (
            <button
              key={vec}
              disabled={isBurning}
              onClick={() => setBurnVector(vec)}
              className={`py-2 px-3 text-center font-mono text-xs font-semibold rounded border transition-all ${
                burnVector === vec
                  ? 'bg-[#ff5c00]/20 text-[#ff5c00] border-[#ff5c00] shadow-[0_0_12px_rgba(255,92,0,0.3)]'
                  : 'bg-[#040711]/70 text-[#8a99ad] hover:text-white border-white/10'
              } ${isBurning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {vec}
            </button>
          ))}
        </div>
      </div>

      {/* Delta-V Parameter Slider & Stepper */}
      <div className="p-3 bg-[#040711]/80 rounded border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="label-caps text-[#8a99ad]">TARGET DELTA-V (Δv)</span>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#ff5c00] tabular-nums">
              {deltaV.toFixed(1)}
            </span>
            <span className="text-xs text-[#8a99ad]">m/s</span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="150"
          step="0.5"
          value={deltaV}
          disabled={isBurning}
          onChange={(e) => setDeltaV(parseFloat(e.target.value))}
          className="w-full accent-[#ff5c00] bg-white/10 h-1.5 rounded cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-[#8a99ad]">
          <span>Fine Trim (+1.0 m/s)</span>
          <div className="flex items-center gap-1.5">
            {[5, 15, 30, 60, 100].map((val) => (
              <button
                key={val}
                disabled={isBurning}
                onClick={() => setDeltaV(val)}
                className="px-2 py-0.5 bg-[#0b0e17] hover:bg-[#ff5c00]/20 text-[#e0e2ef] hover:text-[#ff5c00] border border-white/10 rounded transition-colors"
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projected Burn Computation Output Grid */}
      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <div className="p-2.5 bg-[#0b0e17] border border-white/10 rounded">
          <span className="label-caps text-[#8a99ad] block">BURN DURATION</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-white tabular-nums">
              {burnDurationSec}
            </span>
            <span className="text-[10px] text-[#8a99ad]">sec</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0b0e17] border border-white/10 rounded">
          <span className="label-caps text-[#8a99ad] block">PROP CONSUMPTION</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-[#ff5c00] tabular-nums">
              {propellantEstimateKg.toFixed(1)}
            </span>
            <span className="text-[10px] text-[#8a99ad]">kg</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0b0e17] border border-white/10 rounded">
          <span className="label-caps text-[#8a99ad] block">PROPELLANT RESERVE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-[#00e5ff] tabular-nums">
              {spacecraft.subsystems.propellantKg.toFixed(1)}
            </span>
            <span className="text-[10px] text-[#8a99ad]">kg</span>
          </div>
        </div>
      </div>

      {/* Active Burn Propulsion Visualizer (when burning) */}
      {isBurning && (
        <div className="p-3 bg-[#110500] border border-[#ff5c00] rounded flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-[#ff5c00] font-bold">
              <Flame className="w-4 h-4 animate-bounce text-[#ff5c00]" />
              <span>THRUSTER PLUME FIRING · {burnVector}</span>
            </div>
            <div className="text-white font-bold tabular-nums">
              T-MINUS {burnCountdown}s
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#040711] h-2 rounded overflow-hidden border border-[#ff5c00]/40">
            <div
              className="h-full bg-gradient-to-r from-[#ff5c00] to-[#ffd59e] transition-all duration-100"
              style={{ width: `${burnProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Flight Execution Trigger Button */}
      <button
        onClick={handleStartBurn}
        disabled={isBurning || propellantEstimateKg > spacecraft.subsystems.propellantKg}
        className={`btn-flight-amber w-full py-3 px-4 rounded flex items-center justify-center gap-2 font-mono text-sm tracking-widest font-bold shadow-[0_0_20px_rgba(255,92,0,0.25)] ${
          isBurning || propellantEstimateKg > spacecraft.subsystems.propellantKg
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        <Flame className="w-4 h-4 text-inherit" />
        <span>
          {isBurning
            ? `PROPULSION FIRING (${burnCountdown}S REMAINING)`
            : `EXECUTE TRAJECTORY BURN (+${deltaV.toFixed(1)} M/S)`}
        </span>
      </button>

      {/* Propellant warning if low */}
      {propellantEstimateKg > spacecraft.subsystems.propellantKg && (
        <div className="flex items-center gap-2 text-xs text-[#ffb4ab] font-mono p-2 bg-[#93000a]/30 border border-[#ffb4ab]/30 rounded">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Insufficient propellant reserve for planned Δv maneuver.</span>
        </div>
      )}
    </div>
  );
};
