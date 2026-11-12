import React from 'react';
import { Radio, Activity } from 'lucide-react';

interface TopNavProps {
  activeTab: 'overview' | 'ephemeris' | 'spectrograph' | 'sequencer' | 'targeter';
  onTabChange: (tab: 'overview' | 'ephemeris' | 'spectrograph' | 'sequencer' | 'targeter') => void;
  isLiveDownlink: boolean;
  onToggleDownlink: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  isLiveDownlink,
  onToggleDownlink,
}) => {
  return (
    <header className="flex items-center justify-between gap-3 sm:gap-8 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#0b0e17]/95 backdrop-blur-xl border-b border-[#00e5ff]/20 sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark (Single text element in Space Grotesk) */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('overview');
        }}
        className="flex items-center gap-2 whitespace-nowrap shrink-0 group text-decoration-none min-h-[44px]"
      >
        <div className="w-2.5 h-2.5 rounded-sm bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] group-hover:scale-110 transition-transform" />
        <span className="font-display font-bold text-sm sm:text-lg tracking-tight text-white group-hover:text-[#c3f5ff] transition-colors">
          ASTROTELEMETRY<span className="hidden xs:inline"> EXPLORER</span>
        </span>
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-mono tracking-wider font-semibold">
        <button
          onClick={() => onTabChange('overview')}
          className={`whitespace-nowrap shrink-0 transition-colors uppercase py-1 ${
            activeTab === 'overview'
              ? 'text-[#00e5ff] border-b-2 border-[#00e5ff]'
              : 'text-[#8a99ad] hover:text-white'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => onTabChange('ephemeris')}
          className={`whitespace-nowrap shrink-0 transition-colors uppercase py-1 ${
            activeTab === 'ephemeris'
              ? 'text-[#00e5ff] border-b-2 border-[#00e5ff]'
              : 'text-[#8a99ad] hover:text-white'
          }`}
        >
          Orbital Ephemeris
        </button>

        <button
          onClick={() => onTabChange('spectrograph')}
          className={`whitespace-nowrap shrink-0 transition-colors uppercase py-1 ${
            activeTab === 'spectrograph'
              ? 'text-[#00e5ff] border-b-2 border-[#00e5ff]'
              : 'text-[#8a99ad] hover:text-white'
          }`}
        >
          Radio Spectrograph
        </button>

        <button
          onClick={() => onTabChange('sequencer')}
          className={`whitespace-nowrap shrink-0 transition-colors uppercase py-1 ${
            activeTab === 'sequencer'
              ? 'text-[#ff5c00] border-b-2 border-[#ff5c00]'
              : 'text-[#8a99ad] hover:text-white'
          }`}
        >
          Flight Sequencer
        </button>

        <button
          onClick={() => onTabChange('targeter')}
          className={`whitespace-nowrap shrink-0 transition-colors uppercase py-1 ${
            activeTab === 'targeter'
              ? 'text-[#7c4dff] border-b-2 border-[#7c4dff]'
              : 'text-[#8a99ad] hover:text-white'
          }`}
        >
          Deep Sky Targeter
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action + Author Link */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <a
          href="https://maureenbarahona.foo"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#c3f5ff] hover:text-[#00e5ff] border border-[#00e5ff]/30 text-xs font-mono font-semibold transition-all"
          title="Demo desarrollado por Maureen Barahona para NASA Space Apps Challenge"
        >
          <span>NASA Space Apps Demo</span>
          <span className="text-[10px] text-[#00e5ff]">↗</span>
        </a>

        <button
          onClick={onToggleDownlink}
          className={`btn-flight-cyan px-3 sm:px-3.5 py-2 min-h-[44px] rounded flex items-center gap-2 text-xs font-semibold whitespace-nowrap shrink-0 touch-manipulation ${
            !isLiveDownlink ? 'opacity-60 border-white/20 text-[#8a99ad]' : ''
          }`}
          aria-label={isLiveDownlink ? 'Pause DSN Downlink' : 'Activate DSN Downlink'}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isLiveDownlink ? 'bg-[#00e5ff] shadow-[0_0_6px_#00e5ff] animate-pulse' : 'bg-[#8a99ad]'
            }`}
          />
          <span className="hidden sm:inline">{isLiveDownlink ? 'DSN DOWNLINK ACTIVE' : 'DOWNLINK PAUSED'}</span>
          <span className="sm:hidden">{isLiveDownlink ? 'DOWNLINK ACTIVE' : 'PAUSED'}</span>
        </button>
      </div>
    </header>
  );
};
