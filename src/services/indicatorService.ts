import { Candle, IndicatorValues } from '../types/trading';

/**
 * Calculates Simple Moving Average
 */
export function calculateSMA(candles: Candle[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  let sum = 0;

  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) {
      sum -= candles[i - period].close;
      result.push(sum / period);
    } else if (i === period - 1) {
      result.push(sum / period);
    } else {
      result.push(undefined);
    }
  }
  return result;
}

/**
 * Calculates Exponential Moving Average
 */
export function calculateEMA(candles: Candle[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const k = 2 / (period + 1);
  let prevEMA: number | undefined = undefined;

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;
    if (i < period - 1) {
      result.push(undefined);
    } else if (i === period - 1) {
      // First EMA is simple average
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[j].close;
      }
      prevEMA = sum / period;
      result.push(prevEMA);
    } else if (prevEMA !== undefined) {
      prevEMA = (close - prevEMA) * k + prevEMA;
      result.push(prevEMA);
    }
  }
  return result;
}

/**
 * Calculates Wilder's Relative Strength Index (14-period standard)
 */
export function calculateRSI(candles: Candle[], period: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      result.push(undefined);
      continue;
    }

    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    if (i < period) {
      avgGain += gain;
      avgLoss += loss;
      result.push(undefined);
    } else if (i === period) {
      avgGain = (avgGain + gain) / period;
      avgLoss = (avgLoss + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }
  return result;
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: (number | undefined)[];
  signal: (number | undefined)[];
  histogram: (number | undefined)[];
} {
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);
  
  const macdLine: (number | undefined)[] = [];
  for (let i = 0; i < candles.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== undefined && s !== undefined) {
      macdLine.push(f - s);
    } else {
      macdLine.push(undefined);
    }
  }

  // Signal line is 9 EMA of MACD line
  const signalLine: (number | undefined)[] = [];
  const k = 2 / (signalPeriod + 1);
  let prevSignal: number | undefined = undefined;
  let validCount = 0;
  let seedSum = 0;

  for (let i = 0; i < macdLine.length; i++) {
    const val = macdLine[i];
    if (val === undefined) {
      signalLine.push(undefined);
      continue;
    }

    validCount++;
    if (validCount < signalPeriod) {
      seedSum += val;
      signalLine.push(undefined);
    } else if (validCount === signalPeriod) {
      seedSum += val;
      prevSignal = seedSum / signalPeriod;
      signalLine.push(prevSignal);
    } else if (prevSignal !== undefined) {
      prevSignal = (val - prevSignal) * k + prevSignal;
      signalLine.push(prevSignal);
    }
  }

  const histogram: (number | undefined)[] = [];
  for (let i = 0; i < candles.length; i++) {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m !== undefined && s !== undefined) {
      histogram.push(m - s);
    } else {
      histogram.push(undefined);
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Calculates Bollinger Bands (20 period, 2 std dev)
 */
export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: (number | undefined)[];
  middle: (number | undefined)[];
  lower: (number | undefined)[];
} {
  const sma = calculateSMA(candles, period);
  const upper: (number | undefined)[] = [];
  const middle = sma;
  const lower: (number | undefined)[] = [];

  for (let i = 0; i < candles.length; i++) {
    const mid = sma[i];
    if (mid === undefined || i < period - 1) {
      upper.push(undefined);
      lower.push(undefined);
      continue;
    }

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - mid, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    upper.push(mid + stdDevMultiplier * stdDev);
    lower.push(mid - stdDevMultiplier * stdDev);
  }

  return { upper, middle, lower };
}

/**
 * Calculates Average True Range (14-period)
 */
export function calculateATR(candles: Candle[], period: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  let prevATR: number | undefined = undefined;

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      result.push(candles[0].high - candles[0].low);
      continue;
    }

    const current = candles[i];
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prevClose),
      Math.abs(current.low - prevClose)
    );

    if (i < period) {
      result.push(undefined);
    } else if (i === period) {
      let sum = 0;
      for (let j = 1; j <= period; j++) {
        const c = candles[j];
        const pc = candles[j - 1].close;
        sum += Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc));
      }
      prevATR = sum / period;
      result.push(prevATR);
    } else if (prevATR !== undefined) {
      prevATR = (prevATR * (period - 1) + tr) / period;
      result.push(prevATR);
    }
  }
  return result;
}

/**
 * Calculates Supertrend Indicator (10-period, 3 multiplier)
 */
export function calculateSupertrend(
  candles: Candle[],
  period: number = 10,
  multiplier: number = 3
): {
  supertrend: (number | undefined)[];
  direction: ('bull' | 'bear' | undefined)[];
} {
  const atr = calculateATR(candles, period);
  const supertrend: (number | undefined)[] = [];
  const direction: ('bull' | 'bear' | undefined)[] = [];

  let prevUpper = 0;
  let prevLower = 0;
  let prevDir: 'bull' | 'bear' = 'bull';

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const a = atr[i];

    if (a === undefined || i < period) {
      supertrend.push(undefined);
      direction.push(undefined);
      continue;
    }

    const basicUpper = (c.high + c.low) / 2 + multiplier * a;
    const basicLower = (c.high + c.low) / 2 - multiplier * a;

    const finalUpper = i > 0 && basicUpper < prevUpper || candles[i - 1].close > prevUpper ? basicUpper : prevUpper;
    const finalLower = i > 0 && basicLower > prevLower || candles[i - 1].close < prevLower ? basicLower : prevLower;

    let currentDir: 'bull' | 'bear' = prevDir;
    if (prevDir === 'bull' && c.close < finalLower) {
      currentDir = 'bear';
    } else if (prevDir === 'bear' && c.close > finalUpper) {
      currentDir = 'bull';
    }

    const currentST = currentDir === 'bull' ? finalLower : finalUpper;

    supertrend.push(currentST);
    direction.push(currentDir);

    prevUpper = finalUpper;
    prevLower = finalLower;
    prevDir = currentDir;
  }

  return { supertrend, direction };
}

/**
 * Returns latest indicator values bundle for a specific candle index
 */
export function getIndicatorsAtIndex(candles: Candle[], index: number): IndicatorValues {
  const ema20 = calculateEMA(candles, 20);
  const ema50 = calculateEMA(candles, 50);
  const sma200 = calculateSMA(candles, 200);
  const rsi = calculateRSI(candles, 14);
  const macd = calculateMACD(candles, 12, 26, 9);
  const bb = calculateBollingerBands(candles, 20, 2);
  const atr = calculateATR(candles, 14);
  const st = calculateSupertrend(candles, 10, 3);

  const idx = Math.min(index, candles.length - 1);

  return {
    ema20: ema20[idx],
    ema50: ema50[idx],
    sma200: sma200[idx],
    rsi: rsi[idx],
    macd: macd.macd[idx],
    macdSignal: macd.signal[idx],
    macdHist: macd.histogram[idx],
    upperBB: bb.upper[idx],
    middleBB: bb.middle[idx],
    lowerBB: bb.lower[idx],
    atr: atr[idx],
    supertrend: st.supertrend[idx],
    supertrendDir: st.direction[idx],
  };
}
