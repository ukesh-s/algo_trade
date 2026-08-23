import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, UTCTimestamp, SeriesMarker, Time } from 'lightweight-charts';
import { Candle, TimeFrame, TickerInfo, IndicatorValues } from '../types/trading';
import { calculateEMA, calculateBollingerBands } from '../services/indicatorService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Maximize2, RefreshCw, BarChart2 } from 'lucide-react';

interface TradingChartProps {
  ticker: TickerInfo;
  candles: Candle[];
  timeframe: TimeFrame;
  onChangeTimeframe: (tf: TimeFrame) => void;
  indicators: IndicatorValues;
  markers?: SeriesMarker<Time>[];
  showEma?: boolean;
  showBollinger?: boolean;
  showVolume?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  ticker,
  candles,
  timeframe,
  onChangeTimeframe,
  indicators,
  markers = [],
  showEma = true,
  showBollinger = true,
  showVolume = true,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const upperBbSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerBbSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null>(null);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0b0f17' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0f172a',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0f172a',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    // Volume Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#38bdf8',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    // EMA 20 & 50 Series
    const ema20Series = chart.addLineSeries({
      color: '#38bdf8',
      lineWidth: 2,
      title: 'EMA 20',
      priceLineVisible: false,
    });

    const ema50Series = chart.addLineSeries({
      color: '#818cf8',
      lineWidth: 2,
      title: 'EMA 50',
      priceLineVisible: false,
    });

    // Bollinger Bands Series
    const upperBbSeries = chart.addLineSeries({
      color: 'rgba(168, 85, 247, 0.6)',
      lineWidth: 1,
      title: 'Upper BB',
      priceLineVisible: false,
    });

    const lowerBbSeries = chart.addLineSeries({
      color: 'rgba(168, 85, 247, 0.6)',
      lineWidth: 1,
      title: 'Lower BB',
      priceLineVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;
    upperBbSeriesRef.current = upperBbSeries;
    lowerBbSeriesRef.current = lowerBbSeries;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setHoverData(null);
      } else {
        const cData = param.seriesData.get(candleSeries) as CandlestickData;
        const vData = param.seriesData.get(volumeSeries) as HistogramData;
        if (cData) {
          setHoverData({
            time: new Date(Number(param.time) * 1000).toLocaleTimeString(),
            open: cData.open,
            high: cData.high,
            low: cData.low,
            close: cData.close,
            volume: vData ? vData.value : 0,
          });
        }
      }
    });

    // Resize Observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update Data & Overlays
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || candles.length === 0) return;

    // Convert candles to Lightweight Charts format
    const formattedCandles: CandlestickData[] = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const formattedVolumes: HistogramData[] = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
    }));

    candleSeriesRef.current.setData(formattedCandles);

    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(showVolume ? formattedVolumes : []);
    }

    // Calculate & Set EMA Overlays
    if (showEma && ema20SeriesRef.current && ema50SeriesRef.current) {
      const ema20Values = calculateEMA(candles, 20);
      const ema50Values = calculateEMA(candles, 50);

      const ema20Data: LineData[] = [];
      const ema50Data: LineData[] = [];

      for (let i = 0; i < candles.length; i++) {
        if (ema20Values[i] !== undefined) {
          ema20Data.push({ time: candles[i].time as UTCTimestamp, value: ema20Values[i]! });
        }
        if (ema50Values[i] !== undefined) {
          ema50Data.push({ time: candles[i].time as UTCTimestamp, value: ema50Values[i]! });
        }
      }

      ema20SeriesRef.current.setData(ema20Data);
      ema50SeriesRef.current.setData(ema50Data);
    } else {
      ema20SeriesRef.current?.setData([]);
      ema50SeriesRef.current?.setData([]);
    }

    // Calculate & Set Bollinger Bands
    if (showBollinger && upperBbSeriesRef.current && lowerBbSeriesRef.current) {
      const bb = calculateBollingerBands(candles, 20, 2);
      const upperData: LineData[] = [];
      const lowerData: LineData[] = [];

      for (let i = 0; i < candles.length; i++) {
        if (bb.upper[i] !== undefined && bb.lower[i] !== undefined) {
          upperData.push({ time: candles[i].time as UTCTimestamp, value: bb.upper[i]! });
          lowerData.push({ time: candles[i].time as UTCTimestamp, value: bb.lower[i]! });
        }
      }

      upperBbSeriesRef.current.setData(upperData);
      lowerBbSeriesRef.current.setData(lowerData);
    } else {
      upperBbSeriesRef.current?.setData([]);
      lowerBbSeriesRef.current?.setData([]);
    }

    // Attach Signal Markers (Buy / Sell Arrows)
    if (markers && markers.length > 0) {
      candleSeriesRef.current.setMarkers(markers);
    } else {
      candleSeriesRef.current.setMarkers([]);
    }
  }, [candles, showEma, showBollinger, showVolume, markers]);

  const latestCandle = candles[candles.length - 1];
  const displayData = hoverData || (latestCandle ? {
    time: new Date(latestCandle.time * 1000).toLocaleTimeString(),
    open: latestCandle.open,
    high: latestCandle.high,
    low: latestCandle.low,
    close: latestCandle.close,
    volume: latestCandle.volume,
  } : null);

  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-2xl border border-slate-800/90 overflow-hidden shadow-card-dark">
      
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-dark-850 border-b border-slate-800/80">
        
        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1 bg-dark-950/80 p-1 rounded-lg border border-slate-800">
          {(['1m', '5m', '15m', '1h', '1D'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onChangeTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-brand-primary text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* OHLCV Readout */}
        {displayData && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300 overflow-x-auto no-scrollbar">
            <div><span className="text-slate-500">O:</span> {formatCurrency(displayData.open, ticker.decimals)}</div>
            <div><span className="text-slate-500">H:</span> {formatCurrency(displayData.high, ticker.decimals)}</div>
            <div><span className="text-slate-500">L:</span> {formatCurrency(displayData.low, ticker.decimals)}</div>
            <div>
              <span className="text-slate-500">C:</span>{' '}
              <span className={displayData.close >= displayData.open ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {formatCurrency(displayData.close, ticker.decimals)}
              </span>
            </div>
            {displayData.volume > 0 && (
              <div><span className="text-slate-500">Vol:</span> {displayData.volume.toLocaleString()}</div>
            )}
          </div>
        )}

        {/* Indicator Badges & Reset Zoom */}
        <div className="flex items-center gap-2">
          {showEma && (
            <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-brand-primary"></span>
              <span className="text-slate-400">EMA20</span>
              <span className="h-2 w-2 rounded-full bg-indigo-400 ml-1"></span>
              <span className="text-slate-400">EMA50</span>
            </div>
          )}

          <button
            onClick={() => chartRef.current?.timeScale().fitContent()}
            title="Fit content / Reset View"
            className="p-1.5 rounded-lg bg-dark-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-grow w-full min-h-[460px]">
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>

    </div>
  );
};
