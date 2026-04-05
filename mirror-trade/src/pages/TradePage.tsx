import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData } from 'lightweight-charts';
import { Search, TrendingUp, TrendingDown, X, Clock, Wallet, BarChart3 } from 'lucide-react';
import { binance, type Ticker, type Candle, type OrderBook, type Symbol } from '@/lib/binance';
import { useTrading } from '@/hooks/useTrading';

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];
const ORDER_TYPES = ['Limit', 'Market', 'Stop'];

export default function TradePage() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [tickers, setTickers] = useState<Map<string, Ticker>>(new Map());
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('Limit');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [showOrders, setShowOrders] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const {
    balances,
    positions,
    orders,
    trades,
    totalPnl,
    totalBalance,
    getBalance,
    executeBuy,
    executeSell,
    executeShort,
    coverShort,
    cancelOrder,
  } = useTrading();

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
    }
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    if (currentTicker && orderType === 'Market') {
      setPrice(currentTicker.price.toString());
    }
  }, [currentTicker, orderType]);

  const loadInitialData = async () => {
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
  };

  const loadChartData = async () => {
    try {
      const data = await binance.getKlines(selectedSymbol, timeframe, 500);
      setCandles(data);
      initChart(data);
      subscribeToStreams();
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
        textColor: '#666',
      },
      grid: {
        vertLines: { color: '#1a1a1e' },
        horzLines: { color: '#1a1a1e' },
      },
      crosshair: {
        vertLine: { color: '#444', labelBackgroundColor: '#00d4ff' },
        horzLine: { color: '#444', labelBackgroundColor: '#00d4ff' },
      },
      rightPriceScale: {
        borderColor: '#2a2a2e',
      },
      timeScale: {
        borderColor: '#2a2a2e',
        timeVisible: true,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff3366',
      borderUpColor: '#00ff88',
      borderDownColor: '#ff3366',
      wickUpColor: '#00ff88',
      wickDownColor: '#ff3366',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#00d4ff',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
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
      color: c.close >= c.open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 51, 102, 0.3)',
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
    binance.subscribeToKlines(selectedSymbol, timeframe, (candle) => {
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
          color: candle.close >= candle.open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 51, 102, 0.3)',
        });
      }
    });

    binance.subscribeToTicker(selectedSymbol, (ticker) => {
      setTickers(prev => {
        const newMap = new Map(prev);
        newMap.set(ticker.symbol, ticker);
        return newMap;
      });
    });

    binance.subscribeToOrderBook(selectedSymbol, (book) => {
      setOrderBook(book);
    });
  };

  const handlePlaceOrder = () => {
    const qty = parseFloat(amount);
    const px = parseFloat(price) || currentTicker?.price || 0;

    if (qty <= 0) return;

    if (orderSide === 'BUY') {
      executeBuy(selectedSymbol, qty, px);
    } else {
      executeSell(selectedSymbol, qty, px);
    }

    setAmount('');
  };

  const filteredSymbols = symbols.filter(s => {
    const ticker = tickers.get(s.symbol);
    if (!ticker) return false;
    if (searchQuery) {
      return s.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return ticker.quoteVolume24h > 10000000;
  }).slice(0, 20);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
    return (vol / 1e3).toFixed(0) + 'K';
  };

  const orderPercentages = [25, 50, 75, 100];
  const baseAsset = selectedSymbol.replace('USDT', '');
  const usdtBalance = getBalance('USDT');
  const baseBalance = getBalance(baseAsset);
  const total = (parseFloat(amount) || 0) * (parseFloat(price) || currentTicker?.price || 0);

  return (
    <div className="flex h-[calc(100vh-130px)] gap-0">
      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#2a2a2e]">
          <div className="flex items-center gap-4">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-transparent text-white text-lg font-semibold border-none focus:outline-none cursor-pointer"
            >
              {filteredSymbols.slice(0, 20).map(s => (
                <option key={s.symbol} value={s.symbol} className="bg-[#0a0a0b]">
                  {s.symbol.replace('USDT', '/USDT')}
                </option>
              ))}
            </select>
            <div>
              <span className="text-xl font-mono font-semibold text-white">
                {formatPrice(currentTicker?.price || 0)}
              </span>
              <span className={`ml-2 text-sm font-mono ${(currentTicker?.changePercent24h || 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                {(currentTicker?.changePercent24h || 0) >= 0 ? '+' : ''}{(currentTicker?.changePercent24h || 0).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-[#666]">24h High</span>
                <span className="ml-2 text-white font-mono">{formatPrice(currentTicker?.high24h || 0)}</span>
              </div>
              <div>
                <span className="text-[#666]">24h Low</span>
                <span className="ml-2 text-white font-mono">{formatPrice(currentTicker?.low24h || 0)}</span>
              </div>
              <div>
                <span className="text-[#666]">24h Vol</span>
                <span className="ml-2 text-white font-mono">{formatVolume(currentTicker?.volume24h || 0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-[#00d4ff] text-black'
                      : 'text-[#999] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div ref={chartContainerRef} className="flex-1" />

        {/* Order Book Footer */}
        <div className="h-48 border-t border-[#2a2a2e] flex">
          <div className="flex-1 p-3 overflow-y-auto">
            <h3 className="text-xs font-medium text-[#666] mb-2">Recent Trades</h3>
            <div className="space-y-1">
              {trades.slice(0, 5).map((trade, i) => (
                <div key={trade.id || i} className="flex justify-between text-xs">
                  <span className={trade.side === 'BUY' ? 'text-[#00ff88]' : 'text-[#ff3366]'}>{trade.side}</span>
                  <span className="text-white font-mono">{formatPrice(trade.price)}</span>
                  <span className="text-[#666] font-mono">{trade.quantity}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-px bg-[#2a2a2e]" />
          <div className="flex-1 p-3 overflow-y-auto">
            <h3 className="text-xs font-medium text-[#666] mb-2">Open Orders ({orders.length})</h3>
            <div className="space-y-1">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center text-xs">
                  <span className={order.side === 'BUY' ? 'text-[#00ff88]' : 'text-[#ff3366]'}>{order.side}</span>
                  <span className="text-white font-mono">{order.quantity}</span>
                  <span className="text-[#666] font-mono">@{formatPrice(order.price)}</span>
                  <button onClick={() => cancelOrder(order.id)} className="text-[#ff3366] hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {orders.length === 0 && <p className="text-[#666] text-xs">No open orders</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Order Sidebar */}
      <div className="w-72 border-l border-[#2a2a2e] flex flex-col">
        {/* Balance */}
        <div className="p-3 border-b border-[#2a2a2e]">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-xs text-[#666]">Balance</span>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-white font-mono">${usdtBalance.toFixed(2)}</span>
              <span className="text-[#666] text-xs ml-1">USDT</span>
            </div>
            <div>
              <span className="text-white font-mono">{baseBalance.toFixed(4)}</span>
              <span className="text-[#666] text-xs ml-1">{baseAsset}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#2a2a2e] flex justify-between text-xs">
            <span className="text-[#666]">Total PnL</span>
            <span className={`font-mono ${totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Order Type Tabs */}
        <div className="flex border-b border-[#2a2a2e]">
          {ORDER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                orderType === type
                  ? 'text-white border-b-2 border-[#00d4ff]'
                  : 'text-[#666] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Buy/Sell Section */}
        <div className="p-3">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setOrderSide('BUY')}
              className={`flex-1 py-2.5 rounded text-sm font-medium transition-colors ${
                orderSide === 'BUY'
                  ? 'bg-[#00ff88] text-black'
                  : 'bg-[#1f1f24] text-[#00ff88] hover:bg-[#2a2a2e]'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('SELL')}
              className={`flex-1 py-2.5 rounded text-sm font-medium transition-colors ${
                orderSide === 'SELL'
                  ? 'bg-[#ff3366] text-white'
                  : 'bg-[#1f1f24] text-[#ff3366] hover:bg-[#2a2a2e]'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="space-y-3">
            {orderType !== 'Market' && (
              <div>
                <label className="text-[10px] text-[#666] mb-1 block">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#2a2a2e] rounded text-sm text-white font-mono focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] text-[#666] mb-1 block">Amount ({baseAsset})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-[#0a0a0b] border border-[#2a2a2e] rounded text-sm text-white font-mono focus:outline-none focus:border-[#00d4ff]/50"
              />
            </div>

            <div className="flex gap-1">
              {orderPercentages.map((pct) => {
                const maxAmount = orderSide === 'BUY' 
                  ? usdtBalance / (parseFloat(price) || currentTicker?.price || 1)
                  : baseBalance;
                const amt = (maxAmount * pct / 100).toFixed(4);
                return (
                  <button
                    key={pct}
                    onClick={() => setAmount(amt)}
                    className="flex-1 py-1 bg-[#1f1f24] rounded text-[10px] text-[#999] hover:text-white hover:bg-[#2a2a2e] transition-colors"
                  >
                    {pct}%
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#2a2a2e] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#666]">Total</span>
                <span className="text-white font-mono">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Available</span>
                <span className="text-white font-mono">${usdtBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Fee (0.1%)</span>
                <span className="text-white font-mono">${(total * 0.001).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className={`w-full py-3 rounded text-sm font-semibold transition-colors ${
                orderSide === 'BUY'
                  ? 'bg-[#00ff88] text-black hover:bg-[#00dd77]'
                  : 'bg-[#ff3366] text-white hover:bg-[#dd2255]'
              }`}
            >
              {orderSide === 'BUY' ? 'Buy' : 'Sell'} {baseAsset}
            </button>
          </div>
        </div>

        {/* Positions */}
        <div className="flex-1 border-t border-[#2a2a2e] overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[#666]">Positions</h3>
              <span className="text-xs text-[#666]">{positions.length}</span>
            </div>
            {positions.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-4">No open positions</p>
            ) : (
              <div className="space-y-2">
                {positions.map((pos) => (
                  <div key={pos.id} className="p-2 bg-[#0a0a0b] rounded border border-[#2a2a2e]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-white">{pos.symbol.replace('USDT', '')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        pos.side === 'LONG' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#ff3366]/10 text-[#ff3366]'
                      }`}>
                        {pos.side}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#666]">Entry</span>
                      <span className="text-white font-mono">${formatPrice(pos.entryPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#666]">Size</span>
                      <span className="text-white font-mono">{pos.quantity}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#666]">PnL</span>
                      <span className={`font-mono ${pos.unrealizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                        {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} ({pos.unrealizedPnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (pos.side === 'LONG') {
                          executeSell(pos.symbol, pos.quantity, currentTicker?.price || pos.currentPrice);
                        } else {
                          coverShort(pos.symbol, pos.quantity, currentTicker?.price || pos.currentPrice);
                        }
                      }}
                      className="w-full mt-2 py-1.5 bg-[#ff3366] text-white text-xs font-medium rounded hover:bg-[#dd2255] transition-colors"
                    >
                      Close Position
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market List Sidebar */}
      <div className="w-48 border-l border-[#2a2a2e] flex flex-col">
        <div className="p-3 border-b border-[#2a2a2e]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full px-3 py-1.5 bg-[#0a0a0b] border border-[#2a2a2e] rounded text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#00d4ff]/50"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredSymbols.map((symbol) => {
            const ticker = tickers.get(symbol.symbol);
            const pos = positions.find(p => p.symbol === symbol.symbol);
            return (
              <button
                key={symbol.symbol}
                onClick={() => setSelectedSymbol(symbol.symbol)}
                className={`w-full flex items-center justify-between p-3 border-b border-[#2a2a2e] text-xs transition-colors ${
                  selectedSymbol === symbol.symbol
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-[#999]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-white">{symbol.baseAsset}</p>
                    {pos && (
                      <span className={`w-1.5 h-1.5 rounded-full ${pos.side === 'LONG' ? 'bg-[#00ff88]' : 'bg-[#ff3366]'}`} />
                    )}
                  </div>
                  <p className="text-[10px] text-[#666] font-mono">{formatVolume(ticker?.quoteVolume24h || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white">{formatPrice(ticker?.price || 0)}</p>
                  <p className={`text-[10px] font-mono ${(ticker?.changePercent24h || 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {(ticker?.changePercent24h || 0) >= 0 ? '+' : ''}{(ticker?.changePercent24h || 0).toFixed(1)}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
