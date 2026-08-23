import React from 'react';
import { PaperPortfolio, Trade } from '../types/trading';
import { formatCurrency, formatPercent, formatTimestamp } from '../utils/formatters';
import { X, Wallet, TrendingUp, TrendingDown, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PaperTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PaperPortfolio;
  onClosePosition: (tradeId: string) => void;
  onResetPortfolio: () => void;
}

export const PaperTradingModal: React.FC<PaperTradingModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onClosePosition,
  onResetPortfolio,
}) => {
  if (!isOpen) return null;

  const totalEquity = portfolio.cashBalance + 
    portfolio.positions.reduce((sum, p) => sum + (p.investedCapital + (p.pnl || 0)), 0);

  const totalPnl = totalEquity - portfolio.initialCapital;
  const totalPnlPct = (totalPnl / portfolio.initialCapital) * 100;
  const isProfit = totalPnl >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Live Paper Trading Portfolio</h3>
              <p className="text-[11px] text-slate-400 font-mono">Zero-risk real-time execution sandbox (LocalStorage persistent)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPortfolio}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-dark-900 border border-slate-800 flex items-center gap-1 font-mono transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset ($10k)
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portfolio Stats Banner */}
        <div className="p-4 bg-dark-900 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-800 font-mono">
          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Paper Equity</span>
            <span className="text-base font-bold text-white">{formatCurrency(totalEquity)}</span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Cash Balance</span>
            <span className="text-base font-bold text-slate-300">{formatCurrency(portfolio.cashBalance)}</span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total P&L ($ / %)</span>
            <div className={`text-base font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(totalPnl)} ({formatPercent(totalPnlPct)})
            </div>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Open Positions</span>
            <span className="text-base font-bold text-brand-primary">{portfolio.positions.length} Active</span>
          </div>
        </div>

        {/* Positions & History Body */}
        <div className="p-4 flex-grow overflow-y-auto space-y-6">
          
          {/* Active Open Positions */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <span>Active Open Positions ({portfolio.positions.length})</span>
            </h4>

            {portfolio.positions.length === 0 ? (
              <div className="p-8 text-center bg-dark-850/50 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-500">
                No active positions open. Click "Execute Paper Trade" on any Live Signal to start!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-dark-850 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Asset</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Entry Price</th>
                      <th className="p-2.5">Size / Units</th>
                      <th className="p-2.5">Stop-Loss</th>
                      <th className="p-2.5">Take-Profit</th>
                      <th className="p-2.5 text-right">Unrealized P&L</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {portfolio.positions.map((pos) => {
                      const isWin = (pos.pnl || 0) >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-dark-850/60">
                          <td className="p-2.5 font-bold text-white">{pos.ticker}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {pos.type}
                            </span>
                          </td>
                          <td className="p-2.5 text-white">{formatCurrency(pos.entryPrice)}</td>
                          <td className="p-2.5 text-slate-300">{pos.size}</td>
                          <td className="p-2.5 text-rose-400">{formatCurrency(pos.stopLoss)}</td>
                          <td className="p-2.5 text-emerald-400">{formatCurrency(pos.takeProfit1)}</td>
                          <td className={`p-2.5 text-right font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(pos.pnl || 0)} ({formatPercent(pos.pnlPct || 0)})
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => onClosePosition(pos.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 border border-slate-700 text-[10px] transition-colors"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Closed Trades History */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300">
              Closed Trade History ({portfolio.closedTrades.length})
            </h4>

            {portfolio.closedTrades.length === 0 ? (
              <div className="p-4 text-center bg-dark-850/50 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-500">
                No closed trades yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-dark-850 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2">Asset</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Entry</th>
                      <th className="p-2">Exit</th>
                      <th className="p-2">Reason</th>
                      <th className="p-2 text-right">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {portfolio.closedTrades.map((t) => {
                      const isWin = (t.pnl || 0) >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-dark-850/40">
                          <td className="p-2 font-bold text-white">{t.ticker}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="p-2 text-slate-300">{formatCurrency(t.entryPrice)}</td>
                          <td className="p-2 text-slate-300">{t.exitPrice ? formatCurrency(t.exitPrice) : '-'}</td>
                          <td className="p-2">
                            <span className="px-1 py-0.5 rounded bg-dark-950 text-slate-400 text-[10px]">
                              {t.exitReason}
                            </span>
                          </td>
                          <td className={`p-2 text-right font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(t.pnl || 0)} ({formatPercent(t.pnlPct || 0)})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
