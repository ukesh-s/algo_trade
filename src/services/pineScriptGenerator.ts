import { Strategy } from '../types/trading';

/**
 * Generates copy-paste TradingView Pine Script v5 code from a Strategy model
 */
export function generatePineScriptV5(strategy: Strategy): string {
  const isRsi = strategy.id === 'rsi-mean-reversion';
  const isEma = strategy.id === 'dual-ema-trend';
  const isSupertrend = strategy.id === 'supertrend-momentum';

  return `//@version=5
strategy("${strategy.name}", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=10, commission_type=strategy.commission.percent, commission_value=0.05)

// ==========================================
// 🚀 QuantumBacktest Auto-Generated Strategy
// Strategy: ${strategy.name}
// Timeframe: ${strategy.timeframe}
// Description: ${strategy.description}
// ==========================================

// --- Input Parameters ---
atrPeriod = input.int(14, title="ATR Volatility Period")
atrMultiplierSL = input.float(${strategy.stopLossAtrMultiplier}, title="Stop Loss ATR Multiplier", step=0.1)
atrMultiplierTP1 = input.float(${strategy.takeProfit1Multiplier}, title="Take Profit 1 Multiplier", step=0.1)
atrMultiplierTP2 = input.float(${strategy.takeProfit2Multiplier}, title="Take Profit 2 Multiplier", step=0.1)

// --- Indicators ---
atr = ta.atr(atrPeriod)
ema20 = ta.ema(close, 20)
ema50 = ta.ema(close, 50)
sma200 = ta.sma(close, 200)
rsi = ta.rsi(close, 14)
[bbMiddle, bbUpper, bbLower] = ta.bb(close, 20, 2.0)
[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)

// Plot Overlays
plot(ema20, color=color.new(#38bdf8, 0), title="EMA 20", linewidth=2)
plot(ema50, color=color.new(#818cf8, 0), title="EMA 50", linewidth=2)
plot(sma200, color=color.new(#f59e0b, 20), title="SMA 200", linewidth=2)
pUpper = plot(bbUpper, color=color.new(#a855f7, 50), title="Upper BB")
pLower = plot(bbLower, color=color.new(#a855f7, 50), title="Lower BB")
fill(pUpper, pLower, color=color.new(#a855f7, 92), title="BB Background")

// --- Entry / Exit Conditions ---
${isRsi ? `
// RSI Mean Reversion Logic
longCondition = (rsi < 32) and (close <= bbLower * 1.008)
shortCondition = (rsi > 68) and (close >= bbUpper * 0.992)
` : isEma ? `
// Dual EMA Trend Cross Logic
longCondition = ta.crossover(ema20, ema50) and (histLine > 0)
shortCondition = ta.crossunder(ema20, ema50)
` : isSupertrend ? `
// Supertrend Confluence Logic
[stValue, stDirection] = ta.supertrend(3.0, 10)
longCondition = ta.crossover(close, stValue) and (close > ema20)
shortCondition = ta.crossunder(close, stValue)
` : `
// Confluence Logic
longCondition = (rsi < 35) and (close > ema20)
shortCondition = (rsi > 68)
`}

// --- Order Execution & Dynamic Risk Management ---
var float entryPrice = na
var float stopLossPrice = na
var float takeProfitPrice = na

if (longCondition and strategy.position_size == 0)
    entryPrice := close
    stopLossPrice := close - (atr * atrMultiplierSL)
    takeProfitPrice := close + (atr * atrMultiplierTP1)
    strategy.entry("Long", strategy.long)
    strategy.exit("Exit Long", "Long", stop=stopLossPrice, limit=takeProfitPrice)

if (shortCondition and strategy.position_size == 0)
    entryPrice := close
    stopLossPrice := close + (atr * atrMultiplierSL)
    takeProfitPrice := close - (atr * atrMultiplierTP1)
    strategy.entry("Short", strategy.short)
    strategy.exit("Exit Short", "Short", stop=stopLossPrice, limit=takeProfitPrice)

// Alert Triggers
alertcondition(longCondition, title="🟢 Quantum BUY Signal", message="QuantumBacktest: BUY Signal on {{ticker}} at price {{close}}")
alertcondition(shortCondition, title="🔴 Quantum SELL Signal", message="QuantumBacktest: SELL Signal on {{ticker}} at price {{close}}")
`;
}

/**
 * Generates copy-paste Python Backtrader code
 */
export function generatePythonCode(strategy: Strategy): string {
  return `import backtrader as bt
import pandas as pd

class QuantumStrategy(bt.Strategy):
    """
    QuantumBacktest Auto-Generated Strategy: ${strategy.name}
    """
    params = (
        ('rsi_period', 14),
        ('ema_fast', 20),
        ('ema_slow', 50),
        ('atr_period', 14),
        ('sl_multiplier', ${strategy.stopLossAtrMultiplier}),
        ('tp_multiplier', ${strategy.takeProfit1Multiplier}),
    )

    def __init__(self):
        self.rsi = bt.indicators.RSI(self.data.close, period=self.params.rsi_period)
        self.ema_fast = bt.indicators.EMA(self.data.close, period=self.params.ema_fast)
        self.ema_slow = bt.indicators.EMA(self.data.close, period=self.params.ema_slow)
        self.atr = bt.indicators.ATR(self.data, period=self.params.atr_period)
        self.bb = bt.indicators.BollingerBands(self.data.close, period=20, devfactor=2)
        self.order = None

    def next(self):
        if self.order:
            return  # Pending order exists

        if not self.position:
            # Entry logic
            if self.rsi[0] < 35 and self.data.close[0] > self.ema_fast[0]:
                size = (self.broker.get_cash() * 0.1) / self.data.close[0]
                self.order = self.buy(size=size)
                # Bracket order with Stop Loss & Take Profit
                sl_price = self.data.close[0] - (self.atr[0] * self.params.sl_multiplier)
                tp_price = self.data.close[0] + (self.atr[0] * self.params.tp_multiplier)
                self.sell(size=size, exectype=bt.Order.Stop, price=sl_price)
                self.sell(size=size, exectype=bt.Order.Limit, price=tp_price)
        else:
            if self.rsi[0] > 68:
                self.close()

if __name__ == '__main__':
    cerebro = bt.Cerebro()
    cerebro.addstrategy(QuantumStrategy)
    cerebro.broker.setcash(10000.0)
    cerebro.broker.setcommission(commission=0.0005)
    
    print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
    # Add data feed here (e.g. cerebro.adddata(bt.feeds.YahooFinanceData(dataname='NVDA', ...)))
    # results = cerebro.run()
    # print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
`;
}
