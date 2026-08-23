import React, { useState } from 'react';
import { BacktestMetrics, WalkForwardResult, Strategy, TickerInfo } from '../types/trading';
import { formatCurrency, formatPercent, formatTimestamp, formatNumber } from '../utils/formatters';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Percent, 
  Activity, 
  Scale, 
  Layers, 
  Clock, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface BacktestDashboardProps {
  metrics: BacktestMetrics;
  walkForwardResult: WalkForwardResult;
  strategy: Strategy;
  ticker: TickerInfo;
}

export const BacktestDashboard: React.FC<BacktestDashboardProps> = ({
  metrics,
  walkForwardResult,
  strategy,
  ticker,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'equity' | 'walkforward' | 'trades'>('equity');

  const isProfit = metrics.totalReturnPct >= 0;

  return (
    <div className="max-w-[1720px] mx-auto p-4 space-y-6 animate-fade-in">
      
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Total Return */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-brand-primary" />
            <span>Total Return</span>
          </div>
          <div className={`text-base font-bold font-mono mt-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatPercent(metrics.totalReturnPct)}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            Bench: {formatPercent(metrics.benchmarkReturnPct)}
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-400" />
            <span>Sharpe Ratio</span>
          </div>
          <div className="text-base font-bold font-mono mt-1 text-white">
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            {metrics.sharpeRatio >= 1.5 ? 'Institutional Grade' : 'Moderate'}
          </div>
        </div>

        {/* Sortino Ratio */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Scale className="w-3 h-3 text-indigo-400" />
            <span>Sortino Ratio</span>
          </div>
          <div className="text-base font-bold font-mono mt-1 text-indigo-300">
            {metrics.sortinoRatio.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">Downside Adjusted</div>
        </div>

        {/* Max Drawdown */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Max Drawdown</span>
          </div>
          <div className="text-base font-bold font-mono mt-1 text-rose-400">
            -{metrics.maxDrawdownPct.toFixed(1)}%
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">Peak-to-Trough</div>
        </div>

        {/* Win Rate */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Percent className="w-3 h-3 text-emerald-400" />
            <span>Win Rate</span>
          </div>
          <div className="text-base font-bold font-mono mt-1 text-white">
            {metrics.winRatePct.toFixed(1)}%
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            {metrics.winningTrades}W / {metrics.losingTrades}L
          </div>
        </div>

        {/* Profit Factor */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-amber-400" />
            <span>Profit Factor</span>
          </div>
          <div className="text-base font-bold font-mono mt-1 text-amber-300">
            {metrics.profitFactor.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">Gross Win/Loss</div>
        </div>

        {/* Total Trades */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Total Trades</span>
          </div>
          <div className="text-base font-bold font-mono mt-1 text-white">
            {metrics.totalTrades}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">~8 bars avg hold</div>
        </div>

        {/* Expectancy */}
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Expectancy</span>
          </div>
          <div className="text-base font-bold font-mono mt-1 text-white">
            {formatCurrency(metrics.expectancyDollars)}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">Per Executed Trade</div>
        </div>

      </div>

      {/* Main Analytics Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-card-dark">
        
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center justify-between px-5 py-3 bg-dark-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('equity')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeSubTab === 'equity'
                  ? 'bg-brand-primary text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Equity Curve vs Benchmark
            </button>

            <button
              onClick={() => setActiveSubTab('walkforward')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                activeSubTab === 'walkforward'
                  ? 'bg-brand-primary text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Walk-Forward Validation</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                walkForwardResult.robustnessGrade === 'Robust'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {walkForwardResult.robustnessGrade}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('trades')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeSubTab === 'trades'
                  ? 'bg-brand-primary text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Trade Ledger ({metrics.tradeLog.length})
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Strategy: <span className="text-white font-bold">{strategy.name}</span>
          </div>
        </div>

        {/* Tab 1: Equity Curve Chart */}
        {activeSubTab === 'equity' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-primary"></span>
                  <span className="text-slate-300 font-bold">Quantum Strategy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                  <span className="text-slate-400">Buy & Hold Benchmark</span>
                </div>
              </div>
              <span className="text-slate-400">Initial Capital: $10,000.00</span>
            </div>

            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.equityCurve}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => new Date(time * 1000).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                    stroke="#64748b" 
                    fontSize={11}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    stroke="#64748b"
                    fontSize={11}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: number) => [formatCurrency(val), '']}
                    labelFormatter={(time: number) => formatTimestamp(time)}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" name="Strategy Equity" />
                  <Line type="monotone" dataKey="benchmarkEquity" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Benchmark" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Walk-Forward Validation (WFV) View */}
        {activeSubTab === 'walkforward' && (
          <div className="p-5 space-y-6">
            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {walkForwardResult.robustnessGrade === 'Robust' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <h4 className="font-bold text-sm text-white">
                    Walk-Forward Robustness Grade: {walkForwardResult.robustnessGrade}
                  </h4>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  WFE: {walkForwardResult.walkForwardEfficiencyPct}%
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Walk-Forward Validation tests whether the strategy retains its statistical edge on un-optimized, held-out historical windows. High Walk-Forward Efficiency (&gt;65%) proves resistance to data-mining bias and curve-fitting.
              </p>
            </div>

            {/* Rolling Windows Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {walkForwardResult.windows.map((win) => (
                <div key={win.windowIndex} className="glass-card p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs font-mono text-white">{win.periodLabel}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      WFE: {formatPercent(win.efficiencyRatio * 100, false)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-dark-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">In-Sample (Train)</span>
                      <div className="font-bold text-emerald-400 mt-0.5">
                        Sharpe: {win.inSampleMetrics.sharpeRatio}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ret: {formatPercent(win.inSampleMetrics.totalReturnPct)}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-dark-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Out-of-Sample (Test)</span>
                      <div className="font-bold text-cyan-400 mt-0.5">
                        Sharpe: {win.outOfSampleMetrics.sharpeRatio}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ret: {formatPercent(win.outOfSampleMetrics.totalReturnPct)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Trade Log Table */}
        {activeSubTab === 'trades' && (
          <div className="overflow-x-auto max-h-[420px] p-2">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-dark-850 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Entry Time</th>
                  <th className="p-2.5">Entry Price</th>
                  <th className="p-2.5">Exit Price</th>
                  <th className="p-2.5">Exit Reason</th>
                  <th className="p-2.5 text-right">Net P&L ($)</th>
                  <th className="p-2.5 text-right">Return %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.tradeLog.map((trade, idx) => {
                  const isWin = (trade.pnl || 0) > 0;
                  return (
                    <tr key={trade.id} className="hover:bg-dark-850/60 transition-colors">
                      <td className="p-2.5 text-slate-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{formatTimestamp(trade.entryTime)}</td>
                      <td className="p-2.5 text-white">{formatCurrency(trade.entryPrice, ticker.decimals)}</td>
                      <td className="p-2.5 text-white">{trade.exitPrice ? formatCurrency(trade.exitPrice, ticker.decimals) : '-'}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-dark-950 text-slate-300 text-[10px]">
                          {trade.exitReason}
                        </span>
                      </td>
                      <td className={`p-2.5 text-right font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(trade.pnl || 0)}
                      </td>
                      <td className={`p-2.5 text-right font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPercent(trade.pnlPct || 0)}
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
  );
};
