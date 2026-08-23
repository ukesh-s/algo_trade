import { Strategy } from '../types/trading';

export const DEFAULT_STRATEGIES: Strategy[] = [
  {
    id: 'rsi-mean-reversion',
    name: 'RSI Divergence & Bollinger Mean Reversion',
    description: 'Enters long when price pierces the lower Bollinger Band with RSI < 32 (oversold condition). Exits on mean reversion to 20 EMA or upper band.',
    timeframe: '1h',
    buyRules: [
      {
        indicator: 'RSI',
        comparator: 'LESS_THAN',
        thresholdValue: 32,
        description: '14-period RSI drops below 32 (Oversold condition)'
      },
      {
        indicator: 'PRICE',
        comparator: 'LESS_THAN',
        secondaryIndicator: 'lowerBB',
        description: 'Price pierces or closes below lower 2-sigma Bollinger Band'
      }
    ],
    sellRules: [
      {
        indicator: 'RSI',
        comparator: 'GREATER_THAN',
        thresholdValue: 68,
        description: '14-period RSI reaches overbought level > 68'
      },
      {
        indicator: 'PRICE',
        comparator: 'GREATER_THAN',
        secondaryIndicator: 'upperBB',
        description: 'Price extends above upper Bollinger Band'
      }
    ],
    stopLossAtrMultiplier: 1.5,
    takeProfit1Multiplier: 2.0,
    takeProfit2Multiplier: 3.5,
    riskRewardTarget: 2.2,
    fullKellyMultiplier: 0.35,
  },
  {
    id: 'dual-ema-trend',
    name: 'Dual EMA Momentum Trend (20 / 50 Cross)',
    description: 'Classic institutional trend-following model. Buys when 20-period EMA crosses above 50-period EMA accompanied by positive MACD histogram.',
    timeframe: '1h',
    buyRules: [
      {
        indicator: 'EMA',
        comparator: 'CROSSES_ABOVE',
        secondaryIndicator: 'ema50',
        description: 'Fast 20 EMA crosses above Slow 50 EMA (Bullish Golden Cross)'
      },
      {
        indicator: 'MACD',
        comparator: 'GREATER_THAN',
        thresholdValue: 0,
        description: 'MACD histogram is positive and expanding'
      }
    ],
    sellRules: [
      {
        indicator: 'EMA',
        comparator: 'CROSSES_BELOW',
        secondaryIndicator: 'ema50',
        description: 'Fast 20 EMA crosses below Slow 50 EMA (Bearish Cross)'
      }
    ],
    stopLossAtrMultiplier: 2.0,
    takeProfit1Multiplier: 3.0,
    takeProfit2Multiplier: 5.0,
    riskRewardTarget: 2.5,
    fullKellyMultiplier: 0.35,
  },
  {
    id: 'supertrend-momentum',
    name: 'Supertrend + Volume Confluence',
    description: 'Combines ATR-based Supertrend volatility bands with moving average filters to capture sustained macro breakouts with tight trailing stops.',
    timeframe: '15m',
    buyRules: [
      {
        indicator: 'SUPERTREND',
        comparator: 'GREATER_THAN',
        thresholdValue: 0,
        description: 'Supertrend flips green (Bullish trend confirmed)'
      },
      {
        indicator: 'PRICE',
        comparator: 'GREATER_THAN',
        secondaryIndicator: 'ema20',
        description: 'Price holds firmly above 20 EMA support'
      }
    ],
    sellRules: [
      {
        indicator: 'SUPERTREND',
        comparator: 'LESS_THAN',
        thresholdValue: 0,
        description: 'Supertrend flips red (Bearish stop triggered)'
      }
    ],
    stopLossAtrMultiplier: 1.8,
    takeProfit1Multiplier: 2.5,
    takeProfit2Multiplier: 4.0,
    riskRewardTarget: 2.0,
    fullKellyMultiplier: 0.30,
  },
  {
    id: 'volatility-squeeze',
    name: 'Bollinger Volatility Squeeze Breakout',
    description: 'Identifies periods of extreme volatility contraction followed by directional momentum expansion beyond the 20-period moving average.',
    timeframe: '1h',
    buyRules: [
      {
        indicator: 'BOLLINGER',
        comparator: 'GREATER_THAN',
        thresholdValue: 0,
        description: 'Bollinger Band width expands after squeeze'
      },
      {
        indicator: 'PRICE',
        comparator: 'GREATER_THAN',
        secondaryIndicator: 'middleBB',
        description: 'Price breaks out above 20-period Middle Band'
      }
    ],
    sellRules: [
      {
        indicator: 'PRICE',
        comparator: 'LESS_THAN',
        secondaryIndicator: 'middleBB',
        description: 'Price drops back below 20-period Middle Band'
      }
    ],
    stopLossAtrMultiplier: 1.5,
    takeProfit1Multiplier: 2.2,
    takeProfit2Multiplier: 3.8,
    riskRewardTarget: 2.4,
    fullKellyMultiplier: 0.35,
  }
];
