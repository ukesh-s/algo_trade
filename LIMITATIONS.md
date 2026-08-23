# ⚠️ Scope, Known Limitations & Production Roadmap

This document provides transparent technical disclosure of the architectural trade-offs, data constraints, and development roadmap of **QuantumBacktest**.

---

## 1. 📡 Market Data Feeds & Latency
* **Crypto Markets (BTC, ETH, SOL):** Uses live Binance public WebSockets (`wss://stream.binance.com:9443`). Sub-second live price updates with zero simulated delay.
* **Equities, Forex & Commodities (NVDA, AAPL, TSLA, EUR/USD, Gold):**
  * Free-tier financial data APIs (e.g. Finnhub) enforce strict rate limits (~60 requests/min), and Yahoo Finance has no official real-time WebSocket for free users.
  * To guarantee a smooth 60 FPS user experience without API throttling errors or costs, the platform utilizes high-fidelity **Market Replay & Stochastic Tick Simulation** for these assets, clearly indicated in the UI via the **`DataModeBadge`** (`Live` vs. `Simulated Replay`).
  * *Production Upgrade Path:* Connect to enterprise streaming providers (e.g., Polygon.io, Alpaca Markets WebSocket, or Interactive Brokers Gateway).

---

## 2. 🛡️ Backtest Overfitting & Walk-Forward Validation
* **The Look-Ahead & Curve-Fitting Risk:** In single-pass historical backtests, complex multi-parameter indicators can easily overfit past noise.
* **Our Mitigation:** QuantumBacktest integrates **Walk-Forward Validation (WFV)**, splitting historical data into rolling in-sample (train) and out-of-sample (test) windows. The Walk-Forward Efficiency Ratio ($WFE = Sharpe_{OOS} / Sharpe_{IS}$) is computed to give users an honest metric of whether an edge is robust or overfit.

---

## 3. ⚖️ Position Sizing (Fractional vs. Full Kelly)
* **Risk of Full Kelly:** While mathematically optimal for long-term compound growth, full Kelly Criterion is notoriously prone to extreme drawdown volatility when return distributions are fat-tailed or win probabilities are noisy.
* **Our Default:** The platform enforces a **Fractional Kelly multiplier ($k = 0.35$)** by default to protect capital, displaying Full Kelly only as a labeled theoretical upper bound.

---

## 4. 💾 State Persistence & Paper Trading
* **Storage Layer:** Virtual paper trading balances, open positions, and custom strategies persist via browser `LocalStorage`.
* **Caveats:** Cache clears or switching devices will reset the local paper portfolio.
* **Production Upgrade Path:** Integrate a zero-cost Supabase / PostgreSQL database with row-level security and user authentication (OAuth).

---

## 5. 🔐 Security & Secret Key Isolation
* **Zero Client Leaks:** The AI natural language strategy parser is designed to query a serverless edge proxy (`/api/gemini.ts`), ensuring no private API keys are ever bundled into client-side JavaScript.
* When run purely static (e.g. on GitHub Pages), it smoothly falls back to its built-in client-side NLP rule extraction compiler.

---

## 6. 🚀 Version 3.0 Production Roadmap
1. Direct broker webhook execution (Alpaca API for zero-commission US stock execution, Bybit/Binance API keys for automated crypto trading).
2. Multi-asset portfolio co-integration & Markowitz Efficient Frontier optimization chart.
3. Custom Pine Script v5 import parser to backtest external TradingView scripts directly in-browser.
