import React from 'react';
import { DataMode } from '../types/trading';
import { Radio, Database, Info } from 'lucide-react';

interface DataModeBadgeProps {
  mode: DataMode;
  sourceDescription: string;
}

export const DataModeBadge: React.FC<DataModeBadgeProps> = ({ mode, sourceDescription }) => {
  const isLive = mode === 'live';

  return (
    <div className="relative group flex items-center">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all ${
          isLive
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glow-bull'
            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isLive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isLive ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          ></span>
        </span>
        
        {isLive ? (
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3" />
            LIVE WS
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            SIMULATED
          </span>
        )}

        <Info className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5 cursor-help" />
      </div>

      {/* Tooltip */}
      <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 w-64 p-2.5 rounded-lg glass-dropdown text-xs text-slate-300 shadow-xl border border-slate-700/50 pointer-events-none">
        <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
          {isLive ? '🟢 Real-Time Data Stream' : '🟡 High-Fidelity Replay'}
        </div>
        <p className="text-slate-400 leading-relaxed">{sourceDescription}</p>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-500">
          See <span className="text-brand-primary">LIMITATIONS.md</span> for data provenance details.
        </div>
      </div>
    </div>
  );
};
