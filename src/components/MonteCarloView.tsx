import React from 'react';
import { MonteCarloResult } from '../types/trading';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { Dices, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface MonteCarloViewProps {
  monteCarloResult: MonteCarloResult;
  onRerunSimulation: () => void;
}

export const MonteCarloView: React.FC<MonteCarloViewProps> = ({
  monteCarloResult,
  onRerunSimulation,
}) => {
  // Format chart data for 100 steps
  const chartData = monteCarloResult.p50Trajectory.map((medianVal, idx) => ({
    step: idx,
    p95: monteCarloResult.p95Trajectory[idx],
    p50: medianVal,
    p5: monteCarloResult.p5Trajectory[idx],
  }));

  return (
    <div className="max-w-[1720px] mx-auto p-4 space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-card-dark flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 shadow-glow-purple">
            <Dices className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              1,000-Path Monte Carlo Stress Simulator
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                1,000 Iterations
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates if your strategy possesses a true statistical edge or just historical luck by bootstrapping 1,000 alternative future realities.
            </p>
          </div>
        </div>

        <button
          onClick={onRerunSimulation}
          className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-dark-850 hover:bg-dark-800 text-white border border-slate-700 flex items-center gap-2 transition-all hover:border-purple-500 shadow-md"
        >
          <RefreshCw className="w-4 h-4 text-purple-400" />
          <span>Resimulate 1,000 Paths</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Ruin Probability */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Probability of Ruin (&gt;50% Drawdown)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {monteCarloResult.ruinProbabilityPct}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            {monteCarloResult.ruinProbabilityPct < 5 ? '🟢 Minimal Risk of Ruin' : '🔴 High Risk of Ruin'}
          </div>
        </div>

        {/* 95% Confidence Worst-Case Drawdown */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Worst-Case Drawdown (95% Conf.)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            -{monteCarloResult.worstCaseDrawdownPct}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Max expected historical drop
          </div>
        </div>

        {/* Median Final Balance */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Median Expected Balance (100 trades)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(monteCarloResult.medianFinalBalance)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Started from $10,000 initial capital
          </div>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 1,000 Path Percentile Fan Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 shadow-card-dark space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Multi-Universe Confidence Band Trajectories</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">95th %ile (Bullish)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                <span className="text-slate-300 font-bold">50th %ile (Median)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                <span className="text-slate-400">5th %ile (Bearish)</span>
              </div>
            </div>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={11} />
                <YAxis 
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                  stroke="#64748b" 
                  fontSize={11}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: number) => [formatCurrency(val), '']}
                  labelFormatter={(step) => `Future Step: #${step}`}
                />
                <Line type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={1.5} dot={false} name="95th Percentile" />
                <Line type="monotone" dataKey="p50" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Median Trajectory" />
                <Line type="monotone" dataKey="p5" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="5th Percentile" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Drawdown Probability Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-card-dark space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Drawdown Probability Distribution</span>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monteCarloResult.drawdownHistogram} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" />
                <YAxis dataKey="range" type="category" stroke="#94a3b8" fontSize={11} width={70} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: number) => [`${val}% of simulations`, 'Frequency']}
                />
                <Bar dataKey="percentage" fill="#818cf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
