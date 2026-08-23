import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TickerInfo, 
  Candle, 
  TimeFrame, 
  Strategy, 
  LiveSignal, 
  PaperPortfolio, 
  Trade 
} from './types/trading';
import { AVAILABLE_TICKERS, generateHistoricalCandles } from './data/mockMarketData';
import { DEFAULT_STRATEGIES } from './data/defaultStrategies';
import { liveDataService } from './services/liveDataService';
import { getIndicatorsAtIndex } from './services/indicatorService';
import { evaluateLiveSignal } from './services/strategyEngine';
import { runBacktest, runWalkForwardValidation } from './services/backtestEngine';
import { runMonteCarloSimulation } from './services/monteCarloEngine';

import { Header } from './components/Header';
import { WatchlistBar } from './components/WatchlistBar';
import { TradingChart } from './components/TradingChart';
import { LiveSignalCard } from './components/LiveSignalCard';
import { StrategyBuilder } from './components/StrategyBuilder';
import { BacktestDashboard } from './components/BacktestDashboard';
import { MonteCarloView } from './components/MonteCarloView';
import { PaperTradingModal } from './components/PaperTradingModal';
import { PineScriptModal } from './components/PineScriptModal';
import { IndicatorSettingsModal } from './components/IndicatorSettingsModal';

import { SeriesMarker, Time } from 'lightweight-charts';

const INITIAL_PAPER_PORTFOLIO: PaperPortfolio = {
  initialCapital: 10000,
  cashBalance: 10000,
  equity: 10000,
  realizedPnl: 0,
  unrealizedPnl: 0,
  positions: [],
  closedTrades: [],
};

export const App: React.FC = () => {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'copilot' | 'backtest' | 'strategy' | 'montecarlo'>('copilot');
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPineModalOpen, setIsPineModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Indicator Visibility
  const [showEma, setShowEma] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // Market & Strategy State
  const [tickers, setTickers] = useState<TickerInfo[]>(AVAILABLE_TICKERS);
  const [currentTicker, setCurrentTicker] = useState<TickerInfo>(AVAILABLE_TICKERS[0]);
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [activeStrategy, setActiveStrategy] = useState<Strategy>(DEFAULT_STRATEGIES[0]);
  const [candles, setCandles] = useState<Candle[]>([]);

  // Paper Portfolio with LocalStorage Persistence
  const [paperPortfolio, setPaperPortfolio] = useState<PaperPortfolio>(() => {
    try {
      const saved = localStorage.getItem('quantum_paper_portfolio');
      return saved ? JSON.parse(saved) : INITIAL_PAPER_PORTFOLIO;
    } catch {
      return INITIAL_PAPER_PORTFOLIO;
    }
  });

  // Save Paper Portfolio to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('quantum_paper_portfolio', JSON.stringify(paperPortfolio));
    } catch {
      // storage quota or private mode
    }
  }, [paperPortfolio]);

  // Load Historical Candles when Ticker or Timeframe changes
  useEffect(() => {
    const historical = generateHistoricalCandles(currentTicker.price, 240, timeframe);
    setCandles(historical);
  }, [currentTicker.symbol, timeframe]);

  // Handle Real-Time Price Updates & Automated Paper Trade SL/TP Tracking
  useEffect(() => {
    if (candles.length === 0) return;

    const handlePriceUpdate = (symbol: string, newPrice: number, updatedCandle: Candle) => {
      if (symbol !== currentTicker.symbol) return;

      // Update Ticker Price in State
      setTickers(prev => prev.map(t => t.symbol === symbol ? { ...t, price: newPrice } : t));
      setCurrentTicker(prev => prev.symbol === symbol ? { ...prev, price: newPrice } : prev);

      // Update Latest Candle
      setCandles(prev => {
        if (prev.length === 0) return [updatedCandle];
        const last = prev[prev.length - 1];
        if (last.time === updatedCandle.time) {
          const updated = [...prev];
          updated[updated.length - 1] = updatedCandle;
          return updated;
        } else if (updatedCandle.time > last.time) {
          return [...prev.slice(1), updatedCandle];
        }
        return prev;
      });

      // Check Active Paper Positions for Stop-Loss or Take-Profit Triggers
      setPaperPortfolio(prev => {
        let updatedCash = prev.cashBalance;
        const remainingPositions: Trade[] = [];
        const newClosedTrades = [...prev.closedTrades];
        let realizedChange = 0;

        prev.positions.forEach(pos => {
          if (pos.ticker !== symbol) {
            remainingPositions.push(pos);
            return;
          }

          let isClosed = false;
          let exitReason: Trade['exitReason'] = 'MANUAL';
          let exitPrice = newPrice;

          if (pos.type === 'BUY') {
            if (newPrice <= pos.stopLoss) {
              isClosed = true;
              exitReason = 'SL';
              exitPrice = pos.stopLoss;
            } else if (newPrice >= pos.takeProfit2) {
              isClosed = true;
              exitReason = 'TP2';
              exitPrice = pos.takeProfit2;
            } else if (newPrice >= pos.takeProfit1) {
              isClosed = true;
              exitReason = 'TP1';
              exitPrice = pos.takeProfit1;
            }
          }

          if (isClosed) {
            const pnl = (exitPrice - pos.entryPrice) * pos.size;
            const pnlPct = (pnl / pos.investedCapital) * 100;
            updatedCash += (pos.investedCapital + pnl);
            realizedChange += pnl;

            newClosedTrades.unshift({
              ...pos,
              exitTime: Math.floor(Date.now() / 1000),
              exitPrice,
              pnl: Number(pnl.toFixed(2)),
              pnlPct: Number(pnlPct.toFixed(2)),
              status: 'CLOSED',
              exitReason,
            });
          } else {
            // Update live unrealized PnL
            const unrealized = (newPrice - pos.entryPrice) * pos.size;
            const unrealizedPct = (unrealized / pos.investedCapital) * 100;
            remainingPositions.push({
              ...pos,
              pnl: Number(unrealized.toFixed(2)),
              pnlPct: Number(unrealizedPct.toFixed(2)),
            });
          }
        });

        return {
          ...prev,
          cashBalance: Number(updatedCash.toFixed(2)),
          realizedPnl: Number((prev.realizedPnl + realizedChange).toFixed(2)),
          positions: remainingPositions,
          closedTrades: newClosedTrades,
        };
      });
    };

    liveDataService.subscribe(currentTicker, candles, handlePriceUpdate);

    return () => {
      liveDataService.unsubscribe(handlePriceUpdate);
    };
  }, [currentTicker.symbol, candles.length]);

  // Evaluate Live Signal
  const liveSignal: LiveSignal = useMemo(() => {
    return evaluateLiveSignal(candles, activeStrategy, currentTicker.symbol, paperPortfolio.cashBalance);
  }, [candles, activeStrategy, currentTicker.symbol, paperPortfolio.cashBalance]);

  // Compute Current Indicators bundle
  const currentIndicators = useMemo(() => {
    return candles.length > 0 ? getIndicatorsAtIndex(candles, candles.length - 1) : {};
  }, [candles]);

  // Compute Backtest Metrics & Walk-Forward Result
  const backtestMetrics = useMemo(() => {
    return runBacktest(candles, activeStrategy);
  }, [candles, activeStrategy]);

  const walkForwardResult = useMemo(() => {
    return runWalkForwardValidation(candles, activeStrategy, 3, 0.7);
  }, [candles, activeStrategy]);

  // Compute Monte Carlo Simulation
  const [monteCarloKey, setMonteCarloKey] = useState(0);
  const monteCarloResult = useMemo(() => {
    return runMonteCarloSimulation(backtestMetrics, 1000, 100, 10000);
  }, [backtestMetrics, monteCarloKey]);

  // Generate Signal Markers on the Chart (🟢 / 🔴 arrows on trade points)
  const chartMarkers: SeriesMarker<Time>[] = useMemo(() => {
    const markers: SeriesMarker<Time>[] = [];
    
    // Add markers for historical backtest trades
    backtestMetrics.tradeLog.forEach(trade => {
      markers.push({
        time: trade.entryTime as Time,
        position: trade.type === 'BUY' ? 'belowBar' : 'aboveBar',
        color: trade.type === 'BUY' ? '#10b981' : '#f43f5e',
        shape: trade.type === 'BUY' ? 'arrowUp' : 'arrowDown',
        text: `${trade.type} @ $${trade.entryPrice}`,
      });
    });

    // Add marker for current live signal if active
    if (candles.length > 0 && (liveSignal.signalType === 'STRONG_BUY' || liveSignal.signalType === 'BUY')) {
      const lastCandle = candles[candles.length - 1];
      markers.push({
        time: lastCandle.time as Time,
        position: 'belowBar',
        color: '#10b981',
        shape: 'arrowUp',
        text: `LIVE ${liveSignal.signalType} (${liveSignal.confidence}%)`,
      });
    }

    return markers;
  }, [backtestMetrics.tradeLog, liveSignal, candles]);

  // Paper Trade Execution Handler
  const handleExecutePaperTrade = useCallback((signal: LiveSignal, riskAmount: number) => {
    const isBuy = signal.signalType === 'STRONG_BUY' || signal.signalType === 'BUY';
    const type = isBuy ? 'BUY' : 'SELL';
    
    const suggestedCapital = Math.min(paperPortfolio.cashBalance * 0.4, signal.positionSizing.suggestedCapital || 500);
    const size = signal.positionSizing.suggestedUnits || Number((suggestedCapital / signal.currentPrice).toFixed(2));

    const newTrade: Trade = {
      id: `paper-${Date.now()}`,
      ticker: signal.ticker,
      entryTime: Math.floor(Date.now() / 1000),
      type,
      entryPrice: signal.currentPrice,
      size,
      investedCapital: Number((size * signal.currentPrice).toFixed(2)),
      stopLoss: signal.stopLoss,
      takeProfit1: signal.takeProfit1,
      takeProfit2: signal.takeProfit2,
      pnl: 0,
      pnlPct: 0,
      status: 'OPEN',
    };

    setPaperPortfolio(prev => ({
      ...prev,
      cashBalance: Number((prev.cashBalance - newTrade.investedCapital).toFixed(2)),
      positions: [newTrade, ...prev.positions],
    }));
  }, [paperPortfolio.cashBalance]);

  // Manual Close Paper Position Handler
  const handleClosePosition = useCallback((tradeId: string) => {
    setPaperPortfolio(prev => {
      const pos = prev.positions.find(p => p.id === tradeId);
      if (!pos) return prev;

      const exitPrice = currentTicker.price;
      const pnl = pos.type === 'BUY'
        ? (exitPrice - pos.entryPrice) * pos.size
        : (pos.entryPrice - exitPrice) * pos.size;
      const pnlPct = (pnl / pos.investedCapital) * 100;

      const closed: Trade = {
        ...pos,
        exitTime: Math.floor(Date.now() / 1000),
        exitPrice,
        pnl: Number(pnl.toFixed(2)),
        pnlPct: Number(pnlPct.toFixed(2)),
        status: 'CLOSED',
        exitReason: 'MANUAL',
      };

      return {
        ...prev,
        cashBalance: Number((prev.cashBalance + pos.investedCapital + pnl).toFixed(2)),
        realizedPnl: Number((prev.realizedPnl + pnl).toFixed(2)),
        positions: prev.positions.filter(p => p.id !== tradeId),
        closedTrades: [closed, ...prev.closedTrades],
      };
    });
  }, [currentTicker.price]);

  // Reset Paper Portfolio
  const handleResetPortfolio = useCallback(() => {
    setPaperPortfolio(INITIAL_PAPER_PORTFOLIO);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 selection:bg-brand-primary/30">
      
      {/* Top Header */}
      <Header
        currentTicker={currentTicker}
        availableTickers={tickers}
        onSelectTicker={setCurrentTicker}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        paperPortfolio={paperPortfolio}
        onOpenPaperModal={() => setIsPaperModalOpen(true)}
        onOpenPineScriptModal={() => setIsPineModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Watchlist Bar */}
      <WatchlistBar
        tickers={tickers}
        selectedTicker={currentTicker}
        onSelectTicker={setCurrentTicker}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'copilot' && (
          <div className="max-w-[1720px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: TradingView Candlestick Chart */}
            <div className="lg:col-span-2 min-h-[550px]">
              <TradingChart
                ticker={currentTicker}
                candles={candles}
                timeframe={timeframe}
                onChangeTimeframe={setTimeframe}
                indicators={currentIndicators}
                markers={chartMarkers}
                showEma={showEma}
                showBollinger={showBollinger}
                showVolume={showVolume}
              />
            </div>

            {/* Right Col: Live Signal Guidance Card */}
            <div className="min-h-[550px]">
              <LiveSignalCard
                signal={liveSignal}
                ticker={currentTicker}
                onExecutePaperTrade={handleExecutePaperTrade}
              />
            </div>
          </div>
        )}

        {activeTab === 'backtest' && (
          <BacktestDashboard
            metrics={backtestMetrics}
            walkForwardResult={walkForwardResult}
            strategy={activeStrategy}
            ticker={currentTicker}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyBuilder
            currentStrategy={activeStrategy}
            onApplyStrategy={setActiveStrategy}
            onOpenPineScriptModal={() => setIsPineModalOpen(true)}
          />
        )}

        {activeTab === 'montecarlo' && (
          <MonteCarloView
            monteCarloResult={monteCarloResult}
            onRerunSimulation={() => setMonteCarloKey(k => k + 1)}
          />
        )}
      </main>

      {/* Modals */}
      <PaperTradingModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
        portfolio={paperPortfolio}
        onClosePosition={handleClosePosition}
        onResetPortfolio={handleResetPortfolio}
      />

      <PineScriptModal
        isOpen={isPineModalOpen}
        onClose={() => setIsPineModalOpen(false)}
        strategy={activeStrategy}
      />

      <IndicatorSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        showEma={showEma}
        setShowEma={setShowEma}
        showBollinger={showBollinger}
        setShowBollinger={setShowBollinger}
        showVolume={showVolume}
        setShowVolume={setShowVolume}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/80 px-4 py-3 bg-dark-900/60 text-slate-500 text-xs font-mono">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">QuantumBacktest</span>
            <span>— Institutional Quant Lab & Live Trading Copilot</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Free-Tier Architecture</span>
            <span>•</span>
            <span>TradingView Lightweight Charts v4</span>
            <span>•</span>
            <span className="text-brand-primary">MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
