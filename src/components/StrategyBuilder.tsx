import React, { useState } from 'react';
import { Strategy } from '../types/trading';
import { DEFAULT_STRATEGIES } from '../data/defaultStrategies';
import { generateStrategyFromPrompt } from '../services/geminiService';
import { 
  Sparkles, 
  Cpu, 
  Play, 
  Sliders, 
  Code2, 
  Check, 
  ArrowRight, 
  ShieldAlert, 
  Target,
  Layers
} from 'lucide-react';

interface StrategyBuilderProps {
  currentStrategy: Strategy;
  onApplyStrategy: (strategy: Strategy) => void;
  onOpenPineScriptModal: () => void;
}

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({
  currentStrategy,
  onApplyStrategy,
  onOpenPineScriptModal,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(currentStrategy.id);

  // Local parameter adjustments
  const [slMultiplier, setSlMultiplier] = useState(currentStrategy.stopLossAtrMultiplier);
  const [tpMultiplier, setTpMultiplier] = useState(currentStrategy.takeProfit1Multiplier);
  const [kellyMultiplier, setKellyMultiplier] = useState(currentStrategy.fullKellyMultiplier || 0.35);

  const samplePrompts = [
    'Buy Bitcoin when 14-day RSI is below 30 and 20 EMA is above 50 EMA on 1h timeframe',
    'Enter long on Bollinger Band lower touch with positive MACD histogram, exit at upper band',
    'Supertrend trend-following strategy with 2.0x ATR trailing stop on 15m candles'
  ];

  const handleGenerateAI = async () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateStrategyFromPrompt(promptText);
      onApplyStrategy(generated);
      setSelectedPresetId(generated.id);
    } catch {
      // handled
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset: Strategy) => {
    setSelectedPresetId(preset.id);
    setSlMultiplier(preset.stopLossAtrMultiplier);
    setTpMultiplier(preset.takeProfit1Multiplier);
    setKellyMultiplier(preset.fullKellyMultiplier);
    onApplyStrategy(preset);
  };

  const handleSaveParameters = () => {
    const updated: Strategy = {
      ...currentStrategy,
      stopLossAtrMultiplier: slMultiplier,
      takeProfit1Multiplier: tpMultiplier,
      fullKellyMultiplier: kellyMultiplier,
    };
    onApplyStrategy(updated);
  };

  return (
    <div className="max-w-[1720px] mx-auto p-4 space-y-6 animate-fade-in">
      
      {/* Top Banner: AI Quant Copilot */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-card-dark relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-glow-sky">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Natural Language Strategy Generator
              <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-mono">
                Serverless AI Proxy
              </span>
            </h2>
            <p className="text-xs text-slate-400">Describe your hypothesis in plain English; our compiler transforms it into algorithmic logic.</p>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="relative mt-4">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. Buy when RSI < 30 and price is testing lower Bollinger Band. Stop loss 1.5x ATR, take profit 2.5x ATR on 1h timeframe..."
            rows={3}
            className="w-full bg-dark-950/80 border border-slate-700/80 rounded-xl p-4 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all resize-none shadow-inner"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            {/* Quick Prompt Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">Try:</span>
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(sp)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-dark-850 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono flex-shrink-0 transition-colors"
                >
                  {sp.slice(0, 38)}...
                </button>
              ))}
            </div>

            {/* Compile Button */}
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating || !promptText.trim()}
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center gap-2 shadow-glow-sky transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Compiling Strategy...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Compile & Apply Algo</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Grid: Presets & Parameter Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Preset Quant Strategies */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Layers className="w-4 h-4 text-brand-primary" />
            <span>Pre-Built Quant Strategies</span>
          </div>

          <div className="space-y-2.5">
            {DEFAULT_STRATEGIES.map((strat) => {
              const isSelected = strat.id === selectedPresetId;
              return (
                <button
                  key={strat.id}
                  onClick={() => handleSelectPreset(strat)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-brand-primary/15 border-brand-primary text-white shadow-glow-sky'
                      : 'bg-dark-850 hover:bg-dark-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono">{strat.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-950 text-slate-400 font-mono">
                      {strat.timeframe}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{strat.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Active Strategy Rules Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Cpu className="w-4 h-4 text-brand-primary" />
              <span>Active Rule Schema</span>
            </div>
            <button
              onClick={onOpenPineScriptModal}
              className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-mono"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pine Script</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-emerald-400 block mb-1.5 font-bold">
                🟢 Long Entry Rules (Buy)
              </span>
              <div className="space-y-1.5">
                {currentStrategy.buyRules.map((rule, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-dark-850 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{rule.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono text-rose-400 block mb-1.5 font-bold">
                🔴 Short / Exit Rules (Sell)
              </span>
              <div className="space-y-1.5">
                {currentStrategy.sellRules.map((rule, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-dark-850 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span>{rule.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Risk Multipliers & Kelly Sizing */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sliders className="w-4 h-4 text-brand-primary" />
            <span>Risk Parameter Tuning</span>
          </div>

          <div className="space-y-4">
            {/* Stop Loss Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Stop-Loss ATR Multiplier
                </span>
                <span className="font-bold text-white">{slMultiplier}x ATR</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="4.0"
                step="0.1"
                value={slMultiplier}
                onChange={(e) => setSlMultiplier(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Take Profit Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  Take-Profit 1 Multiplier
                </span>
                <span className="font-bold text-white">{tpMultiplier}x ATR</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.2"
                value={tpMultiplier}
                onChange={(e) => setTpMultiplier(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Fractional Kelly Multiplier */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Fractional Kelly Multiplier (k)</span>
                <span className="font-bold text-brand-primary">{kellyMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.60"
                step="0.05"
                value={kellyMultiplier}
                onChange={(e) => setKellyMultiplier(parseFloat(e.target.value))}
                className="w-full accent-brand-primary"
              />
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                Safe range: 0.25x - 0.35x to prevent ruin.
              </span>
            </div>

            <button
              onClick={handleSaveParameters}
              className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-dark-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-brand-primary" />
              <span>Apply Parameters</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
