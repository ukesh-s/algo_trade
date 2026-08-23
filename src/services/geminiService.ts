import { Strategy } from '../types/trading';

/**
 * Natural Language AI Strategy Compiler
 * Calls /api/gemini serverless proxy first (isolating API keys),
 * and falls back to client-side rule extraction heuristics.
 */
export async function generateStrategyFromPrompt(promptText: string): Promise<Strategy> {
  // Try serverless edge proxy first
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.strategy) {
        return data.strategy;
      }
    }
  } catch {
    // Graceful fallback to client-side quant NLP compiler
  }

  return compileStrategyLocally(promptText);
}

/**
 * High-performance client-side natural language rule extractor
 */
function compileStrategyLocally(prompt: string): Strategy {
  const p = prompt.toLowerCase();
  const id = `custom-ai-${Date.now()}`;

  // Timeframe detection
  let timeframe: Strategy['timeframe'] = '1h';
  if (p.includes('1m') || p.includes('1 min')) timeframe = '1m';
  else if (p.includes('5m') || p.includes('5 min')) timeframe = '5m';
  else if (p.includes('15m') || p.includes('15 min')) timeframe = '15m';
  else if (p.includes('daily') || p.includes('1d') || p.includes('1 day')) timeframe = '1D';

  // RSI detection
  const rsiMatch = p.match(/rsi\s*(?:<|below|under|less than)?\s*(\d+)/i);
  const rsiThreshold = rsiMatch ? parseInt(rsiMatch[1], 10) : 32;

  // Name generation
  const name = prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt;

  const buyRules = [];
  const sellRules = [];

  if (p.includes('rsi')) {
    buyRules.push({
      indicator: 'RSI' as const,
      comparator: 'LESS_THAN' as const,
      thresholdValue: rsiThreshold,
      description: `RSI drops below ${rsiThreshold} threshold`
    });
    sellRules.push({
      indicator: 'RSI' as const,
      comparator: 'GREATER_THAN' as const,
      thresholdValue: Math.min(80, 100 - rsiThreshold),
      description: `RSI rises above ${Math.min(80, 100 - rsiThreshold)} overbought zone`
    });
  }

  if (p.includes('ema') || p.includes('cross') || p.includes('golden')) {
    buyRules.push({
      indicator: 'EMA' as const,
      comparator: 'CROSSES_ABOVE' as const,
      secondaryIndicator: 'ema50',
      description: '20 EMA crosses above 50 EMA'
    });
    sellRules.push({
      indicator: 'EMA' as const,
      comparator: 'CROSSES_BELOW' as const,
      secondaryIndicator: 'ema50',
      description: '20 EMA crosses below 50 EMA'
    });
  }

  if (p.includes('bollinger') || p.includes('band')) {
    buyRules.push({
      indicator: 'PRICE' as const,
      comparator: 'LESS_THAN' as const,
      secondaryIndicator: 'lowerBB',
      description: 'Price touches lower Bollinger Band'
    });
    sellRules.push({
      indicator: 'PRICE' as const,
      comparator: 'GREATER_THAN' as const,
      secondaryIndicator: 'upperBB',
      description: 'Price reaches upper Bollinger Band'
    });
  }

  if (p.includes('supertrend')) {
    buyRules.push({
      indicator: 'SUPERTREND' as const,
      comparator: 'GREATER_THAN' as const,
      thresholdValue: 0,
      description: 'Supertrend turns Bullish'
    });
    sellRules.push({
      indicator: 'SUPERTREND' as const,
      comparator: 'LESS_THAN' as const,
      thresholdValue: 0,
      description: 'Supertrend turns Bearish'
    });
  }

  // Default fallback rules if no specific keywords matched
  if (buyRules.length === 0) {
    buyRules.push({
      indicator: 'RSI' as const,
      comparator: 'LESS_THAN' as const,
      thresholdValue: 35,
      description: 'RSI enters oversold zone (< 35)'
    });
    buyRules.push({
      indicator: 'PRICE' as const,
      comparator: 'GREATER_THAN' as const,
      secondaryIndicator: 'ema20',
      description: 'Price maintains support above 20 EMA'
    });
    sellRules.push({
      indicator: 'RSI' as const,
      comparator: 'GREATER_THAN' as const,
      thresholdValue: 68,
      description: 'RSI reaches overbought target (> 68)'
    });
  }

  return {
    id,
    name: `AI Strategy: ${name}`,
    description: `AI-Compiled rule model derived from prompt: "${prompt}"`,
    timeframe,
    buyRules,
    sellRules,
    stopLossAtrMultiplier: 1.8,
    takeProfit1Multiplier: 2.4,
    takeProfit2Multiplier: 4.0,
    riskRewardTarget: 2.2,
    fullKellyMultiplier: 0.35,
  };
}
