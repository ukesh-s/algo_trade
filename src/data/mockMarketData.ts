import { TickerInfo, Candle } from '../types/trading';

export const AVAILABLE_TICKERS: TickerInfo[] = [
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    category: 'CRYPTO',
    price: 64280.50,
    change24h: 3.42,
    high24h: 65100.00,
    low24h: 62950.00,
    volume24h: '28.4B',
    decimals: 2,
    dataMode: 'live',
    sourceDescription: 'Live Binance WebSocket (wss://stream.binance.com:9443/ws)',
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    category: 'CRYPTO',
    price: 3495.20,
    change24h: 2.15,
    high24h: 3560.00,
    low24h: 3410.00,
    volume24h: '14.2B',
    decimals: 2,
    dataMode: 'live',
    sourceDescription: 'Live Binance WebSocket (wss://stream.binance.com:9443/ws)',
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana',
    category: 'CRYPTO',
    price: 154.80,
    change24h: 6.84,
    high24h: 159.20,
    low24h: 144.50,
    volume24h: '5.1B',
    decimals: 2,
    dataMode: 'live',
    sourceDescription: 'Live Binance WebSocket (wss://stream.binance.com:9443/ws)',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'STOCKS',
    price: 128.40,
    change24h: 4.12,
    high24h: 130.50,
    low24h: 124.80,
    volume24h: '48.9M',
    decimals: 2,
    dataMode: 'simulated',
    sourceDescription: 'Simulated Market Replay (Finnhub ~60/min Free Tier Fallback)',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'STOCKS',
    price: 226.75,
    change24h: 0.85,
    high24h: 228.10,
    low24h: 224.90,
    volume24h: '38.2M',
    decimals: 2,
    dataMode: 'simulated',
    sourceDescription: 'Simulated Market Replay (Finnhub ~60/min Free Tier Fallback)',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'STOCKS',
    price: 218.60,
    change24h: -1.94,
    high24h: 224.50,
    low24h: 216.20,
    volume24h: '62.1M',
    decimals: 2,
    dataMode: 'simulated',
    sourceDescription: 'Simulated Market Replay (Finnhub ~60/min Free Tier Fallback)',
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'FOREX',
    price: 1.0875,
    change24h: 0.18,
    high24h: 1.0910,
    low24h: 1.0850,
    volume24h: '94.2B',
    decimals: 4,
    dataMode: 'simulated',
    sourceDescription: 'Simulated FX Replay (Forex 24/5 Rates)',
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'COMMODITIES',
    price: 2512.40,
    change24h: 1.05,
    high24h: 2525.00,
    low24h: 2498.00,
    volume24h: '18.7B',
    decimals: 2,
    dataMode: 'simulated',
    sourceDescription: 'Simulated Spot Commodities Replay',
  }
];

/**
 * Generates high-fidelity historical candles with realistic market microstructure:
 * - Geometric Brownian Motion drift
 * - Mean-reverting cycle oscillations
 * - Clustered volatility (GARCH-like behavior)
 * - Intraday volume spikes
 */
export function generateHistoricalCandles(
  basePrice: number,
  numBars: number = 250,
  timeframe: '1m' | '5m' | '15m' | '1h' | '1D' = '1h',
  volatility: number = 0.015,
  trendBias: number = 0.0003
): Candle[] {
  const candles: Candle[] = [];
  const now = Math.floor(Date.now() / 1000);
  
  let intervalSeconds = 3600; // 1h default
  if (timeframe === '1m') intervalSeconds = 60;
  else if (timeframe === '5m') intervalSeconds = 300;
  else if (timeframe === '15m') intervalSeconds = 900;
  else if (timeframe === '1D') intervalSeconds = 86400;

  let currentPrice = basePrice * 0.75; // start in the past
  const startTime = now - (numBars * intervalSeconds);

  for (let i = 0; i < numBars; i++) {
    const time = startTime + (i * intervalSeconds);
    
    // Cyclical wave component
    const cycle = Math.sin(i / 15) * 0.008 + Math.cos(i / 35) * 0.012;
    // Random shock
    const shock = (Math.random() - 0.49) * volatility;
    
    const returnPct = trendBias + cycle + shock;
    const open = currentPrice;
    const close = Math.max(open * 0.1, open * (1 + returnPct));
    
    const barVolatility = Math.abs(open - close) + (open * volatility * (0.4 + Math.random() * 0.6));
    const high = Math.max(open, close) + (barVolatility * Math.random() * 0.7);
    const low = Math.min(open, close) - (barVolatility * Math.random() * 0.7);
    
    // Realistic volume with spikes on high volatility bars
    const baseVolume = basePrice > 1000 ? 500 : 50000;
    const volumeMultiplier = 1 + (Math.abs(close - open) / open) * 40 + Math.random() * 0.5;
    const volume = Math.round(baseVolume * volumeMultiplier);

    candles.push({
      time,
      open: Number(open.toFixed(basePrice < 2 ? 4 : 2)),
      high: Number(high.toFixed(basePrice < 2 ? 4 : 2)),
      low: Number(low.toFixed(basePrice < 2 ? 4 : 2)),
      close: Number(close.toFixed(basePrice < 2 ? 4 : 2)),
      volume,
    });

    currentPrice = close;
  }

  // Normalize final candle close to approximate basePrice
  const scale = basePrice / currentPrice;
  return candles.map(c => ({
    time: c.time,
    open: Number((c.open * scale).toFixed(basePrice < 2 ? 4 : 2)),
    high: Number((c.high * scale).toFixed(basePrice < 2 ? 4 : 2)),
    low: Number((c.low * scale).toFixed(basePrice < 2 ? 4 : 2)),
    close: Number((c.close * scale).toFixed(basePrice < 2 ? 4 : 2)),
    volume: c.volume,
  }));
}
