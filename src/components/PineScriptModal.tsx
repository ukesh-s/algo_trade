import React, { useState } from 'react';
import { Strategy } from '../types/trading';
import { generatePineScriptV5, generatePythonCode } from '../services/pineScriptGenerator';
import { X, Copy, Check, Code2, Terminal, ExternalLink } from 'lucide-react';

interface PineScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: Strategy;
}

export const PineScriptModal: React.FC<PineScriptModalProps> = ({
  isOpen,
  onClose,
  strategy,
}) => {
  const [activeTab, setActiveTab] = useState<'pinescript' | 'python'>('pinescript');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pineScriptCode = generatePineScriptV5(strategy);
  const pythonCode = generatePythonCode(strategy);
  const activeCode = activeTab === 'pinescript' ? pineScriptCode : pythonCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Algorithmic Code Exporter</h3>
              <p className="text-[11px] text-slate-400 font-mono">1-Click Pine Script v5 & Python Backtrader</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Copy Button */}
        <div className="p-3 bg-dark-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pinescript')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'pinescript'
                  ? 'bg-brand-primary text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>TradingView Pine Script (v5)</span>
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'python'
                  ? 'bg-brand-primary text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Python (Backtrader)</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all hover:border-brand-primary shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-brand-primary" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 flex-grow overflow-y-auto bg-dark-950 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">
            <code>{activeCode}</code>
          </pre>
        </div>

        {/* Footer Instructions */}
        <div className="p-3.5 bg-dark-850 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>
            {activeTab === 'pinescript'
              ? 'Paste directly into TradingView.com → Pine Editor → Add to Chart.'
              : 'Save as strategy.py and execute with Python 3.10+ (pip install backtrader).'}
          </span>
          <a
            href="https://www.tradingview.com/pine-script-docs/en/v5/index.html"
            target="_blank"
            rel="noreferrer"
            className="text-brand-primary hover:underline flex items-center gap-1"
          >
            <span>Pine Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
