# 📄 Project Architecture & System Design Document
## **QuantumBacktest — AI-Powered Quant Strategy Lab & Live Trading Copilot**

---

## 1. 📌 Executive Summary

**QuantumBacktest** is a full-stack algorithmic trading intelligence platform and live TradingView charting copilot. It bridges the gap between complex quantitative financial modeling and retail trading execution by providing:

1. **Real-time TradingView charting** with live price streams and dynamically plotted **Buy / Sell signal markers**.
2. **Actionable Live Trade Guidance** (Entry Zone, Stop-Loss, Take-Profit 1 & 2, Risk/Reward Ratio, and Position Sizing Calculator).
3. **Natural Language AI Strategy Generator** that converts plain text hypotheses into algorithmic rules with **1-click export to TradingView Pine Script v5** and **Python Backtrader**.
4. **Institutional-Grade Backtesting Engine** computing Wall Street metrics (*Sharpe Ratio, Sortino Ratio, Max Drawdown %, Profit Factor, Win Rate, Equity Curve*).
5. **1,000-Path Monte Carlo Stress Simulator** to determine the probability of ruin and confidence intervals.
6. **Zero-Risk Live Paper Trading Simulator** with real-time unrealized P&L and automated Stop-Loss / Take-Profit tracking.
7. **100% Free-Tier Architecture** capable of running in the browser and deploying freely to Vercel/Netlify with zero server hosting costs.

---

## 2. 🏛️ High-Level System Architecture

```mermaid
flowchart TB
    subgraph Data_Layer ["📡 1. Real-Time Market Data Stream"]
        WS[Crypto WebSockets - Binance / CoinGecko]
        REST[Stocks & Forex REST / Finnhub / Yahoo API]
        AGG[Tick & Candlestick Aggregator: 1m, 5m, 15m, 1h, 1D]
        WS --> AGG
        REST --> AGG
    end

    subgraph Indicator_Layer ["🧮 2. In-Browser Technical Indicator Engine"]
        EMA[EMA 20 / 50 & SMA 200]
        RSI[RSI 14-Period Momentum]
        MACD[MACD 12/26/9 Oscillator]
        BB[Bollinger Bands ±2σ]
        ATR[ATR 14 Volatility & Supertrend]
        AGG --> EMA & RSI & MACD & BB & ATR
    end

    subgraph Strategy_Layer ["🤖 3. AI & Algorithmic Strategy Engine"]
        NL_AI[AI Natural Language Parser - Gemini API]
        RULE_BUILDER[Visual Parameter / Condition Evaluator]
        PINE_EXPORT[TradingView Pine Script v5 & Python Exporter]
        NL_AI --> RULE_BUILDER
        RULE_BUILDER --> PINE_EXPORT
        EMA & RSI & MACD & BB & ATR --> RULE_BUILDER
    end

    subgraph Realtime_Signals ["🚦 4. Live Signal Guidance & Paper Trading"]
        SIGNAL_GEN[Signal Classifier: STRONG BUY | BUY | NEUTRAL | SELL | STRONG SELL]
        TRADE_MATRIX[Entry Zone, SL, TP1, TP2, RRR & Position Sizer]
        PAPER_PORTFOLIO[Live Virtual $10k Paper Portfolio & Real-time P&L Tracker]
        RULE_BUILDER --> SIGNAL_GEN --> TRADE_MATRIX --> PAPER_PORTFOLIO
    end

    subgraph Quant_Backtest ["⚡ 5. Backtester & Monte Carlo Engine"]
        HIST_SIM[Historical Multi-Year Trade Simulator]
        METRICS[Sharpe, Sortino, Calmar, Max Drawdown, Win Rate, Profit Factor]
        MONTE_CARLO[1,000-Path Monte Carlo Stress Test & Ruin Probability]
        RULE_BUILDER --> HIST_SIM --> METRICS --> MONTE_CARLO
    end

    subgraph Presentation_Layer ["🖥️ 6. Glassmorphic User Interface"]
        CHART_UI[TradingView Lightweight Candlestick Chart + Dynamic Markers]
        COPILOT_UI[Live Signal Guidance Terminal]
        BACKTEST_UI[Equity Curve vs S&P 500 & Monthly Returns Heatmap]
        MONTE_UI[Monte Carlo Confidence Fan Chart]
        
        AGG --> CHART_UI
        SIGNAL_GEN --> CHART_UI
        TRADE_MATRIX --> COPILOT_UI
        METRICS --> BACKTEST_UI
        MONTE_CARLO --> MONTE_UI
    end
```

---

## 3. 🧩 Modular Breakdown & Core Components

| Component | Responsibility | Tech / Library |
| :--- | :--- | :--- |
| **TradingChart (`TradingChart.tsx`)** | Renders high-performance interactive candlestick charts, volume bars, EMA/SMA overlays, and pins live 🟢 Buy / 🔴 Sell markers onto trigger candles. | `lightweight-charts` (TradingView) |
| **LiveSignalCard (`LiveSignalCard.tsx`)** | Displays live trading signals with real-time confidence scores, entry zones, SL, TP1/TP2, risk-reward ratios, position sizing calculator, and AI trade rationale. | React + Lucide Icons + Tailwind CSS |
| **StrategyBuilder (`StrategyBuilder.tsx`)** | Allows prompt-based natural language strategy creation (*"Buy when RSI < 30 and 20 EMA > 50 EMA"*) + visual parameter sliders for indicators and risk rules. | Google Gemini Free API / Local Rule Heuristics |
| **BacktestDashboard (`BacktestDashboard.tsx`)** | Simulates multi-year historical trade execution with slippage and transaction costs; renders equity curve vs. S&P 500 benchmark, drawdowns, and trade log. | Custom TS Backtester + Recharts |
| **MonteCarloView (`MonteCarloView.tsx`)** | Simulates 1,000 randomized synthetic paths to quantify "luck vs. edge", drawdown distributions, and risk of ruin. | Monte Carlo Bootstrapping Engine + SVG Charts |
| **PaperTradingModal (`PaperTradingModal.tsx`)** | Manages a virtual $10,000 simulated balance, tracking live orders, real-time unrealized P&L, and automatic SL/TP triggers. | React Reactive State + LocalStorage |
| **PineScriptModal (`PineScriptModal.tsx`)** | Generates formatted, copy-paste **TradingView Pine Script v5** code for direct execution in TradingView's Pine Editor. | Code Generator Service |

---

## 4. 🧮 Quantitative Mathematical Formulas Implemented

1. **Relative Strength Index (RSI):**
   $$RSI = 100 - \left( \frac{100}{1 + RS} \right), \quad RS = \frac{\text{Exponential Average Gain}}{\text{Exponential Average Loss}}$$

2. **Sharpe Ratio (Annualized):**
   $$\text{Sharpe} = \frac{\bar{R}_p - R_f}{\sigma_p} \times \sqrt{252}$$
   *(Where $\bar{R}_p$ is strategy return, $R_f$ is risk-free rate, $\sigma_p$ is standard deviation of daily returns).*

3. **Sortino Ratio (Downside Risk):**
   $$\text{Sortino} = \frac{\bar{R}_p - R_f}{\sigma_d} \times \sqrt{252}, \quad \sigma_d = \sqrt{\frac{1}{N}\sum \min(0, R_i - R_f)^2}$$

4. **Maximum Drawdown (MDD):**
   $$\text{MDD} = \max_{t \in [0, T]} \left( \frac{\text{Peak}_t - \text{Trough}_t}{\text{Peak}_t} \right) \times 100\%$$

5. **Kelly Criterion Position Sizing:**
   $$f^* = \frac{p(b + 1) - 1}{b} = p - \frac{q}{b}$$
   *(Where $p$ = Win probability, $q = 1-p$, $b$ = Win/loss payoff ratio).*

6. **Monte Carlo Geometric Brownian Motion (GBM):**
   $$S_{t+\Delta t} = S_t \exp\left( \left(\mu - \frac{\sigma^2}{2}\right)\Delta t + \sigma \sqrt{\Delta t} \, Z \right), \quad Z \sim \mathcal{N}(0, 1)$$

---

## 5. 📁 Complete Project Directory Structure

```
TradingAdvisor/
├── index.html                           # App shell with Google Fonts (Outfit & JetBrains Mono)
├── package.json                         # Dependencies (React 18, Vite, Lucide, lightweight-charts, recharts, canvas-confetti)
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite bundler config
├── tailwind.config.js                   # Tailwind theme with custom financial dark palette
├── src/
│   ├── main.tsx                         # React root entry point
│   ├── App.tsx                          # Core layout, active tab routing, global ticker state
│   ├── index.css                        # Glassmorphism, glow utilities, and scrollbar styles
│   │
│   ├── types/
│   │   └── trading.ts                   # Interfaces for Ticker, Candle, Indicator, Strategy, Signal, Trade, Metrics
│   │
│   ├── data/
│   │   ├── mockMarketData.ts            # High-resolution multi-asset historical datasets (Stocks, Crypto, Forex, Gold)
│   │   └── defaultStrategies.ts         # Pre-configured quant strategies (RSI Mean Reversion, EMA Trend, etc.)
│   │
│   ├── services/
│   │   ├── liveDataService.ts           # Real-time WebSocket & REST price tick simulation/feed
│   │   ├── indicatorService.ts          # Pure TS math engine for EMA, SMA, RSI, MACD, BB, ATR, Supertrend
│   │   ├── strategyEngine.ts            # Strategy evaluator generating Buy/Sell signals on incoming candles
│   │   ├── backtestEngine.ts            # Historical backtester computing returns, Sharpe, MDD, trade ledger
│   │   ├── monteCarloEngine.ts          # 1,000-iteration Monte Carlo stress tester & ruin probability
│   │   ├── pineScriptGenerator.ts       # TradingView Pine Script v5 code synthesizer
│   │   └── geminiService.ts             # AI strategy parser from natural language prompts
│   │
│   ├── components/
│   │   ├── Header.tsx                   # Top bar with live asset badge, search, mode switcher, paper balance
│   │   ├── WatchlistBar.tsx             # Ticker carousel (NVDA, AAPL, TSLA, BTC, ETH, SOL, EURUSD, XAUUSD)
│   │   ├── TradingChart.tsx             # TradingView Lightweight Charts canvas with dynamic signal markers
│   │   ├── LiveSignalCard.tsx           # Real-time Buy/Sell guidance card with SL/TP levels & position calculator
│   │   ├── StrategyBuilder.tsx          # Natural language AI strategy prompt + visual rule sliders
│   │   ├── BacktestDashboard.tsx        # Institutional metrics, equity curve vs S&P 500, trade log
│   │   ├── MonteCarloView.tsx           # 1,000-path Monte Carlo fan chart, drawdown distribution, ruin risk
│   │   ├── PaperTradingModal.tsx        # Real-time virtual order placement & active trade P&L monitor
│   │   ├── PineScriptModal.tsx          # TradingView Pine Script v5 copy/export modal
│   │   └── IndicatorSettingsModal.tsx   # Customization for EMA periods, RSI thresholds, etc.
│   │
│   └── utils/
│       └── formatters.ts                # Currency, percentage, timestamp, and number formatting utilities
```

---

## 6. 🌐 Zero-Cost Deployment Architecture

```
[ Git Repository ]
       │
       ▼ (Automatic GitHub Push)
[ Vercel / Netlify CI/CD Pipeline ]
       │
       ▼ (Static Optimization & Global CDN Distribution)
[ Production Web App: https://your-trading-advisor.vercel.app ]
       │
       ├── Client-side execution (0 backend server fees)
       ├── Free public market APIs & WebSockets
       └── Free Google Gemini API tier for AI prompts
```

---

## 7. 🌟 Resume & Interview Highlighting

This project directly proves expertise in:
1. **Frontend & Interactive Data Visualization:** High-FPS candlestick charts using TradingView's official rendering engine.
2. **Quantitative Finance & Financial Mathematics:** Practical implementations of Sharpe/Sortino ratios, Maximum Drawdown, and Monte Carlo probability modeling.
3. **AI & Modern LLM Integration:** Translating unstructured natural language into structured, executable algorithmic trading logic.
4. **Real-time Event-Driven Architecture:** Live price feeds, reactive state management, and real-time trade signal generation with zero server overhead.
