# 🔬 QuantumBacktest — AI Quant Strategy Lab & Live Trading Copilot

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg?logo=vite)](https://vitejs.dev/)
[![TradingView Charts](https://img.shields.io/badge/TradingView-Lightweight--Charts-10b981.svg)](https://tradingview.github.io/lightweight-charts/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An institutional-grade quantitative trading intelligence platform, real-time TradingView charting terminal, AI strategy builder, Walk-Forward backtester, Monte Carlo risk engine, and live paper trading sandbox.

---

## 🌟 Key Features

1. **📊 TradingView-Grade Live Charting Terminal**
   * Real-time candlestick charts with multi-timeframe switching (`1m`, `5m`, `15m`, `1h`, `1D`).
   * Dynamic indicator overlays: Fast 20 EMA, Slow 50 EMA, 200 SMA, Bollinger Bands (20, 2σ), and Volume profile.
   * Dynamically pinned 🟢 **BUY** and 🔴 **SELL** signal markers on trigger candles.
   * Transparent **`DataModeBadge`** indicating `Live WS` (Binance real-time crypto) vs. `Simulated Replay` (equities/forex).

2. **🚦 Real-Time Buy / Sell Signal Guidance & Risk Matrix**
   * Instant confluence confidence score (0–100%).
   * Precise **Entry Zones**, **Stop-Loss (SL)**, **Take-Profit 1 & 2 (TP1/TP2)**, and **Risk/Reward Ratios**.
   * **Fractional Kelly Criterion Position Sizing ($k=0.35$)** with full-Kelly theoretical upper bounds.
   * Transparent AI trade rationale explaining why the setup formed.

3. **🤖 Natural Language AI Strategy Compiler**
   * Convert plain English hypotheses (*"Buy Bitcoin when RSI < 30 and 20 EMA > 50 EMA"*) into structured algorithmic rules.
   * **1-Click Pine Script v5 Export:** Paste directly into [TradingView.com](https://tradingview.com) Pine Editor.
   * **Python Backtrader Export:** Run in Python quant environments.

4. **⚡ Institutional Backtester & Walk-Forward Validation (WFV)**
   * Computes Wall Street risk-adjusted returns: **Sharpe Ratio, Sortino Ratio, Calmar Ratio, Max Drawdown %, Win Rate, and Profit Factor**.
   * **Walk-Forward Validation:** Splits historical series into rolling in-sample (train) and out-of-sample (test) windows to guard against overfitting and data-mining bias.
   * Interactive Equity Curve vs. S&P 500 Buy & Hold benchmark.

5. **🎲 1,000-Path Monte Carlo Stress Simulator**
   * Evaluates strategy fragility by simulating 1,000 randomized synthetic futures using trade bootstrapping and Geometric Brownian Motion.
   * Calculates **Probability of Ruin (&gt;50% Drawdown)**, 95th/50th/5th percentile trajectories, and drawdown distributions.

6. **💼 Real-Time Paper Trading Portfolio**
   * Virtual $10,000 initial balance with live unrealized P&L and automated Stop-Loss / Take-Profit order triggers.
   * LocalStorage persistence across sessions.

---

## 🛠️ Tech Stack & 100% Free-Tier Architecture

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
* **Charts:** TradingView Lightweight Charts (`lightweight-charts`), Recharts.
* **Real-Time Feeds:** Binance Public WebSockets (`wss://stream.binance.com:9443`).
* **AI Engine:** Google Gemini Flash Free Tier API via `/api/gemini` serverless proxy + client-side NLP heuristics.
* **Hosting:** 100% Free Static CDN on Vercel, Netlify, or GitHub Pages.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone or navigate to the repository
cd TradingAdvisor

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

Open your browser at `http://localhost:3000` to interact with the platform.

---

## 🌐 1-Click Free Deployment

### Deploy to Vercel
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** → Import your repo.
3. (Optional) Add `GEMINI_API_KEY` under Project Settings → Environment Variables.
4. Click **Deploy** — your live URL will be ready in under 60 seconds!

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
