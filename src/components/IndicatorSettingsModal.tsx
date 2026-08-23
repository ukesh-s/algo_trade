import React from 'react';
import { X, SlidersHorizontal, Eye, Bell, Check } from 'lucide-react';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showEma: boolean;
  setShowEma: (val: boolean) => void;
  showBollinger: boolean;
  setShowBollinger: (val: boolean) => void;
  showVolume: boolean;
  setShowVolume: (val: boolean) => void;
}

export const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({
  isOpen,
  onClose,
  showEma,
  setShowEma,
  showBollinger,
  setShowBollinger,
  showVolume,
  setShowVolume,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Chart Overlays & Display</h3>
              <p className="text-[11px] text-slate-400 font-mono">Configure TradingView indicators</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle List */}
        <div className="p-5 space-y-4 font-mono text-xs">
          
          {/* EMA Overlay */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-slate-800">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-primary"></span>
                <span>Exponential Moving Averages</span>
              </div>
              <span className="text-[10px] text-slate-400">Fast 20 EMA (Sky) & Slow 50 EMA (Indigo)</span>
            </div>
            <button
              onClick={() => setShowEma(!showEma)}
              className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                showEma ? 'bg-brand-primary justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Bollinger Bands */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-slate-800">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                <span>Bollinger Bands (20, 2σ)</span>
              </div>
              <span className="text-[10px] text-slate-400">Volatility Envelope & Mean Reversion bounds</span>
            </div>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                showBollinger ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-slate-800">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Volume Profile Histogram</span>
              </div>
              <span className="text-[10px] text-slate-400">Sub-chart trading volume bars</span>
            </div>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                showVolume ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-dark-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-primary text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>

      </div>
    </div>
  );
};
