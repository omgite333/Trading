import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ChevronDown,
  Clock,
  Activity,
  Layers,
  BarChart3,
  LineChart,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { binance, type Ticker, type Candle, type OrderBook, type Symbol } from '@/lib/binance';

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

export default function TradePage() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [tickers, setTickers] = useState<Map<string, Ticker>>(new Map());
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const currentTicker = tickers.get(selectedSymbol);

  useEffect(() => {
    loadInitialData();
    return () => {
      binance.disconnectAll();
      chartRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      loadChartData();
      subscribeToStreams();
    }
  }, [selectedSymbol, timeframe]);

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
  }, []);

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
          <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-hide">
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-4"
      >
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {selectedSymbol.replace('USDT', '').slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{selectedSymbol.replace('USDT', '')}/USDT</p>
                    <p className="text-xs text-gray-500">Binance</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
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
              <div className="grid grid-cols-5 gap-1 p-1 rounded-lg bg-white/5">
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

          <div className="grid grid-cols-4 gap-4 mb-4">
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
          </div>

          <div ref={chartContainerRef} className="h-[400px]" />
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
