import React, { useState } from 'react';
import { TickerInfo, AssetCategory } from '../types/trading';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface WatchlistBarProps {
  tickers: TickerInfo[];
  selectedTicker: TickerInfo;
  onSelectTicker: (ticker: TickerInfo) => void;
}

export const WatchlistBar: React.FC<WatchlistBarProps> = ({
  tickers,
  selectedTicker,
  onSelectTicker,
}) => {
  const [filter, setFilter] = useState<'ALL' | AssetCategory>('ALL');

  const filteredTickers = filter === 'ALL' 
    ? tickers 
    : tickers.filter(t => t.category === filter);

  return (
    <div className="bg-dark-900 border-b border-slate-800/80 px-4 py-2">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(['ALL', 'CRYPTO', 'STOCKS', 'FOREX', 'COMMODITIES'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === cat
                  ? 'bg-slate-800 text-brand-primary border border-brand-primary/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ticker Cards */}
        <div className="flex items-center gap-2 flex-grow overflow-x-auto py-0.5">
          {filteredTickers.map((ticker) => {
            const isSelected = ticker.symbol === selectedTicker.symbol;
            const isPositive = ticker.change24h >= 0;

            return (
              <button
                key={ticker.symbol}
                onClick={() => onSelectTicker(ticker)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-brand-primary/15 border-brand-primary/50 text-white shadow-glow-sky'
                    : 'bg-dark-850 hover:bg-dark-800 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="font-mono font-bold text-xs leading-none flex items-center gap-1">
                    {ticker.symbol}
                    {ticker.dataMode === 'live' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {formatCurrency(ticker.price, ticker.decimals)}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-0.5 text-[11px] font-mono font-semibold ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatPercent(ticker.change24h)}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
