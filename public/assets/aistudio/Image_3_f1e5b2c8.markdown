---
name: AstroTelemetry Explorer
colors:
  surface: '#10131c'
  surface-dim: '#10131c'
  surface-bright: '#363943'
  surface-container-lowest: '#0b0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#272a34'
  surface-container-highest: '#32343f'
  on-surface: '#e0e2ef'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#e0e2ef'
  inverse-on-surface: '#2d303a'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#ffb59a'
  on-secondary: '#5a1b00'
  secondary-container: '#ff5e07'
  on-secondary-container: '#531900'
  tertiary: '#f1e9ff'
  on-tertiary: '#370096'
  tertiary-container: '#d6c9ff'
  on-tertiary-container: '#622be5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#802a00'
  tertiary-fixed: '#e8deff'
  tertiary-fixed-dim: '#cdbdff'
  on-tertiary-fixed: '#20005f'
  on-tertiary-fixed-variant: '#4f00d0'
  background: '#10131c'
  on-background: '#e0e2ef'
  surface-variant: '#32343f'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.04em
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: 0.03em
  telemetry-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.12em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels the precision, functional clarity, and awe of modern deep-space mission control interfaces. It targets aerospace researchers, science educators, data analysts, and space enthusiasts seeking real-time telemetry, ephemeris feeds, and scientific rigor without unnecessary visual clutter.

The aesthetic fuses **contemporary technical glassmorphism** with **aerospace HUD (Heads-Up Display) instrumentation**:
- **Atmosphere:** Deep cosmic darkness evoking the vacuum of space, contrasted with surgical instrument-grade luminous accents.
- **Tone:** Authoritative, high-tech, precise, and exploratory. Every pixel feels calibrated, operational, and signal-driven.
- **Visual Motif:** Translucent glass consoles layered over dynamic starfields and visual telemetry, high-contrast numeric callouts, and clean technical grid alignment.

## Colors

The palette operates in strict dark mode, anchored by deep cosmic voids and energized by high-visibility flight-gauge luminophores:

- **Deep Space Base (`#040711`):** The absolute background canvas, evoking the blackness of deep space.
- **Cosmic Navy Neutral (`#0B0E17`):** Primary panel and surface base color, creating structural division without stark contrast.
- **Telemetry Cyan (`#00E5FF`):** Primary action and sensor status color. Represents nominal operations, active telemetry channels, vector paths, and interactive states.
- **Propulsion Amber / Hazard Orange (`#FF5C00`):** Secondary accent reserved for live propulsion feeds, high-priority telemetry alerts, launch sequences, trajectory deviations, and cautionary statuses.
- **Deep Orbit Violet (`#7C4DFF`):** Tertiary accent used for deep-sky astrophysical designations, spectroscopic indicators, and auxiliary scientific metadata.
- **Stellar White (`#FFFFFF`):** High-priority values, critical data readouts, and primary headlines.
- **Sub-Orbital Slate (`#8A99AD`):** Secondary copy, inactive metrics, and auxiliary axis lines.
- **Glass Tint Borders (`rgba(0, 229, 255, 0.14)`): Hairline boundary lines denoting HUD panels and modular telemetric frames.

## Typography

Typography enforces tactical hierarchy across mission dashboards and narrative logs:

- **Display & Headlines (Space Grotesk):** Provides an architectural, futuristic structure without degrading readability. Used for mission titles, astronomical catalog headers, and section markers.
- **Narrative & Body (Geist):** Clean, crisp, neutral neo-grotesque designed to deliver exceptional legibility against deep dark backgrounds and complex analytical backdrops.
- **Telemetry & Instrument Readouts (JetBrains Mono):** Strict monospaced tabular figures ensure jitter-free real-time data streams, coordinates (RA/Dec), UTC timestamps, delta-v counters, and flight state vectors.
- **All-Caps Micro Labels (`label-caps`):** Applied to telemetry parameters, status tags, subsystem identifiers, and HUD axis bounds to mimic actual aerospace telemetry labels.

## Layout & Spacing

The layout operates on a modular 12-column dynamic grid designed for dense information architecture and responsive situational awareness:

- **Grid Architecture:** 12-column layout on desktop (1440px max content bounding box), 8-column layout on tablet (768px - 1024px), and 4-column layout on mobile (<768px).
- **Rhythm & Metrics:** An 8px base rhythm dictates structural gaps, inner paddings, and alignment markers. Micro-spacers use 4px (`space-xs`) for dense telemetry clusters.
- **Viewport Layout:**
  - **Desktop:** HUD-style persistent side rails (telemetry monitors, orbit track selectors) flank the primary visualizer stage.
  - **Tablet:** Side consoles collapse into floating sliding panels with quick-toggle instrument strips.
  - **Mobile:** Telemetry rails stack into bottom sheets and scrollable horizontal chips, reserving viewport focus for 3D astronomical models and critical event trackers.

## Elevation & Depth

Depth is established through translucent atmospheric layers, frosted glass physics, and luminous instrument glows rather than physical drop shadows:

- **Surface 0 (Deep Space Vacuum):** Solid background color `#040711`. Hosts celestial starfields, nebulae visuals, and 3D orbits.
- **Surface 1 (Stationary Panels):** Background `rgba(11, 14, 23, 0.75)` with `backdrop-filter: blur(16px)` and a crisp 1px stroke of `rgba(255, 255, 255, 0.08)`.
- **Surface 2 (Interactive Modules & HUD Reticles):** Background `rgba(15, 23, 42, 0.85)` with `backdrop-filter: blur(24px)` and a 1px perimeter of `rgba(0, 229, 255, 0.22)`.
- **Surface 3 (Overlays, Flight Alerts & Modals):** Background `rgba(8, 12, 20, 0.94)` with `backdrop-filter: blur(32px)`, subtle outer glow `box-shadow: 0 0 32px rgba(0, 229, 255, 0.15)`, and dynamic status perimeter.
- **HUD Reticle & Laser Indicators:** Sub-pixel corner brackets (`border-top`, `border-left` tick marks) on active cards provide an instrumentation overlay aesthetic.

## Shapes

The geometry reflects aviation and orbital hardware design: controlled, chiseled, and precise.

- **Base Corner Radius:** Subtle 0.25rem (`roundedness: 1`) on standard telemetry containers, buttons, and HUD panels, reinforcing precision hardware over soft consumer apps.
- **Cards & Modals (`rounded-lg`):** 0.5rem corner rounding maintains structural integrity and fits tight grid arrangements without wasted space.
- **System Badges & Precision Chips:** Micro-chamfered edges or 0.25rem radius; never fully pill-shaped except for circular sensor dials or orbital trajectory nodes.

## Components

### Buttons & Flight Triggers
- **Primary Flight Action:** Background `rgba(0, 229, 255, 0.12)`, border `1px solid #00E5FF`, label color `#00E5FF` in `JetBrains Mono` uppercase with subtle cyan drop glow (`text-shadow: 0 0 8px rgba(0, 229, 255, 0.6)`). Hover shifts background to `#00E5FF`, label to `#040711`.
- **Propulsion / Emergency Action:** Background `rgba(255, 92, 0, 0.15)`, border `1px solid #FF5C00`, label `#FF5C00`. Hover fills `#FF5C00` with text `#040711`.
- **Ghost Instrument Toggle:** Transparent background, hairline border `rgba(255, 255, 255, 0.15)`, text `Stellar White`.

### Telemetry Cards & HUD Modules
- Containers feature backdrop blur (`blur(20px)`), background `rgba(11, 14, 23, 0.7)`, and an inset corner bracket effect on top-left and bottom-right edges.
- Header bars include tiny system status pings (e.g., pulsing green/cyan micro-dot) and monospaced frequency readouts (e.g., `FREQ: 8.4 GHz | S-BAND`).

### Status Badges & Data Chips
- Compact horizontal layouts featuring `label-caps` typography.
- Status indicators feature an ambient breathing neon glow (`box-shadow: 0 0 6px currentColor`).
- Types: `NOMINAL` (Cyan), `ACTIVE BURN` (Orange), `STANDBY` (Sub-Orbital Slate), `DEEP SKY TARGET` (Orbital Violet).

### Input Fields & Parameter Controls
- Inputs use dark glass backgrounds (`rgba(4, 7, 17, 0.8)`) with `1px solid rgba(255, 255, 255, 0.12)`.
- Active focus state triggers an immediate crisp `#00E5FF` border with a subtle inner cyan glow (`box-shadow: inset 0 0 10px rgba(0, 229, 255, 0.15)`).
- Labels sit above inputs in `label-caps` format accompanied by coordinate unit indicators (e.g., `DEG`, `KM/S`, `UTC`).

### Checkboxes & Switch Reticles
- Toggles utilize rectangular flight-switch silhouettes rather than soft rounded pills.
- Checked state illuminates with a high-saturation Cyan `#00E5FF` core with sharp mechanical transitions (`100ms cubic-bezier(0, 0, 0.2, 1)`).

### Specialized Astro Components
- **Orbit Track Vector Dial:** Circular SVG viewport with calibrated tick marks at 15-degree increments and rotating trajectory arcs.
- **Spectrum Frequency Waveform:** Monospaced real-time data visualizer with dynamic linear SVG bars glowing in Telemetry Cyan and Propulsion Amber.
- **Coordinate Crosshairs:** Minimalist targeting reticle overlays positioned over astronomical celestial map views.