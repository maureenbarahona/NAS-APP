import React, { useState } from 'react';
import { TelemetryEvent } from '../types/telemetry';
import { Terminal, Send, Filter } from 'lucide-react';

interface MissionEventLogProps {
  events: TelemetryEvent[];
  onAddManualEvent: (event: TelemetryEvent) => void;
}

export const MissionEventLog: React.FC<MissionEventLogProps> = ({
  events,
  onAddManualEvent,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [commandInput, setCommandInput] = useState<string>('');

  const filteredEvents = filter === 'ALL'
    ? events
    : events.filter((e) => e.subsystem === filter);

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const now = new Date();
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;

    onAddManualEvent({
      id: `cmd-${Date.now()}`,
      timestamp: timeStr,
      subsystem: 'COMM',
      severity: 'nominal',
      message: `UPLINK CMD QUEUE: "${commandInput.trim()}" transmitted via Deep Space Network.`,
    });

    setCommandInput('');
  };

  return (
    <div className="hud-panel p-4 rounded flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00e5ff]" />
          <span className="label-caps text-[#c3f5ff]">
            MISSION TELEMETRY & EVENT LOG
          </span>
        </div>

        {/* Subsystem Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs font-mono flex-wrap">
          {['ALL', 'COMM', 'NAV', 'PROP', 'PAYLOAD'].map((sub) => (
            <button
              key={sub}
              onClick={() => setFilter(sub)}
              className={`min-h-[36px] px-2.5 py-1 rounded transition-colors touch-manipulation flex items-center justify-center font-medium ${
                filter === sub
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/50'
                  : 'text-[#8a99ad] hover:text-white border border-transparent'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed List */}
      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
        {filteredEvents.map((evt) => {
          const isBurn = evt.severity === 'burn';
          const isWarn = evt.severity === 'warning';
          const isCrit = evt.severity === 'critical';

          return (
            <div
              key={evt.id}
              className={`p-2 rounded border transition-colors flex items-start gap-2.5 ${
                isBurn
                  ? 'bg-[#291307]/60 border-[#ff5c00]/40 text-[#ffb59a]'
                  : isCrit
                  ? 'bg-[#3b0a0e]/60 border-[#ff5449]/40 text-[#ffb4ab]'
                  : isWarn
                  ? 'bg-[#2a1c06]/60 border-[#ffba28]/40 text-[#ffe084]'
                  : 'bg-[#040711]/60 border-white/5 text-[#bac9cc]'
              }`}
            >
              <span className="text-[10px] text-[#8a99ad] shrink-0 tabular-nums pt-0.5">
                {evt.timestamp}
              </span>

              <span
                className={`label-caps px-1 py-0.2 rounded text-[9px] shrink-0 ${
                  isBurn
                    ? 'bg-[#ff5c00]/30 text-[#ff5c00]'
                    : isCrit
                    ? 'bg-[#ff5449]/30 text-[#ffb4ab]'
                    : isWarn
                    ? 'bg-[#ffba28]/30 text-[#ffe084]'
                    : 'bg-[#00e5ff]/20 text-[#00e5ff]'
                }`}
              >
                {evt.subsystem}
              </span>

              <span className="text-xs leading-relaxed flex-1">
                {evt.message}
              </span>
            </div>
          );
        })}
      </div>

      {/* Flight Controller Command Uplink Form */}
      <form onSubmit={handleSendCommand} className="flex items-center gap-2 pt-2 border-t border-white/10">
        <div className="relative flex-1">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Transmit telecommand to spacecraft (e.g. DUMP_MOMENTUM)..."
            className="w-full min-h-[44px] bg-[#040711]/90 border border-white/15 focus:border-[#00e5ff] rounded px-3 py-2 font-mono text-xs text-white placeholder:text-[#8a99ad]/60 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          className="btn-flight-cyan min-h-[44px] px-4 py-2 rounded flex items-center justify-center gap-1.5 font-mono text-xs font-semibold touch-manipulation shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-inherit" />
          <span>UPLINK</span>
        </button>
      </form>
    </div>
  );
};
