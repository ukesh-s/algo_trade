import { Candle, TickerInfo } from '../types/trading';

type PriceUpdateListener = (ticker: string, price: number, candle: Candle) => void;

export class LiveDataService {
  private activeWs: WebSocket | null = null;
  private currentTicker: string = 'BTC/USDT';
  private listeners: Set<PriceUpdateListener> = new Set();
  private simulationInterval: number | null = null;
  private lastCandle: Candle | null = null;

  constructor() {
    // Initialized
  }

  public subscribe(ticker: TickerInfo, initialCandles: Candle[], onUpdate: PriceUpdateListener) {
    this.currentTicker = ticker.symbol;
    this.listeners.add(onUpdate);
    
    if (initialCandles.length > 0) {
      this.lastCandle = { ...initialCandles[initialCandles.length - 1] };
    }

    this.cleanup();

    if (ticker.dataMode === 'live' && ticker.category === 'CRYPTO') {
      this.startBinanceWebSocket(ticker);
    } else {
      this.startSimulatedTickStream(ticker);
    }
  }

  public unsubscribe(onUpdate: PriceUpdateListener) {
    this.listeners.delete(onUpdate);
    if (this.listeners.size === 0) {
      this.cleanup();
    }
  }

  private startBinanceWebSocket(ticker: TickerInfo) {
    try {
      // e.g. btcusdt@kline_1m
      const cleanSymbol = ticker.symbol.replace('/', '').toLowerCase();
      const wsUrl = `wss://stream.binance.com:9443/ws/${cleanSymbol}@kline_1m`;
      
      this.activeWs = new WebSocket(wsUrl);

      this.activeWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.k) {
            const k = data.k;
            const price = parseFloat(k.c);
            const candle: Candle = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: price,
              volume: parseFloat(k.v),
            };

            this.lastCandle = candle;
            this.notifyListeners(ticker.symbol, price, candle);
          }
        } catch {
          // fallback
        }
      };

      this.activeWs.onerror = () => {
        // Fallback to simulated ticks on WS connection issue
        this.startSimulatedTickStream(ticker);
      };

      this.activeWs.onclose = () => {
        // Closed
      };
    } catch {
      this.startSimulatedTickStream(ticker);
    }
  }

  private startSimulatedTickStream(ticker: TickerInfo) {
    if (this.simulationInterval) {
      window.clearInterval(this.simulationInterval);
    }

    this.simulationInterval = window.setInterval(() => {
      if (!this.lastCandle) return;

      const volatility = ticker.category === 'CRYPTO' ? 0.0015 : 0.0006;
      const changePct = (Math.random() - 0.495) * volatility;
      const newPrice = Number((this.lastCandle.close * (1 + changePct)).toFixed(ticker.decimals));

      const updatedCandle: Candle = {
        time: this.lastCandle.time,
        open: this.lastCandle.open,
        high: Math.max(this.lastCandle.high, newPrice),
        low: Math.min(this.lastCandle.low, newPrice),
        close: newPrice,
        volume: this.lastCandle.volume + Math.round(Math.random() * 5),
      };

      this.lastCandle = updatedCandle;
      this.notifyListeners(ticker.symbol, newPrice, updatedCandle);
    }, 1200);
  }

  private notifyListeners(ticker: string, price: number, candle: Candle) {
    this.listeners.forEach((listener) => {
      listener(ticker, price, candle);
    });
  }

  public cleanup() {
    if (this.activeWs) {
      this.activeWs.close();
      this.activeWs = null;
    }
    if (this.simulationInterval) {
      window.clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

export const liveDataService = new LiveDataService();
