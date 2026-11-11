export type SpacecraftStatus = 'NOMINAL' | 'ACTIVE BURN' | 'STANDBY' | 'DEEP SKY TARGET';

export type RadioBand = 'S-BAND' | 'X-BAND' | 'Ka-BAND' | 'OPTICAL';

export interface CelestialTarget {
  id: string;
  name: string;
  catalogId: string;
  ra: string; // Right Ascension (hh mm ss)
  dec: string; // Declination (dd mm ss)
  constellation: string;
  distanceLy: string;
  magnitude: number;
  type: string;
  scienceObjective: string;
  spectroscopyPeakNm: number;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  subsystem: 'PROP' | 'NAV' | 'COMM' | 'PWR' | 'THERM' | 'PAYLOAD' | 'DSN';
  severity: 'nominal' | 'burn' | 'warning' | 'critical';
  message: string;
}

export interface Spacecraft {
  id: string;
  name: string;
  callsign: string;
  missionName: string;
  category: 'Space Observatory' | 'Interstellar Probe' | 'Planetary Orbiter' | 'Deep Space Crew' | 'Heliophysics';
  status: SpacecraftStatus;
  missionElapsedSeconds: number;
  distanceKm: number;
  distanceDisplay: string;
  lightDelaySeconds: number;
  velocityKmS: number;
  trajectoryDescription: string;
  centralBody: 'Earth' | 'Sun' | 'Mars' | 'Jupiter' | 'Interstellar';
  
  orbitalElements: {
    semiMajorAxisKm: number;
    eccentricity: number;
    inclinationDeg: number;
    periodHours: number;
    periapsisKm: number;
    apoapsisKm: number;
    trueAnomalyDeg: number;
  };
  
  rfDownlink: {
    band: RadioBand;
    frequencyGHz: number;
    carrierPowerDbm: number;
    snrDb: number;
    bitrateKbps: number;
    dopplerHz: number;
    bitErrorRate: string;
    dsnAntenna: string;
    azimuthDeg: number;
    elevationDeg: number;
  };
  
  subsystems: {
    busVoltageV: number;
    solarOutputW: number;
    propellantKg: number;
    propellantMaxKg: number;
    cryoTempK: number;
    reactionWheelsRpm: [number, number, number];
    starTrackerLocked: boolean;
    mainThrusterArmed: boolean;
  };

  deepSkyTargets: CelestialTarget[];
  log: TelemetryEvent[];
}
