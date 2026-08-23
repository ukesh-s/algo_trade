import React from 'react';
import { TickerInfo, PaperPortfolio } from '../types/trading';
import { DataModeBadge } from './DataModeBadge';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { 
  Activity, 
  Cpu, 
  BarChart3, 
  Dices, 
  Wallet, 
  Code2, 
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentTicker: TickerInfo;
  availableTickers: TickerInfo[];
  onSelectTicker: (ticker: TickerInfo) => void;
  activeTab: 'copilot' | 'backtest' | 'strategy' | 'montecarlo';
  onChangeTab: (tab: 'copilot' | 'backtest' | 'strategy' | 'montecarlo') => void;
  paperPortfolio: PaperPortfolio;
  onOpenPaperModal: () => void;
  onOpenPineScriptModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTicker,
  availableTickers,
  onSelectTicker,
  activeTab,
  onChangeTab,
  paperPortfolio,
  onOpenPaperModal,
  onOpenPineScriptModal,
  onOpenSettingsModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const isPositive = currentTicker.change24h >= 0;

  const totalPaperEquity = paperPortfolio.cashBalance + 
    paperPortfolio.positions.reduce((sum, p) => sum + (p.investedCapital + (p.pnl || 0)), 0);
  
  const paperTotalPnl = totalPaperEquity - paperPortfolio.initialCapital;
  const paperPnlPct = (paperTotalPnl / paperPortfolio.initialCapital) * 100;

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Brand + Ticker Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-glow-sky">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  QuantumBacktest
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">AI Quant Lab & Live Copilot</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          {/* Ticker Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700/60 transition-all text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-sm text-white">{currentTicker.symbol}</span>
                  <span className="text-xs text-slate-400">{currentTicker.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs mt-0.5">
                  <span className="text-white font-medium">{formatCurrency(currentTicker.price, currentTicker.decimals)}</span>
                  <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercent(currentTicker.change24h)}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 glass-dropdown rounded-xl shadow-2xl p-2 z-50 animate-fade-in border border-slate-700/60">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Asset
                </div>
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {availableTickers.map((t) => (
                    <button
                      key={t.symbol}
                      onClick={() => {
                        onSelectTicker(t);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        t.symbol === currentTicker.symbol
                          ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                          : 'hover:bg-slate-800/60 text-slate-200'
                      }`}
                    >
                      <div className="text-left font-mono">
                        <div className="font-bold">{t.symbol}</div>
                        <div className="text-[10px] text-slate-400">{t.name}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-white font-medium">{formatCurrency(t.price, t.decimals)}</div>
                        <div className={`text-[10px] ${t.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatPercent(t.change24h)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DataModeBadge mode={currentTicker.dataMode} sourceDescription={currentTicker.sourceDescription} />
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center bg-dark-900/90 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onChangeTab('copilot')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'copilot'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-glow-sky'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Copilot</span>
          </button>

          <button
            onClick={() => onChangeTab('backtest')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'backtest'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-glow-sky'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Quant Backtester</span>
          </button>

          <button
            onClick={() => onChangeTab('strategy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'strategy'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-glow-sky'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Strategy Lab</span>
          </button>

          <button
            onClick={() => onChangeTab('montecarlo')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'montecarlo'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-glow-sky'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Monte Carlo Risk</span>
          </button>
        </div>

        {/* Right: Paper Portfolio & Quick Tool Modals */}
        <div className="flex items-center gap-2.5">
          {/* Paper Trading Balance Pill */}
          <button
            onClick={onOpenPaperModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700/60 text-xs transition-all group"
          >
            <Wallet className="w-3.5 h-3.5 text-brand-primary group-hover:scale-110 transition-transform" />
            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-400 block -mb-0.5">Paper Equity</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">{formatCurrency(totalPaperEquity)}</span>
                <span className={`text-[10px] font-semibold ${paperTotalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(paperPnlPct)}
                </span>
              </div>
            </div>
            {paperPortfolio.positions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                {paperPortfolio.positions.length} open
              </span>
            )}
          </button>

          {/* PineScript Exporter */}
          <button
            onClick={onOpenPineScriptModal}
            title="Export Pine Script v5 / Python code"
            className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-brand-primary border border-slate-700/60 transition-colors"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Indicators Settings */}
          <button
            onClick={onOpenSettingsModal}
            title="Chart & Indicator Overlays"
            className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-brand-primary border border-slate-700/60 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
