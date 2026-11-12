import React, { useState, useEffect, useRef } from 'react';
import { Spacecraft, RadioBand } from '../types/telemetry';
import { Volume2, VolumeX, Radio, Activity } from 'lucide-react';

interface SpectrumFrequencyWaveformProps {
  spacecraft: Spacecraft;
  onBandSelect?: (band: RadioBand) => void;
}

export const SpectrumFrequencyWaveform: React.FC<SpectrumFrequencyWaveformProps> = ({
  spacecraft,
  onBandSelect,
}) => {
  const [activeBand, setActiveBand] = useState<RadioBand>(spacecraft.rfDownlink.band);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [noiseOffset, setNoiseOffset] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sync band if spacecraft changes
  useEffect(() => {
    setActiveBand(spacecraft.rfDownlink.band);
  }, [spacecraft.id, spacecraft.rfDownlink.band]);

  // Audio demodulation tone synthesizer
  useEffect(() => {
    if (audioEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        // Base tone from doppler shift or frequency
        osc.frequency.setValueAtTime(640 + Math.sin(Date.now() / 200) * 80, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } catch {
        // Audio might require user interaction or be restricted
      }
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [audioEnabled]);

  // Real-time fluctuating RF spectrum bins
  useEffect(() => {
    const timer = setInterval(() => {
      setNoiseOffset((prev) => (prev + 1) % 100);
      if (oscillatorRef.current && audioContextRef.current) {
        const f = 600 + Math.sin(Date.now() / 400) * 120 + Math.random() * 40;
        oscillatorRef.current.frequency.setValueAtTime(f, audioContextRef.current.currentTime);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  const numBars = 48;
  const centerBin = Math.floor(numBars / 2);

  // Generate spectrum bar heights
  const bars = Array.from({ length: numBars }).map((_, i) => {
    const distFromCenter = Math.abs(i - centerBin);
    // Baseline noise
    let height = 8 + Math.sin((i * 7 + noiseOffset) * 0.4) * 6 + Math.random() * 8;
    // Central carrier spike
    if (distFromCenter === 0) {
      height = 92 + Math.random() * 6;
    } else if (distFromCenter === 1) {
      height = 72 + Math.random() * 8;
    } else if (distFromCenter === 2) {
      height = 42 + Math.random() * 7;
    } else if (distFromCenter === 3) {
      height = 24 + Math.random() * 5;
    } else if (distFromCenter === 8 || distFromCenter === 14) {
      // Harmonic sidebands
      height += 18 + Math.random() * 6;
    }

    // Color: cyan for nominal carrier, amber for pilot harmonic or peak
    const isPeak = distFromCenter <= 1;
    const isAmberHarmonic = distFromCenter === 8 || distFromCenter === 14;

    return {
      index: i,
      height: Math.min(98, Math.max(5, height)),
      isPeak,
      isAmberHarmonic,
    };
  });

  const handleBandChange = (band: RadioBand) => {
    setActiveBand(band);
    if (onBandSelect) onBandSelect(band);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header Bar with Status Ping & Frequency */}
      <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#00e5ff] animate-pulse" />
          <span className="label-caps text-[#c3f5ff]">
            RF SPECTRUM RECEIVER
          </span>
          <span className="font-mono text-xs text-[#8a99ad]">·</span>
          <span className="font-mono text-xs font-semibold text-[#00e5ff]">
            {spacecraft.rfDownlink.frequencyGHz > 1000
              ? `${(spacecraft.rfDownlink.frequencyGHz / 1000).toFixed(1)} THz (1550nm)`
              : `${spacecraft.rfDownlink.frequencyGHz.toFixed(3)} GHz`}
          </span>
        </div>

        {/* Audio Demodulation Button */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded text-xs font-mono uppercase transition-colors touch-manipulation ${
            audioEnabled
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
              : 'text-[#8a99ad] hover:text-white border border-white/10'
          }`}
          title="Toggle RF demodulation tone monitor"
          aria-label={audioEnabled ? 'Mute RF demodulation tone' : 'Enable RF demodulation audio tone'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{audioEnabled ? 'DEMOD ON' : 'MUTE'}</span>
        </button>
      </div>

      {/* Band Selector Tabs with >=44px hit targets */}
      <div className="flex items-center gap-1.5 p-1 bg-[#040711]/80 rounded border border-white/10">
        {(['S-BAND', 'X-BAND', 'Ka-BAND', 'OPTICAL'] as RadioBand[]).map((b) => (
          <button
            key={b}
            onClick={() => handleBandChange(b)}
            className={`flex-1 min-h-[44px] py-2 px-1 text-center font-mono text-[11px] sm:text-xs uppercase font-semibold rounded transition-colors touch-manipulation flex items-center justify-center ${
              activeBand === b
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/60 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                : 'text-[#8a99ad] hover:text-white'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Dynamic Linear SVG Bars Glowing in Cyan and Amber */}
      <div className="relative w-full h-32 bg-[#040711]/90 rounded border border-[#00e5ff]/20 p-2 flex flex-col justify-end overflow-hidden">
        {/* Decibel Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
          <div className="w-full border-b border-dashed border-[#00e5ff] text-[8px] font-mono text-[#8a99ad]">0 dBFS</div>
          <div className="w-full border-b border-dashed border-[#00e5ff] text-[8px] font-mono text-[#8a99ad]">-30 dBFS</div>
          <div className="w-full border-b border-dashed border-[#00e5ff] text-[8px] font-mono text-[#8a99ad]">-60 dBFS</div>
          <div className="w-full border-b border-dashed border-[#00e5ff] text-[8px] font-mono text-[#8a99ad]">-90 dBFS</div>
        </div>

        {/* Center Carrier Tuning Reticle */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#00e5ff]/40 pointer-events-none" />

        {/* SVG Spectrum Bars */}
        <svg viewBox="0 0 480 100" preserveAspectRatio="none" className="w-full h-24 z-10">
          <defs>
            <linearGradient id="cyanBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="amberBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5c00" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff5c00" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {bars.map((bar) => {
            const barWidth = 8;
            const x = bar.index * 10;
            const barHeight = bar.height;
            const y = 100 - barHeight;
            const fill = bar.isAmberHarmonic ? 'url(#amberBarGrad)' : 'url(#cyanBarGrad)';
            const stroke = bar.isAmberHarmonic ? '#ff5c00' : '#00e5ff';

            return (
              <g key={bar.index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={fill}
                  rx="1"
                  className="transition-all duration-75"
                />
                {bar.isPeak && (
                  <circle
                    cx={x + barWidth / 2}
                    cy={y}
                    r={3}
                    fill="#ffffff"
                    stroke="#00e5ff"
                    strokeWidth="1.5"
                    className="drop-shadow-[0_0_8px_#00e5ff]"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Axis Labels */}
        <div className="w-full flex items-center justify-between text-[9px] font-mono text-[#8a99ad] pt-1 z-10 border-t border-white/10">
          <span>f - 50 MHz</span>
          <span className="text-[#00e5ff] font-bold">CARRIER f₀</span>
          <span>f + 50 MHz</span>
        </div>
      </div>

      {/* Downlink Telemetry Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">SNR MARGIN</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-base font-bold text-[#00e5ff] tabular-nums">
              {spacecraft.rfDownlink.snrDb.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-[#8a99ad]">dB</span>
          </div>
        </div>

        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">DOPPLER DRIFT</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`font-mono text-base font-bold tabular-nums ${
              spacecraft.rfDownlink.dopplerHz < 0 ? 'text-[#00e5ff]' : 'text-[#ff5c00]'
            }`}>
              {spacecraft.rfDownlink.dopplerHz > 0 ? '+' : ''}
              {(spacecraft.rfDownlink.dopplerHz / 1000).toFixed(2)}
            </span>
            <span className="text-[10px] font-mono text-[#8a99ad]">kHz</span>
          </div>
        </div>

        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">DOWNLINK RATE</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {spacecraft.rfDownlink.bitrateKbps >= 1000
                ? (spacecraft.rfDownlink.bitrateKbps / 1000).toFixed(1)
                : spacecraft.rfDownlink.bitrateKbps}
            </span>
            <span className="text-[10px] font-mono text-[#8a99ad]">
              {spacecraft.rfDownlink.bitrateKbps >= 1000 ? 'Mbps' : 'kbps'}
            </span>
          </div>
        </div>

        <div className="p-2 bg-[#040711]/70 border border-[#00e5ff]/15 rounded">
          <span className="label-caps text-[#8a99ad] block">BIT ERROR RATE</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-base font-bold text-[#c3f5ff] tabular-nums">
              {spacecraft.rfDownlink.bitErrorRate}
            </span>
          </div>
        </div>
      </div>

      {/* DSN Ground Station Beam Alignment Info */}
      <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-[#0b0e17] border border-white/10 rounded font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="text-[#8a99ad]">GROUND TRACK:</span>
          <span className="text-white font-semibold">{spacecraft.rfDownlink.dsnAntenna}</span>
        </div>
        <div className="flex items-center gap-3 text-[#8a99ad] text-[11px]">
          <span>AZ: <strong className="text-white tabular-nums">{spacecraft.rfDownlink.azimuthDeg}°</strong></span>
          <span>EL: <strong className="text-white tabular-nums">{spacecraft.rfDownlink.elevationDeg}°</strong></span>
        </div>
      </div>
    </div>
  );
};
