import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';
import { 
  Search,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
  X,
  Plus
} from 'lucide-react';
import { binance, type Ticker, type Candle, type OrderBook, type Symbol } from '@/lib/binance';

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

type IndicatorType = 'MA' | 'EMA' | 'BB' | 'RSI' | 'MACD' | 'VOLUME';

interface IndicatorConfig {
  type: IndicatorType;
  enabled: boolean;
  params: Record<string, number>;
  color: string;
}

interface MovingAverageResult {
  time: number;
  value: number;
}

interface BollingerBandResult {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

const defaultIndicators: Record<IndicatorType, IndicatorConfig> = {
  MA: { type: 'MA', enabled: true, params: { period: 20 }, color: '#818cf8' },
  EMA: { type: 'EMA', enabled: false, params: { period: 50 }, color: '#f59e0b' },
  BB: { type: 'BB', enabled: false, params: { period: 20, stdDev: 2 }, color: '#10b981' },
  RSI: { type: 'RSI', enabled: false, params: { period: 14 }, color: '#ec4899' },
  MACD: { type: 'MACD', enabled: false, params: { fast: 12, slow: 26, signal: 9 }, color: '#06b6d4' },
  VOLUME: { type: 'VOLUME', enabled: true, params: {}, color: '#818cf8' },
};

function calculateSMA(data: Candle[], period: number): MovingAverageResult[] {
  const result: MovingAverageResult[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function calculateEMA(data: Candle[], period: number): MovingAverageResult[] {
  const result: MovingAverageResult[] = [];
  const multiplier = 2 / (period + 1);
  
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let prevEMA = sum / period;
  result.push({ time: data[period - 1].time, value: prevEMA });
  
  for (let i = period; i < data.length; i++) {
    const ema = (data[i].close - prevEMA) * multiplier + prevEMA;
    result.push({ time: data[i].time, value: ema });
    prevEMA = ema;
  }
  return result;
}

function calculateBollingerBands(data: Candle[], period: number, stdDev: number): BollingerBandResult[] {
  const result: BollingerBandResult[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const sma = sum / period;
    
    let squaredDiff = 0;
    for (let j = 0; j < period; j++) {
      squaredDiff += Math.pow(data[i - j].close - sma, 2);
    }
    const standardDeviation = Math.sqrt(squaredDiff / period);
    
    result.push({
      time: data[i].time,
      upper: sma + standardDeviation * stdDev,
      middle: sma,
      lower: sma - standardDeviation * stdDev,
    });
  }
  return result;
}

function calculateRSI(data: Candle[], period: number): MovingAverageResult[] {
  const result: MovingAverageResult[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = period; i < gains.length + 1; i++) {
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let j = i - period; j < i; j++) {
      avgGain += gains[j];
      avgLoss += losses[j];
    }
    avgGain /= period;
    avgLoss /= period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({ time: data[i].time, value: rsi });
  }
  return result;
}

export default function TradePage() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [tickers, setTickers] = useState<Map<string, Ticker>>(new Map());
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [indicators, setIndicators] = useState<Record<IndicatorType, IndicatorConfig>>(defaultIndicators);
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [rsiData, setRsiData] = useState<MovingAverageResult[]>([]);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const currentTicker = tickers.get(selectedSymbol);

  useEffect(() => {
    loadInitialData();
    return () => {
      binance.disconnectAll();
      chartRef.current?.remove();
      rsiChartRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      loadChartData();
      subscribeToStreams();
    }
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    if (candles.length > 0) {
      updateIndicators();
    }
  }, [candles, indicators]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [symbolsData, tickersData] = await Promise.all([
        binance.getSymbols(),
        binance.getTickers(),
      ]);
      setSymbols(symbolsData);
      
      const tickerMap = new Map<string, Ticker>();
      tickersData.forEach(t => tickerMap.set(t.symbol, t));
      setTickers(tickerMap);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
    setIsLoading(false);
  };

  const loadChartData = async () => {
    try {
      const data = await binance.getKlines(selectedSymbol, timeframe, 500);
      setCandles(data);
      initChart(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const initChart = useCallback((data: Candle[]) => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#818cf8', labelBackgroundColor: '#4f46e5' },
        horzLine: { color: '#818cf8', labelBackgroundColor: '#4f46e5' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#818cf8',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const candleData: CandlestickData[] = data.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData[] = data.map(c => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
    }));

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    chartRef.current = chart;

    if (indicators.MA.enabled) {
      const maData = calculateSMA(data, indicators.MA.params.period);
      const maSeries = chart.addLineSeries({
        color: indicators.MA.color,
        lineWidth: 1,
        priceLineVisible: false,
      });
      maSeries.setData(maData.map(d => ({ time: d.time as any, value: d.value })));
      maSeriesRef.current = maSeries;
    }

    if (indicators.EMA.enabled) {
      const emaData = calculateEMA(data, indicators.EMA.params.period);
      const emaSeries = chart.addLineSeries({
        color: indicators.EMA.color,
        lineWidth: 1,
        priceLineVisible: false,
      });
      emaSeries.setData(emaData.map(d => ({ time: d.time as any, value: d.value })));
      emaSeriesRef.current = emaSeries;
    }

    if (indicators.BB.enabled) {
      const bbData = calculateBollingerBands(data, indicators.BB.params.period, indicators.BB.params.stdDev);
      const bbUpper = chart.addLineSeries({
        color: 'rgba(16, 185, 129, 0.5)',
        lineWidth: 1,
        priceLineVisible: false,
      });
      const bbMiddle = chart.addLineSeries({
        color: indicators.BB.color,
        lineWidth: 1,
        priceLineVisible: false,
        lineStyle: 2,
      });
      const bbLower = chart.addLineSeries({
        color: 'rgba(16, 185, 129, 0.5)',
        lineWidth: 1,
        priceLineVisible: false,
      });
      bbUpper.setData(bbData.map(d => ({ time: d.time as any, value: d.upper })));
      bbMiddle.setData(bbData.map(d => ({ time: d.time as any, value: d.middle })));
      bbLower.setData(bbData.map(d => ({ time: d.time as any, value: d.lower })));
      bbUpperRef.current = bbUpper;
      bbMiddleRef.current = bbMiddle;
      bbLowerRef.current = bbLower;
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    if (indicators.RSI.enabled) {
      initRSIChart(data);
    }
  }, [indicators]);

  const initRSIChart = (data: Candle[]) => {
    if (!rsiContainerRef.current) return;

    if (rsiChartRef.current) {
      rsiChartRef.current.remove();
    }

    const rsiChart = createChart(rsiContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        visible: false,
      },
      height: 120,
    });

    const rsiSeries = rsiChart.addLineSeries({
      color: indicators.RSI.color,
      lineWidth: 2,
      priceLineVisible: false,
    });

    const rsiData = calculateRSI(data, indicators.RSI.params.period);
    setRsiData(rsiData);
    rsiSeries.setData(rsiData.map(d => ({ time: d.time as any, value: d.value })));
    rsiSeriesRef.current = rsiSeries;
    rsiChartRef.current = rsiChart;

    rsiChart.priceScale('').applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.1 },
    });
  };

  const updateIndicators = () => {
    if (candles.length === 0 || !chartRef.current) return;

    if (indicators.MA.enabled && !maSeriesRef.current) {
      const maData = calculateSMA(candles, indicators.MA.params.period);
      const maSeries = chartRef.current.addLineSeries({
        color: indicators.MA.color,
        lineWidth: 1,
        priceLineVisible: false,
      });
      maSeries.setData(maData.map(d => ({ time: d.time as any, value: d.value })));
      maSeriesRef.current = maSeries;
    } else if (!indicators.MA.enabled && maSeriesRef.current) {
      maSeriesRef.current.remove();
      maSeriesRef.current = null;
    }

    if (indicators.EMA.enabled && !emaSeriesRef.current) {
      const emaData = calculateEMA(candles, indicators.EMA.params.period);
      const emaSeries = chartRef.current.addLineSeries({
        color: indicators.EMA.color,
        lineWidth: 1,
        priceLineVisible: false,
      });
      emaSeries.setData(emaData.map(d => ({ time: d.time as any, value: d.value })));
      emaSeriesRef.current = emaSeries;
    } else if (!indicators.EMA.enabled && emaSeriesRef.current) {
      emaSeriesRef.current.remove();
      emaSeriesRef.current = null;
    }

    if (indicators.BB.enabled && !bbUpperRef.current) {
      const bbData = calculateBollingerBands(candles, indicators.BB.params.period, indicators.BB.params.stdDev);
      const bbUpper = chartRef.current.addLineSeries({
        color: 'rgba(16, 185, 129, 0.5)',
        lineWidth: 1,
        priceLineVisible: false,
      });
      const bbMiddle = chartRef.current.addLineSeries({
        color: indicators.BB.color,
        lineWidth: 1,
        priceLineVisible: false,
        lineStyle: 2,
      });
      const bbLower = chartRef.current.addLineSeries({
        color: 'rgba(16, 185, 129, 0.5)',
        lineWidth: 1,
        priceLineVisible: false,
      });
      bbUpper.setData(bbData.map(d => ({ time: d.time as any, value: d.upper })));
      bbMiddle.setData(bbData.map(d => ({ time: d.time as any, value: d.middle })));
      bbLower.setData(bbData.map(d => ({ time: d.time as any, value: d.lower })));
      bbUpperRef.current = bbUpper;
      bbMiddleRef.current = bbMiddle;
      bbLowerRef.current = bbLower;
    } else if (!indicators.BB.enabled && bbUpperRef.current) {
      bbUpperRef.current.remove();
      bbMiddleRef.current?.remove();
      bbLowerRef.current?.remove();
      bbUpperRef.current = null;
      bbMiddleRef.current = null;
      bbLowerRef.current = null;
    }

    if (indicators.RSI.enabled && !rsiSeriesRef.current) {
      initRSIChart(candles);
    } else if (!indicators.RSI.enabled && rsiSeriesRef.current) {
      rsiChartRef.current?.remove();
      rsiChartRef.current = null;
      rsiSeriesRef.current = null;
      setRsiData([]);
    }
  };

  const toggleIndicator = (type: IndicatorType) => {
    setIndicators(prev => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled }
    }));
    
    if (chartRef.current) {
      chartRef.current.remove();
      initChart(candles);
    }
  };

  const subscribeToStreams = () => {
    const unsubKlines = binance.subscribeToKlines(selectedSymbol, timeframe, (candle) => {
      setCandles(prev => {
        const newCandles = [...prev];
        const lastIndex = newCandles.length - 1;
        if (lastIndex >= 0 && newCandles[lastIndex].time === candle.time) {
          newCandles[lastIndex] = candle;
        } else {
          newCandles.push(candle);
          if (newCandles.length > 500) newCandles.shift();
        }
        return newCandles;
      });

      if (candleSeriesRef.current) {
        candleSeriesRef.current.update({
          time: candle.time as any,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      }
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.update({
          time: candle.time as any,
          value: candle.volume,
          color: candle.close >= candle.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
        });
      }
    });

    const unsubTicker = binance.subscribeToTicker(selectedSymbol, (ticker) => {
      setTickers(prev => {
        const newMap = new Map(prev);
        newMap.set(ticker.symbol, ticker);
        return newMap;
      });
    });

    const unsubOrderBook = binance.subscribeToOrderBook(selectedSymbol, (book) => {
      setOrderBook(book);
    });

    return () => {
      unsubKlines();
      unsubTicker();
      unsubOrderBook();
    };
  };

  const filteredSymbols = symbols.filter(s => {
    const ticker = tickers.get(s.symbol);
    if (!ticker) return false;
    if (searchQuery) {
      return s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
             s.baseAsset.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return ticker.quoteVolume24h > 1000000;
  }).slice(0, 50);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
    return vol.toFixed(2);
  };

  const getCurrentRSI = () => {
    if (rsiData.length === 0) return null;
    return rsiData[rsiData.length - 1].value;
  };

  const getRSIStatus = (value: number) => {
    if (value > 70) return { label: 'Overbought', color: 'text-rose-400' };
    if (value < 30) return { label: 'Oversold', color: 'text-emerald-400' };
    return { label: 'Neutral', color: 'text-gray-400' };
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-64 shrink-0 flex flex-col gap-4"
      >
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Markets</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="space-y-1 max-h-[calc(100vh-420px)] overflow-y-auto scrollbar-hide">
            {filteredSymbols.map((symbol) => {
              const ticker = tickers.get(symbol.symbol);
              return (
                <button
                  key={symbol.symbol}
                  onClick={() => setSelectedSymbol(symbol.symbol)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    selectedSymbol === symbol.symbol
                      ? 'bg-indigo-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {symbol.baseAsset.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{symbol.baseAsset}</p>
                      <p className="text-xs text-gray-500">{formatVolume(ticker?.quoteVolume24h || 0)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-white">{formatPrice(ticker?.price || 0)}</p>
                    <p className={`text-xs font-mono ${(ticker?.changePercent24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(ticker?.changePercent24h || 0) >= 0 ? '+' : ''}{(ticker?.changePercent24h || 0).toFixed(2)}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">Indicators</h3>
            <button
              onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(indicators).map(([key, config]) => (
              <div
                key={key}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  config.enabled ? 'bg-white/5' : 'hover:bg-white/5'
                }`}
                onClick={() => toggleIndicator(config.type)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.enabled ? config.color : '#4b5563' }}
                  />
                  <span className="text-sm text-gray-300">{config.type}</span>
                </div>
                {config.enabled && (
                  <span className="text-xs text-gray-500">
                    ({config.params.period || config.params.fast || ''})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {indicators.RSI.enabled && rsiData.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">RSI (14)</h3>
              {(() => {
                const rsi = getCurrentRSI();
                if (rsi === null) return null;
                const status = getRSIStatus(rsi);
                return (
                  <span className={`text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                );
              })()}
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: indicators.RSI.color }}>
              {getCurrentRSI()?.toFixed(1) || '--'}
            </p>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Oversold</span>
              <span>Overbought</span>
            </div>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-500 via-gray-600 to-rose-500 mt-1">
              <div
                className="absolute w-2 h-2 rounded-full bg-white border-2 border-gray-800 -top-0.5"
                style={{
                  left: `${Math.min(Math.max(((getCurrentRSI() || 50) - 30) / 40 * 100, 0), 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-4"
      >
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {selectedSymbol.replace('USDT', '').slice(0, 2)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{selectedSymbol.replace('USDT', '')}/USDT</p>
                  <p className="text-xs text-gray-500">Binance</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-white font-mono">{formatPrice(currentTicker?.price || 0)}</p>
                  <p className={`text-sm font-medium ${(currentTicker?.changePercent24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(currentTicker?.changePercent24h || 0) >= 0 ? '+' : ''}{formatPrice(currentTicker?.change24h || 0)} ({(currentTicker?.changePercent24h || 0).toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-6 gap-1 p-1 rounded-lg bg-white/5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      timeframe === tf.value
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-500 mb-1">24h High</p>
              <p className="text-sm font-mono text-white">{formatPrice(currentTicker?.high24h || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-500 mb-1">24h Low</p>
              <p className="text-sm font-mono text-white">{formatPrice(currentTicker?.low24h || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-500 mb-1">24h Volume</p>
              <p className="text-sm font-mono text-white">{formatVolume(currentTicker?.volume24h || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-500 mb-1">Quote Volume</p>
              <p className="text-sm font-mono text-white">${formatVolume(currentTicker?.quoteVolume24h || 0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-500 mb-1">Change</p>
              <p className={`text-sm font-mono font-medium ${(currentTicker?.changePercent24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(currentTicker?.changePercent24h || 0) >= 0 ? '+' : ''}{(currentTicker?.changePercent24h || 0).toFixed(2)}%
              </p>
            </div>
          </div>

          <div ref={chartContainerRef} className="h-[350px]" />
          
          {indicators.RSI.enabled && (
            <div className="mt-2">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs text-gray-500">RSI (14)</span>
              </div>
              <div ref={rsiContainerRef} className="h-[120px]" />
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-72 shrink-0 flex flex-col gap-4"
      >
        <div className="glass rounded-2xl p-4 flex-1">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Order Book</h3>
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
            <span>Price</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {orderBook?.asks.slice().reverse().map((ask, i) => (
              <div key={`ask-${i}`} className="relative">
                <div
                  className="absolute inset-0 bg-rose-500/10"
                  style={{ width: `${Math.min((ask.quantity / (orderBook?.asks[0]?.quantity || 1)) * 100, 100)}%` }}
                />
                <div className="relative flex justify-between py-1 px-2 text-xs">
                  <span className="font-mono text-rose-400">{formatPrice(ask.price)}</span>
                  <span className="font-mono text-gray-400">{ask.quantity.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center py-2 my-2 border-y border-white/10">
            <span className="text-lg font-bold text-white font-mono">{formatPrice(currentTicker?.price || 0)}</span>
          </div>
          <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {orderBook?.bids.map((bid, i) => (
              <div key={`bid-${i}`} className="relative">
                <div
                  className="absolute inset-0 bg-emerald-500/10"
                  style={{ width: `${Math.min((bid.quantity / (orderBook?.bids[0]?.quantity || 1)) * 100, 100)}%` }}
                />
                <div className="relative flex justify-between py-1 px-2 text-xs">
                  <span className="font-mono text-emerald-400">{formatPrice(bid.price)}</span>
                  <span className="font-mono text-gray-400">{bid.quantity.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Trade</h3>
          <div className="flex gap-2 mb-3">
            <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:opacity-90 transition-opacity">
              Buy
            </button>
            <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold hover:opacity-90 transition-opacity">
              Sell
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Amount</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button key={pct} className="py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  {pct}%
                </button>
              ))}
            </div>
            <button className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors">
              Place Order
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
