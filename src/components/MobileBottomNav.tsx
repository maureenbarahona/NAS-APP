import React from 'react';
import { LayoutDashboard, Compass, Radio, Flame, Crosshair } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'overview' | 'ephemeris' | 'spectrograph' | 'sequencer' | 'targeter';
  onTabChange: (tab: 'overview' | 'ephemeris' | 'spectrograph' | 'sequencer' | 'targeter') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ephemeris', label: 'Orbit', icon: Compass },
    { id: 'spectrograph', label: 'Spectra', icon: Radio },
    { id: 'sequencer', label: 'Burn', icon: Flame },
    { id: 'targeter', label: 'Targets', icon: Crosshair },
  ] as const;

  return (
    <nav
      aria-label="Mobile and Tablet Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0b0e17]/95 backdrop-blur-2xl border-t border-[#00e5ff]/20 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.85)]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isBurn = tab.id === 'sequencer';
        const isTarget = tab.id === 'targeter';

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all rounded py-1 px-1 relative ${
              isActive
                ? isBurn
                  ? 'text-[#ff5c00]'
                  : isTarget
                  ? 'text-[#d6c9ff]'
                  : 'text-[#00e5ff]'
                : 'text-[#8a99ad] hover:text-white'
            }`}
          >
            {/* Active micro indicator line at top */}
            {isActive && (
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full ${
                  isBurn ? 'bg-[#ff5c00]' : isTarget ? 'bg-[#7c4dff]' : 'bg-[#00e5ff]'
                }`}
              />
            )}

            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive ? 'scale-110 drop-shadow-[0_0_6px_currentColor]' : 'opacity-70'
              }`}
            />
            <span className="text-[10px] font-mono tracking-wider font-semibold uppercase leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
