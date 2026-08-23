import { Candle, Strategy, LiveSignal, SignalType, PositionSizingPlan } from '../types/trading';
import { getIndicatorsAtIndex } from './indicatorService';

/**
 * Calculates Fractional Kelly Criterion position sizing:
 * f* = p - (1-p)/b
 * f_used = k * f* (where k = 0.25 to 0.5 default 0.35)
 */
export function calculateKellyPositionSizing(
  winProbability: number = 0.58,
  winLossRatio: number = 2.0,
  fractionalMultiplier: number = 0.35,
  currentPrice: number = 100,
  stopLossPrice: number = 97,
  accountBalance: number = 10000,
  baseRiskDollars: number = 150
): PositionSizingPlan {
  const p = Math.max(0.01, Math.min(0.99, winProbability));
  const b = Math.max(0.1, winLossRatio);
  const q = 1 - p;

  // Full Kelly formula
  const rawFullKelly = p - (q / b);
  const fullKellyPct = Math.max(0, Math.min(0.40, rawFullKelly)) * 100;

  // Fractional Kelly (safer default)
  const fractionalKellyPct = Math.max(1, fullKellyPct * fractionalMultiplier);

  // Position sizing in units based on SL distance
  const riskPerUnit = Math.abs(currentPrice - stopLossPrice);
  const safeRiskPerUnit = riskPerUnit > 0 ? riskPerUnit : currentPrice * 0.02;

  // Sizing by fractional Kelly capital allocation vs risk amount
  const maxRiskCapital = (accountBalance * (fractionalKellyPct / 100));
  const suggestedUnits = Number((maxRiskCapital / currentPrice).toFixed(currentPrice > 500 ? 4 : 2));
  const suggestedCapital = Number((suggestedUnits * currentPrice).toFixed(2));
  const maxLossDollars = Number((suggestedUnits * safeRiskPerUnit).toFixed(2));

  return {
    fullKellyPct: Number(fullKellyPct.toFixed(1)),
    fractionalKellyPct: Number(fractionalKellyPct.toFixed(1)),
    dollarRisk: baseRiskDollars,
    suggestedCapital,
    suggestedUnits,
    maxLossDollars,
  };
}

/**
 * Evaluates live market conditions against the active strategy and generates trade guidance
 */
export function evaluateLiveSignal(
  candles: Candle[],
  strategy: Strategy,
  tickerSymbol: string,
  accountBalance: number = 10000
): LiveSignal {
  if (candles.length < 30) {
    // Fallback if not enough data
    const lastPrice = candles.length > 0 ? candles[candles.length - 1].close : 100;
    return createNeutralSignal(tickerSymbol, lastPrice, accountBalance);
  }

  const lastIdx = candles.length - 1;
  const currentCandle = candles[lastIdx];
  const currentPrice = currentCandle.close;
  const ind = getIndicatorsAtIndex(candles, lastIdx);

  let bullPoints = 0;
  let bearPoints = 0;
  const rationale: string[] = [];

  // 1. Evaluate RSI
  if (ind.rsi !== undefined) {
    if (ind.rsi < 32) {
      bullPoints += 30;
      rationale.push(`RSI is deeply oversold at ${ind.rsi.toFixed(1)} (< 32), signaling strong bounce potential.`);
    } else if (ind.rsi < 45 && ind.rsi > 35) {
      bullPoints += 15;
      rationale.push(`RSI is in bullish accumulation zone (${ind.rsi.toFixed(1)}).`);
    } else if (ind.rsi > 70) {
      bearPoints += 30;
      rationale.push(`RSI is overbought at ${ind.rsi.toFixed(1)} (> 70), risk of imminent pullback.`);
    } else if (ind.rsi > 58) {
      bearPoints += 10;
      rationale.push(`RSI momentum is elevated (${ind.rsi.toFixed(1)}).`);
    }
  }

  // 2. Evaluate EMA Cross / Trend
  if (ind.ema20 !== undefined && ind.ema50 !== undefined) {
    if (ind.ema20 > ind.ema50) {
      bullPoints += 25;
      if (currentPrice > ind.ema20) {
        bullPoints += 10;
        rationale.push(`Bullish trend: 20 EMA ($${ind.ema20.toFixed(2)}) holds above 50 EMA ($${ind.ema50.toFixed(2)}) with price above support.`);
      } else {
        rationale.push(`20 EMA is above 50 EMA (Bullish macro posture).`);
      }
    } else {
      bearPoints += 25;
      rationale.push(`Bearish structure: 20 EMA ($${ind.ema20.toFixed(2)}) is below 50 EMA ($${ind.ema50.toFixed(2)}).`);
    }
  }

  // 3. Evaluate Bollinger Bands
  if (ind.lowerBB !== undefined && ind.upperBB !== undefined && ind.middleBB !== undefined) {
    if (currentPrice <= ind.lowerBB * 1.005) {
      bullPoints += 25;
      rationale.push(`Price is testing lower 2-sigma Bollinger Band ($${ind.lowerBB.toFixed(2)}), high probability of mean-reversion.`);
    } else if (currentPrice >= ind.upperBB * 0.995) {
      bearPoints += 25;
      rationale.push(`Price is extending beyond upper Bollinger Band ($${ind.upperBB.toFixed(2)}).`);
    }
  }

  // 4. Evaluate MACD
  if (ind.macdHist !== undefined) {
    if (ind.macdHist > 0) {
      bullPoints += 15;
      rationale.push(`MACD histogram is positive (+${ind.macdHist.toFixed(3)}), confirming upward momentum.`);
    } else {
      bearPoints += 15;
      rationale.push(`MACD histogram is negative (${ind.macdHist.toFixed(3)}).`);
    }
  }

  // 5. Evaluate Supertrend
  if (ind.supertrendDir === 'bull') {
    bullPoints += 10;
    rationale.push(`Supertrend indicator is Bullish.`);
  } else if (ind.supertrendDir === 'bear') {
    bearPoints += 10;
    rationale.push(`Supertrend indicator is Bearish.`);
  }

  // Determine Signal Type & Confidence
  let signalType: SignalType = 'NEUTRAL';
  let confidence = 50;

  const totalScore = bullPoints - bearPoints;

  if (totalScore >= 50) {
    signalType = 'STRONG_BUY';
    confidence = Math.min(95, 65 + Math.round(totalScore * 0.35));
  } else if (totalScore >= 20) {
    signalType = 'BUY';
    confidence = Math.min(82, 55 + Math.round(totalScore * 0.4));
  } else if (totalScore <= -50) {
    signalType = 'STRONG_SELL';
    confidence = Math.min(95, 65 + Math.round(Math.abs(totalScore) * 0.35));
  } else if (totalScore <= -20) {
    signalType = 'SELL';
    confidence = Math.min(82, 55 + Math.round(Math.abs(totalScore) * 0.4));
  } else {
    signalType = 'NEUTRAL';
    confidence = 50;
    rationale.push(`Market is consolidating without high-probability confluence.`);
  }

  // Dynamic Stop-Loss & Take-Profit calculation using ATR
  const atr = ind.atr || (currentPrice * 0.015);
  const isBuy = signalType === 'STRONG_BUY' || signalType === 'BUY';
  const isSell = signalType === 'STRONG_SELL' || signalType === 'SELL';

  let stopLoss = 0;
  let takeProfit1 = 0;
  let takeProfit2 = 0;

  if (isBuy) {
    stopLoss = currentPrice - (atr * strategy.stopLossAtrMultiplier);
    takeProfit1 = currentPrice + (atr * strategy.takeProfit1Multiplier);
    takeProfit2 = currentPrice + (atr * strategy.takeProfit2Multiplier);
  } else if (isSell) {
    stopLoss = currentPrice + (atr * strategy.stopLossAtrMultiplier);
    takeProfit1 = currentPrice - (atr * strategy.takeProfit1Multiplier);
    takeProfit2 = currentPrice - (atr * strategy.takeProfit2Multiplier);
  } else {
    stopLoss = currentPrice * 0.97;
    takeProfit1 = currentPrice * 1.03;
    takeProfit2 = currentPrice * 1.06;
  }

  const entryZoneMin = isBuy ? currentPrice * 0.998 : currentPrice * 0.995;
  const entryZoneMax = isBuy ? currentPrice * 1.003 : currentPrice * 1.002;

  const riskDist = Math.abs(currentPrice - stopLoss);
  const rewardDist = Math.abs(takeProfit1 - currentPrice);
  const riskRewardRatio = riskDist > 0 ? Number((rewardDist / riskDist).toFixed(2)) : 2.0;

  const stopLossPct = Number((((stopLoss - currentPrice) / currentPrice) * 100).toFixed(2));
  const takeProfit1Pct = Number((((takeProfit1 - currentPrice) / currentPrice) * 100).toFixed(2));
  const takeProfit2Pct = Number((((takeProfit2 - currentPrice) / currentPrice) * 100).toFixed(2));

  const winProb = confidence / 100;
  const positionSizing = calculateKellyPositionSizing(
    winProb,
    riskRewardRatio,
    strategy.fullKellyMultiplier || 0.35,
    currentPrice,
    stopLoss,
    accountBalance,
    150
  );

  return {
    id: `sig-${Date.now()}`,
    ticker: tickerSymbol,
    timestamp: currentCandle.time,
    signalType,
    confidence,
    currentPrice,
    entryZoneMin: Number(entryZoneMin.toFixed(currentPrice < 2 ? 4 : 2)),
    entryZoneMax: Number(entryZoneMax.toFixed(currentPrice < 2 ? 4 : 2)),
    stopLoss: Number(stopLoss.toFixed(currentPrice < 2 ? 4 : 2)),
    stopLossPct,
    takeProfit1: Number(takeProfit1.toFixed(currentPrice < 2 ? 4 : 2)),
    takeProfit1Pct,
    takeProfit2: Number(takeProfit2.toFixed(currentPrice < 2 ? 4 : 2)),
    takeProfit2Pct,
    riskRewardRatio,
    positionSizing,
    rationale,
    indicators: ind,
  };
}

function createNeutralSignal(tickerSymbol: string, price: number, accountBalance: number): LiveSignal {
  return {
    id: `sig-${Date.now()}`,
    ticker: tickerSymbol,
    timestamp: Math.floor(Date.now() / 1000),
    signalType: 'NEUTRAL',
    confidence: 50,
    currentPrice: price,
    entryZoneMin: price * 0.998,
    entryZoneMax: price * 1.002,
    stopLoss: price * 0.98,
    stopLossPct: -2.0,
    takeProfit1: price * 1.04,
    takeProfit1Pct: 4.0,
    takeProfit2: price * 1.08,
    takeProfit2Pct: 8.0,
    riskRewardRatio: 2.0,
    positionSizing: calculateKellyPositionSizing(0.5, 2.0, 0.35, price, price * 0.98, accountBalance),
    rationale: ['Awaiting sufficient historical candle data for confluence evaluation.'],
    indicators: {},
  };
}
