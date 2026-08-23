export type AssetCategory = 'CRYPTO' | 'STOCKS' | 'FOREX' | 'COMMODITIES';

export type DataMode = 'live' | 'simulated' | 'replay';

export interface TickerInfo {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  decimals: number;
  dataMode: DataMode;
  sourceDescription: string;
}

export interface Candle {
  time: number; // UNIX timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValues {
  ema20?: number;
  ema50?: number;
  sma200?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  upperBB?: number;
  lowerBB?: number;
  middleBB?: number;
  atr?: number;
  supertrend?: number;
  supertrendDir?: 'bull' | 'bear';
}

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface PositionSizingPlan {
  fullKellyPct: number;       // e.g. 18.5% (labeled upper bound)
  fractionalKellyPct: number; // e.g. 6.5% (safe default, k=0.35)
  dollarRisk: number;         // e.g. $100
  suggestedCapital: number;   // e.g. $650
  suggestedUnits: number;     // e.g. 2.87 shares or 0.0094 BTC
  maxLossDollars: number;     // calculated max loss if SL hits
}

export interface LiveSignal {
  id: string;
  ticker: string;
  timestamp: number;
  signalType: SignalType;
  confidence: number;         // 0 - 100%
  currentPrice: number;
  entryZoneMin: number;
  entryZoneMax: number;
  stopLoss: number;
  stopLossPct: number;
  takeProfit1: number;
  takeProfit1Pct: number;
  takeProfit2: number;
  takeProfit2Pct: number;
  riskRewardRatio: number;    // e.g. 2.5 (meaning 1:2.5)
  positionSizing: PositionSizingPlan;
  rationale: string[];
  indicators: IndicatorValues;
}

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '1D';

export interface StrategyRule {
  indicator: 'RSI' | 'EMA' | 'SMA' | 'MACD' | 'BOLLINGER' | 'SUPERTREND' | 'PRICE';
  comparator: 'CROSSES_ABOVE' | 'CROSSES_BELOW' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
  thresholdValue?: number;
  secondaryIndicator?: string;
  description: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  timeframe: TimeFrame;
  buyRules: StrategyRule[];
  sellRules: StrategyRule[];
  stopLossAtrMultiplier: number;
  takeProfit1Multiplier: number;
  takeProfit2Multiplier: number;
  riskRewardTarget: number;
  fullKellyMultiplier: number; // default 0.35
}

export interface Trade {
  id: string;
  ticker: string;
  entryTime: number;
  exitTime?: number;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  investedCapital: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  pnl?: number;
  pnlPct?: number;
  status: 'OPEN' | 'CLOSED';
  exitReason?: 'TP1' | 'TP2' | 'SL' | 'MANUAL' | 'SIGNAL_FLIP';
}

export interface EquityPoint {
  time: number;
  equity: number;
  benchmarkEquity: number;
  drawdownPct: number;
}

export interface BacktestMetrics {
  totalReturnPct: number;
  annualizedReturnPct: number;
  benchmarkReturnPct: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdownPct: number;
  winRatePct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitFactor: number;
  avgTradeDurationBars: number;
  avgProfitPct: number;
  avgLossPct: number;
  expectancyDollars: number;
  equityCurve: EquityPoint[];
  tradeLog: Trade[];
}

export interface WalkForwardWindow {
  windowIndex: number;
  periodLabel: string;
  trainStartTime: number;
  trainEndTime: number;
  testStartTime: number;
  testEndTime: number;
  inSampleMetrics: BacktestMetrics;
  outOfSampleMetrics: BacktestMetrics;
  efficiencyRatio: number; // outOfSample Sharpe / inSample Sharpe
}

export interface WalkForwardResult {
  windows: WalkForwardWindow[];
  overallInSampleSharpe: number;
  overallOutOfSampleSharpe: number;
  walkForwardEfficiencyPct: number; // OOS/IS ratio
  robustnessGrade: 'Robust' | 'Moderate' | 'Overfitted';
}

export interface MonteCarloDrawdownBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface MonteCarloResult {
  iterations: number;
  horizonBars: number;
  initialBalance: number;
  p5Trajectory: number[];   // 5th percentile (bearish edge)
  p50Trajectory: number[];  // Median
  p95Trajectory: number[];  // 95th percentile (bullish edge)
  sampleTrajectories: number[][]; // 20 visual sample lines
  ruinProbabilityPct: number; // % of simulations hitting 50% drawdown
  worstCaseDrawdownPct: number;
  medianFinalBalance: number;
  drawdownHistogram: MonteCarloDrawdownBucket[];
}

export interface PaperPortfolio {
  initialCapital: number;
  cashBalance: number;
  equity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  positions: Trade[];
  closedTrades: Trade[];
}
