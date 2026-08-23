import React, { useState } from 'react';
import { LiveSignal, TickerInfo } from '../types/trading';
import { formatCurrency, formatPercent, getSignalBadgeColor } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  Calculator, 
  Zap, 
  CheckCircle2, 
  Flame,
  ArrowRight,
  Info,
  DollarSign
} from 'lucide-react';

interface LiveSignalCardProps {
  signal: LiveSignal;
  ticker: TickerInfo;
  onExecutePaperTrade: (signal: LiveSignal, riskAmount: number) => void;
}

export const LiveSignalCard: React.FC<LiveSignalCardProps> = ({
  signal,
  ticker,
  onExecutePaperTrade,
}) => {
  const [riskDollars, setRiskDollars] = useState<number>(150);
  const [copied, setCopied] = useState(false);

  const badgeStyle = getSignalBadgeColor(signal.signalType);
  const isBuy = signal.signalType === 'STRONG_BUY' || signal.signalType === 'BUY';
  const isSell = signal.signalType === 'STRONG_SELL' || signal.signalType === 'SELL';

  const handleExecute = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: isBuy ? ['#10b981', '#38bdf8', '#818cf8'] : ['#f43f5e', '#f59e0b', '#fb7185'],
    });

    onExecutePaperTrade(signal, riskDollars);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-2xl border border-slate-800/90 overflow-hidden shadow-card-dark">
      
      {/* Header Banner */}
      <div className="p-4 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              Live Signal Guidance
              <span className="text-[10px] font-normal text-slate-400 font-mono">({ticker.symbol})</span>
            </h3>
            <p className="text-[11px] text-slate-400">Institutional Confluence & Risk Matrix</p>
          </div>
        </div>

        {/* Signal Badge */}
        <div
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} ${badgeStyle.glow}`}
        >
          {isBuy && <Flame className="w-3.5 h-3.5" />}
          {signal.signalType.replace('_', ' ')}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        
        {/* Confidence Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              Confluence Confidence
              <Info className="w-3 h-3 text-slate-500" />
            </span>
            <span className="font-bold text-white">{signal.confidence}%</span>
          </div>
          <div className="h-2 w-full bg-dark-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                signal.confidence >= 75
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : signal.confidence >= 55
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500'
                  : 'bg-slate-600'
              }`}
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
        </div>

        {/* Trade Price Matrix Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Entry Zone */}
          <div className="glass-card p-3 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1 font-mono">
              <Target className="w-3.5 h-3.5 text-brand-primary" />
              <span>Recommended Entry</span>
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {formatCurrency(signal.entryZoneMin, ticker.decimals)} - {formatCurrency(signal.entryZoneMax, ticker.decimals)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Current: {formatCurrency(signal.currentPrice, ticker.decimals)}</div>
          </div>

          {/* Stop Loss */}
          <div className="glass-card p-3 rounded-xl border-l-2 border-l-rose-500">
            <div className="flex items-center gap-1.5 text-rose-400 text-[11px] mb-1 font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Stop-Loss (SL)</span>
            </div>
            <div className="font-mono text-sm font-bold text-rose-400">
              {formatCurrency(signal.stopLoss, ticker.decimals)}
            </div>
            <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">
              {formatPercent(signal.stopLossPct)} Risk
            </div>
          </div>

          {/* Take Profit 1 */}
          <div className="glass-card p-3 rounded-xl border-l-2 border-l-emerald-500">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] mb-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Take-Profit 1 (TP1)</span>
            </div>
            <div className="font-mono text-sm font-bold text-emerald-400">
              {formatCurrency(signal.takeProfit1, ticker.decimals)}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
              {formatPercent(signal.takeProfit1Pct)} (1:1.5 RRR)
            </div>
          </div>

          {/* Take Profit 2 */}
          <div className="glass-card p-3 rounded-xl border-l-2 border-l-cyan-400">
            <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] mb-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Take-Profit 2 (TP2)</span>
            </div>
            <div className="font-mono text-sm font-bold text-cyan-400">
              {formatCurrency(signal.takeProfit2, ticker.decimals)}
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
              {formatPercent(signal.takeProfit2Pct)} (1:{signal.riskRewardRatio} RRR)
            </div>
          </div>

        </div>

        {/* Fractional Kelly Position Sizing Section */}
        <div className="glass-card p-3.5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
              <Calculator className="w-4 h-4 text-brand-primary" />
              <span>Position Sizing (Fractional Kelly)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-mono">
              k = 0.35
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-dark-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Suggested Allocation</span>
              <span className="text-sm font-bold text-brand-primary">
                {signal.positionSizing.fractionalKellyPct}%
              </span>
              <span className="text-[9px] text-slate-500 block">
                (Full Kelly: {signal.positionSizing.fullKellyPct}%)
              </span>
            </div>

            <div className="p-2 rounded bg-dark-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Suggested Units</span>
              <span className="text-sm font-bold text-white">
                {signal.positionSizing.suggestedUnits} {ticker.category === 'CRYPTO' ? 'tokens' : 'shares'}
              </span>
              <span className="text-[9px] text-slate-500 block">
                (~{formatCurrency(signal.positionSizing.suggestedCapital)})
              </span>
            </div>
          </div>
        </div>

        {/* AI Trade Rationale Breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
            <span>⚡ AI Confluence Rationale</span>
          </div>
          <div className="space-y-1.5">
            {signal.rationale.map((point, index) => (
              <div
                key={index}
                className="text-xs text-slate-300 flex items-start gap-2 bg-dark-850 p-2 rounded-lg border border-slate-800"
              >
                <ArrowRight className="w-3.5 h-3.5 text-brand-primary mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Action Footer: Execute Paper Trade */}
      <div className="p-4 bg-dark-850 border-t border-slate-800">
        <button
          onClick={handleExecute}
          disabled={!isBuy && !isSell}
          className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            isBuy
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-glow-bull'
              : isSell
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-400 hover:to-pink-500 shadow-glow-bear'
              : 'bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 animate-bounce" />
              <span>Paper Trade Executed!</span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              <span>Execute Paper Trade ({signal.signalType.replace('_', ' ')})</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
