import React, { useState, useEffect } from 'react';
import { INITIAL_SPACECRAFT } from './data/missions';
import { Spacecraft, TelemetryEvent, CelestialTarget } from './types/telemetry';
import { TopNav } from './components/TopNav';
import { TelemetryRibbon } from './components/TelemetryRibbon';
import { SpacecraftSelectorRail } from './components/SpacecraftSelectorRail';
import { OrbitTrackVectorDial } from './components/OrbitTrackVectorDial';
import { SpectrumFrequencyWaveform } from './components/SpectrumFrequencyWaveform';
import { CoordinateCrosshairs } from './components/CoordinateCrosshairs';
import { OrbitalEphemerisStage } from './components/OrbitalEphemerisStage';
import { FlightSequencer } from './components/FlightSequencer';
import { SubsystemsMatrix } from './components/SubsystemsMatrix';
import { MissionEventLog } from './components/MissionEventLog';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Compass, Radio, Flame, Target, Cpu, Activity, Info } from 'lucide-react';

export default function App() {
  const [spacecraftList, setSpacecraftList] = useState<Spacecraft[]>(INITIAL_SPACECRAFT);
  const [selectedId, setSelectedId] = useState<string>('jwst');
  const [activeTab, setActiveTab] = useState<'overview' | 'ephemeris' | 'spectrograph' | 'sequencer' | 'targeter'>('overview');
  const [isLiveDownlink, setIsLiveDownlink] = useState<boolean>(true);
  const [selectedTarget, setSelectedTarget] = useState<CelestialTarget | null>(null);

  const currentSpacecraft = spacecraftList.find((s) => s.id === selectedId) || spacecraftList[0];

  // Set active target when spacecraft changes
  useEffect(() => {
    if (currentSpacecraft.deepSkyTargets && currentSpacecraft.deepSkyTargets.length > 0) {
      setSelectedTarget(currentSpacecraft.deepSkyTargets[0]);
    } else {
      setSelectedTarget(null);
    }
  }, [selectedId]);

  // Real-time telemetry simulation ticks when downlink is active
  useEffect(() => {
    if (!isLiveDownlink) return;

    const interval = setInterval(() => {
      setSpacecraftList((prevList) =>
        prevList.map((sc) => {
          if (sc.id !== selectedId) return sc;

          // Minor jitter in SNR and Doppler to simulate real deep-space telemetry carrier
          const snrJitter = (Math.random() - 0.5) * 0.2;
          const dopplerJitter = (Math.random() - 0.5) * 4.0;
          const busJitter = (Math.random() - 0.5) * 0.05;

          return {
            ...sc,
            rfDownlink: {
              ...sc.rfDownlink,
              snrDb: Math.max(2, Math.min(35, sc.rfDownlink.snrDb + snrJitter)),
              dopplerHz: sc.rfDownlink.dopplerHz + dopplerJitter,
            },
            subsystems: {
              ...sc.subsystems,
              busVoltageV: Math.max(26, Math.min(125, sc.subsystems.busVoltageV + busJitter)),
            },
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveDownlink, selectedId]);

  // Handler for executed maneuver burn
  const handleExecuteBurn = (deltaVKmS: number, propellantUsedKg: number) => {
    setSpacecraftList((prev) =>
      prev.map((sc) => {
        if (sc.id !== selectedId) return sc;
        const newVelocity = Math.max(0.01, sc.velocityKmS + deltaVKmS);
        const newProp = Math.max(0, sc.subsystems.propellantKg - propellantUsedKg);

        return {
          ...sc,
          velocityKmS: newVelocity,
          status: 'NOMINAL',
          subsystems: {
            ...sc.subsystems,
            propellantKg: newProp,
          },
        };
      })
    );
  };

  // Add telemetry event log entry
  const handleAddLog = (event: TelemetryEvent) => {
    setSpacecraftList((prev) =>
      prev.map((sc) => {
        if (sc.id !== selectedId) return sc;
        return {
          ...sc,
          log: [event, ...sc.log],
        };
      })
    );
  };

  // Update hardware subsystem properties
  const handleUpdateSubsystems = (updates: Partial<Spacecraft['subsystems']>) => {
    setSpacecraftList((prev) =>
      prev.map((sc) => {
        if (sc.id !== selectedId) return sc;
        return {
          ...sc,
          subsystems: {
            ...sc.subsystems,
            ...updates,
          },
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#040711] text-[#e0e2ef] flex flex-col font-sans hud-grid-overlay">
      {/* 3-Zone Top Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLiveDownlink={isLiveDownlink}
        onToggleDownlink={() => setIsLiveDownlink(!isLiveDownlink)}
      />

      {/* Top Telemetry Ribbon */}
      <TelemetryRibbon spacecraft={currentSpacecraft} />

      {/* Viewport Content Area */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-8 max-w-[1600px] w-full mx-auto flex flex-col gap-4 sm:gap-6">
        {/* NASA Space Apps Challenge Demo Attribution Banner */}
        <div className="w-full bg-[#0b0e17]/95 border border-[#00e5ff]/30 rounded-lg p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-[0_0_20px_rgba(0,229,255,0.08)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
            <span className="label-caps text-[#00e5ff] tracking-wider font-bold text-xs">
              NASA SPACE APPS CHALLENGE DEMO
            </span>
            <span className="text-[#8a99ad] hidden sm:inline">|</span>
            <span className="text-[#bac9cc] text-xs">
              Deep-Space Telemetry & Aerospace Mission Control
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[#8a99ad]">Creado por:</span>
            <a
              href="https://maureenbarahona.foo"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3.5 py-2 bg-[#00e5ff]/15 hover:bg-[#00e5ff] text-[#00e5ff] hover:text-[#040711] border border-[#00e5ff]/50 rounded font-bold transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.25)] touch-manipulation"
              title="Visitar maureenbarahona.foo"
            >
              <span>Maureen Barahona</span>
              <span className="text-[11px] underline opacity-90">maureenbarahona.foo ↗</span>
            </a>
          </div>
        </div>

        {/* TAB 1: OVERVIEW (Full Aerospace HUD Dashboard) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Spacecraft Selector (full width on tablet, 3 cols on desktop) */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="hud-panel p-3 sm:p-4 rounded">
                <SpacecraftSelectorRail
                  spacecraftList={spacecraftList}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            </div>

            {/* Primary Visualizer Stage (full width on tablet, 6 cols on desktop) */}
            <div className="md:col-span-2 lg:col-span-6 flex flex-col gap-4 sm:gap-6">
              <OrbitalEphemerisStage spacecraft={currentSpacecraft} />

              <div className="hud-panel p-3 sm:p-4 rounded">
                <SpectrumFrequencyWaveform spacecraft={currentSpacecraft} />
              </div>
            </div>

            {/* Vector Dial (1 col on tablet, 3 cols on desktop) */}
            <div className="md:col-span-1 lg:col-span-3">
              <div className="hud-panel p-3 sm:p-4 rounded flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#00e5ff]" />
                    <span className="label-caps text-[#c3f5ff]">
                      VECTOR DIAL & APSIDES
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8a99ad]">15° TICKS</span>
                </div>

                <OrbitTrackVectorDial spacecraft={currentSpacecraft} />
              </div>
            </div>

            {/* Subsystems Matrix & Mission Log (spans cleanly on tablet & desktop) */}
            <div className="md:col-span-2 lg:col-span-12 xl:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="md:col-span-2 lg:col-span-7">
                <SubsystemsMatrix
                  spacecraft={currentSpacecraft}
                  onUpdateSubsystems={handleUpdateSubsystems}
                  onAddLog={handleAddLog}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-5">
                <MissionEventLog
                  events={currentSpacecraft.log}
                  onAddManualEvent={handleAddLog}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORBITAL EPHEMERIS STAGE */}
        {activeTab === 'ephemeris' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <OrbitalEphemerisStage spacecraft={currentSpacecraft} />

              {/* Detailed Keplerian Orbital Elements Table */}
              <div className="hud-panel p-4 rounded">
                <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2 mb-3">
                  <span className="label-caps text-[#c3f5ff]">
                    KEPLERIAN ORBITAL STATE MATRIX (J2000 EPOCH)
                  </span>
                  <span className="text-xs font-mono text-[#8a99ad]">
                    CENTRAL GRAVITATIONAL PARAMETER: μ = 3.986e5 km³/s²
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#040711]/70 border border-white/10 rounded">
                    <span className="label-caps text-[#8a99ad] block">SEMI-MAJOR AXIS (a)</span>
                    <span className="text-lg font-bold text-white mt-1 block tabular-nums">
                      {currentSpacecraft.orbitalElements.semiMajorAxisKm.toLocaleString()} km
                    </span>
                  </div>

                  <div className="p-3 bg-[#040711]/70 border border-white/10 rounded">
                    <span className="label-caps text-[#8a99ad] block">ECCENTRICITY (e)</span>
                    <span className="text-lg font-bold text-[#00e5ff] mt-1 block tabular-nums">
                      {currentSpacecraft.orbitalElements.eccentricity.toFixed(5)}
                    </span>
                  </div>

                  <div className="p-3 bg-[#040711]/70 border border-white/10 rounded">
                    <span className="label-caps text-[#8a99ad] block">INCLINATION (i)</span>
                    <span className="text-lg font-bold text-white mt-1 block tabular-nums">
                      {currentSpacecraft.orbitalElements.inclinationDeg.toFixed(2)}°
                    </span>
                  </div>

                  <div className="p-3 bg-[#040711]/70 border border-white/10 rounded">
                    <span className="label-caps text-[#8a99ad] block">TRUE ANOMALY (ν)</span>
                    <span className="text-lg font-bold text-[#c3f5ff] mt-1 block tabular-nums">
                      {currentSpacecraft.orbitalElements.trueAnomalyDeg.toFixed(2)}°
                    </span>
                  </div>

                  <div className="p-3 bg-[#040711]/70 border border-white/10 rounded">
                    <span className="label-caps text-[#8a99ad] block">PERIAPSIS RADIUS (r_p)</span>
                    <span className="text-lg font-bold text-white mt-1 block tabular-nums">
                      {currentSpacecraft.orbitalElements.periapsisKm.toLocaleString()} km
                    </span>
                  </div>

                  <div className="p-3 bg-[#040711]/70 border border-white/10 rounded">
                    <span className="label-caps text-[#8a99ad] block">APOAPSIS RADIUS (r_a)</span>
                    <span className="text-lg font-bold text-[#ffb59a] mt-1 block tabular-nums">
                      {currentSpacecraft.orbitalElements.apoapsisKm > 99999999
                        ? 'ASYMPTOTIC ESCAPE'
                        : `${currentSpacecraft.orbitalElements.apoapsisKm.toLocaleString()} km`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="hud-panel p-4 rounded">
                <SpacecraftSelectorRail
                  spacecraftList={spacecraftList}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>

              <div className="hud-panel p-4 rounded">
                <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2 mb-3">
                  <span className="label-caps text-[#c3f5ff]">VECTOR DIAL TRAJECTORY ARC</span>
                  <span className="text-xs font-mono text-[#00e5ff]">CALIBRATED</span>
                </div>
                <OrbitTrackVectorDial spacecraft={currentSpacecraft} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RADIO SPECTROGRAPH */}
        {activeTab === 'spectrograph' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="hud-panel p-5 rounded">
                <SpectrumFrequencyWaveform spacecraft={currentSpacecraft} />
              </div>

              {/* In-Phase / Quadrature (I/Q) Constellation Plot */}
              <div className="hud-panel p-4 rounded">
                <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#00e5ff]" />
                    <span className="label-caps text-[#c3f5ff]">
                      QPSK / BPSK CONSTELLATION DEMODULATOR (I / Q PLANE)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#00e5ff]">CARRIER LOCK STABLE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* SVG Constellation Scatter Viewport */}
                  <div className="relative w-full h-52 bg-[#040711] rounded border border-white/10 flex items-center justify-center p-2">
                    <svg viewBox="-100 -100 200 200" className="w-full h-full">
                      {/* Grid Axis */}
                      <line x1="-90" y1="0" x2="90" y2="0" stroke="rgba(0,229,255,0.2)" strokeWidth="1" />
                      <line x1="0" y1="-90" x2="0" y2="90" stroke="rgba(0,229,255,0.2)" strokeWidth="1" />
                      <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(0,229,255,0.15)" strokeDasharray="3 3" />

                      {/* 4 Quadrants QPSK Symbols with Gaussian cloud */}
                      {[
                        { x: 42, y: 42 },
                        { x: -42, y: 42 },
                        { x: -42, y: -42 },
                        { x: 42, y: -42 },
                      ].map((sym, idx) => (
                        <g key={idx}>
                          {/* Scatter dots */}
                          {Array.from({ length: 8 }).map((_, si) => {
                            const dx = (Math.random() - 0.5) * 12;
                            const dy = (Math.random() - 0.5) * 12;
                            return (
                              <circle
                                key={si}
                                cx={sym.x + dx}
                                cy={sym.y + dy}
                                r={1.5}
                                fill="#00e5ff"
                                opacity="0.6"
                              />
                            );
                          })}
                          <circle cx={sym.x} cy={sym.y} r={4} fill="#ffffff" stroke="#00e5ff" strokeWidth="1.5" />
                        </g>
                      ))}

                      {/* Axis Labels */}
                      <text x="75" y="-5" fill="#8a99ad" fontSize="8" fontFamily="JetBrains Mono">
                        +I
                      </text>
                      <text x="5" y="-75" fill="#8a99ad" fontSize="8" fontFamily="JetBrains Mono">
                        +Q
                      </text>
                    </svg>
                  </div>

                  {/* Demodulation Telemetry Readouts */}
                  <div className="flex flex-col gap-2 font-mono text-xs">
                    <div className="p-2.5 bg-[#040711]/70 border border-white/10 rounded">
                      <span className="text-[#8a99ad] text-[10px] block">MODULATION SCHEME</span>
                      <span className="text-white font-bold text-sm">
                        {currentSpacecraft.rfDownlink.band === 'OPTICAL' ? 'PPM-16 (PULSE POSITION)' : 'QPSK / OQPSK CONCATENATED'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#040711]/70 border border-white/10 rounded">
                      <span className="text-[#8a99ad] text-[10px] block">ERROR CORRECTION CODE (FEC)</span>
                      <span className="text-[#00e5ff] font-bold text-sm">
                        LDPC (4/5 RATE) + REED-SOLOMON
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#040711]/70 border border-white/10 rounded">
                      <span className="text-[#8a99ad] text-[10px] block">ESTIMATED E_b / N_0</span>
                      <span className="text-white font-bold text-sm">
                        {(currentSpacecraft.rfDownlink.snrDb + 2.4).toFixed(1)} dB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="hud-panel p-4 rounded">
                <SpacecraftSelectorRail
                  spacecraftList={spacecraftList}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>

              <MissionEventLog
                events={currentSpacecraft.log}
                onAddManualEvent={handleAddLog}
              />
            </div>
          </div>
        )}

        {/* TAB 4: FLIGHT SEQUENCER */}
        {activeTab === 'sequencer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <FlightSequencer
                spacecraft={currentSpacecraft}
                onExecuteBurn={handleExecuteBurn}
                onAddLog={handleAddLog}
              />

              <div className="hud-panel p-4 rounded">
                <div className="flex items-center gap-2 border-b border-[#ff5c00]/25 pb-2 mb-3">
                  <Flame className="w-4 h-4 text-[#ff5c00]" />
                  <span className="label-caps text-[#ffdbce]">
                    PROPULSION TANK & PRESSURIZATION STATUS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-2.5 bg-[#040711] border border-white/10 rounded">
                    <span className="text-[10px] text-[#8a99ad] block">OXIDIZER / FUEL RATIO</span>
                    <span className="text-white font-bold text-base mt-1 block">1.65 : 1 (NTO/MMH)</span>
                  </div>

                  <div className="p-2.5 bg-[#040711] border border-white/10 rounded">
                    <span className="text-[10px] text-[#8a99ad] block">HELIUM TANK PRESSURE</span>
                    <span className="text-[#00e5ff] font-bold text-base mt-1 block">248.5 BAR</span>
                  </div>

                  <div className="p-2.5 bg-[#040711] border border-white/10 rounded">
                    <span className="text-[10px] text-[#8a99ad] block">CHAMBER TEMPERATURE</span>
                    <span className="text-[#ff5c00] font-bold text-base mt-1 block">1,420 K</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="hud-panel p-4 rounded">
                <SpacecraftSelectorRail
                  spacecraftList={spacecraftList}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>

              <div className="hud-panel p-4 rounded">
                <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2 mb-3">
                  <span className="label-caps text-[#c3f5ff]">TRAJECTORY ORBIT DIAL</span>
                  <span className="text-xs font-mono text-[#00e5ff]">REAL-TIME</span>
                </div>
                <OrbitTrackVectorDial spacecraft={currentSpacecraft} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEEP SKY CELESTIAL TARGETER */}
        {activeTab === 'targeter' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="hud-panel-violet p-4 rounded">
                <CoordinateCrosshairs
                  targets={currentSpacecraft.deepSkyTargets}
                  activeTarget={selectedTarget}
                  onSelectTarget={setSelectedTarget}
                />
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="hud-panel p-4 rounded">
                <SpacecraftSelectorRail
                  spacecraftList={spacecraftList}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>

              <MissionEventLog
                events={currentSpacecraft.log}
                onAddManualEvent={handleAddLog}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="w-full bg-[#040711] border-t border-[#00e5ff]/20 px-4 sm:px-6 py-4 pb-20 lg:pb-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8a99ad]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-white font-semibold">ASTROTELEMETRY EXPLORER</span>
          <span>·</span>
          <span className="text-[#00e5ff] font-semibold">Demo para NASA Space Apps Challenge</span>
          <span>·</span>
          <span>
            Creado por{' '}
            <a
              href="https://maureenbarahona.foo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c3f5ff] hover:text-[#00e5ff] underline font-bold transition-colors py-1 inline-block"
            >
              Maureen Barahona (maureenbarahona.foo) ↗
            </a>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>DSN METRIC: NOMINAL</span>
          <span>·</span>
          <span className="text-[#00e5ff]">AEROSPACE GLASSMORPHIC HUD</span>
        </div>
      </footer>

      {/* Mobile & Tablet Fixed Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
