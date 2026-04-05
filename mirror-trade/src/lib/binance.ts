const BINANCE_API = 'https://api.binance.com/api/v3';
const BINANCE_WS = 'wss://stream.binance.com:9443/ws';

export interface Ticker {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface Trade {
  id: number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

export interface Symbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

class BinanceService {
  private wsConnections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;

  async getTickers(): Promise<Ticker[]> {
    try {
      const response = await fetch(`${BINANCE_API}/ticker/24hr`);
      const data = await response.json();
      
      return data
        .filter((t: any) => t.symbol.endsWith('USDT') && t.status === 'TRADING')
        .map((t: any) => ({
          symbol: t.symbol,
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChange),
          changePercent24h: parseFloat(t.priceChangePercent),
          high24h: parseFloat(t.highPrice),
          low24h: parseFloat(t.lowPrice),
          volume24h: parseFloat(t.volume),
          quoteVolume24h: parseFloat(t.quoteVolume),
        }))
        .sort((a: Ticker, b: Ticker) => b.quoteVolume24h - a.quoteVolume24h);
    } catch (error) {
      console.error('Failed to fetch tickers:', error);
      return this.getMockTickers();
    }
  }

  async getKlines(symbol: string, interval: string = '1h', limit: number = 500): Promise<Candle[]> {
    try {
      const response = await fetch(
        `${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      const data = await response.json();
      
      return data.map((k: any[]) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
    } catch (error) {
      console.error('Failed to fetch klines:', error);
      return this.getMockCandles();
    }
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBook> {
    try {
      const response = await fetch(
        `${BINANCE_API}/depth?symbol=${symbol}&limit=${limit}`
      );
      const data = await response.json();
      
      return {
        lastUpdateId: data.lastUpdateId,
        bids: data.bids.map((b: string[]) => ({
          price: parseFloat(b[0]),
          quantity: parseFloat(b[1]),
        })),
        asks: data.asks.map((a: string[]) => ({
          price: parseFloat(a[0]),
          quantity: parseFloat(a[1]),
        })),
      };
    } catch (error) {
      console.error('Failed to fetch order book:', error);
      return this.getMockOrderBook();
    }
  }

  async getRecentTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
    try {
      const response = await fetch(
        `${BINANCE_API}/trades?symbol=${symbol}&limit=${limit}`
      );
      const data = await response.json();
      
      return data.map((t: any) => ({
        id: t.id,
        price: parseFloat(t.price),
        quantity: parseFloat(t.qty),
        time: t.time,
        isBuyerMaker: t.isBuyerMaker,
      }));
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      return [];
    }
  }

  async getSymbols(): Promise<Symbol[]> {
    try {
      const response = await fetch(`${BINANCE_API}/exchangeInfo`);
      const data = await response.json();
      
      return data.symbols
        .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
        .map((s: any) => ({
          symbol: s.symbol,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset,
          status: s.status,
        }));
    } catch (error) {
      console.error('Failed to fetch symbols:', error);
      return this.getPopularSymbols();
    }
  }

  subscribeToKlines(
    symbol: string,
    interval: string,
    callback: (candle: Candle) => void
  ): () => void {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const ws = new WebSocket(`${BINANCE_WS}/${streamName}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.k) {
        callback({
          time: Math.floor(data.k.t / 1000),
          open: parseFloat(data.k.o),
          high: parseFloat(data.k.h),
          low: parseFloat(data.k.l),
          close: parseFloat(data.k.c),
          volume: parseFloat(data.k.v),
        });
      }
    };

    ws.onerror = () => {
      this.handleReconnect(symbol, interval, callback);
    };

    this.wsConnections.set(streamName, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(streamName);
    };
  }

  subscribeToTicker(
    symbol: string,
    callback: (ticker: Ticker) => void
  ): () => void {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(`${BINANCE_WS}/${streamName}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s) {
        callback({
          symbol: data.s,
          price: parseFloat(data.c),
          change24h: parseFloat(data.p),
          changePercent24h: parseFloat(data.P),
          high24h: parseFloat(data.h),
          low24h: parseFloat(data.l),
          volume24h: parseFloat(data.v),
          quoteVolume24h: parseFloat(data.q),
        });
      }
    };

    this.wsConnections.set(streamName, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(streamName);
    };
  }

  subscribeToOrderBook(
    symbol: string,
    callback: (orderBook: OrderBook) => void
  ): () => void {
    const streamName = `${symbol.toLowerCase()}@depth20@100ms`;
    const ws = new WebSocket(`${BINANCE_WS}/${streamName}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback({
        lastUpdateId: data.u,
        bids: data.bids.map((b: string[]) => ({
          price: parseFloat(b[0]),
          quantity: parseFloat(b[1]),
        })),
        asks: data.asks.map((a: string[]) => ({
          price: parseFloat(a[0]),
          quantity: parseFloat(a[1]),
        })),
      });
    };

    this.wsConnections.set(streamName, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(streamName);
    };
  }

  private handleReconnect(
    symbol: string,
    interval: string,
    callback: (candle: Candle) => void
  ) {
    const key = `${symbol}_${interval}`;
    const attempts = this.reconnectAttempts.get(key) || 0;

    if (attempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts.set(key, attempts + 1);
        this.subscribeToKlines(symbol, interval, callback);
      }, 1000 * Math.pow(2, attempts));
    }
  }

  disconnectAll() {
    this.wsConnections.forEach((ws) => ws.close());
    this.wsConnections.clear();
  }

  private getMockTickers(): Ticker[] {
    const pairs = [
      { symbol: 'BTCUSDT', price: 97542.50, change: 1523.45, volume: 28456 },
      { symbol: 'ETHUSDT', price: 3456.78, change: -45.23, volume: 156789 },
      { symbol: 'BNBUSDT', price: 612.34, change: 12.45, volume: 2345678 },
      { symbol: 'SOLUSDT', price: 178.90, change: 5.67, volume: 3456789 },
      { symbol: 'XRPUSDT', price: 2.34, change: -0.12, volume: 4567890 },
      { symbol: 'ADAUSDT', price: 0.89, change: 0.03, volume: 5678901 },
      { symbol: 'DOGEUSDT', price: 0.1234, change: 0.0056, volume: 6789012 },
      { symbol: 'AVAXUSDT', price: 35.67, change: 1.23, volume: 7890123 },
      { symbol: 'DOTUSDT', price: 7.89, change: -0.34, volume: 8901234 },
      { symbol: 'LINKUSDT', price: 14.56, change: 0.78, volume: 9012345 },
    ];

    return pairs.map((p) => ({
      ...p,
      changePercent24h: (p.change / p.price) * 100,
      high24h: p.price * 1.02,
      low24h: p.price * 0.98,
      volume24h: p.volume,
      quoteVolume24h: p.price * p.volume,
    }));
  }

  private getMockCandles(): Candle[] {
    const now = Math.floor(Date.now() / 1000);
    const candles: Candle[] = [];
    let price = 97000;

    for (let i = 500; i > 0; i--) {
      const time = now - i * 3600;
      const change = (Math.random() - 0.5) * 500;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;
      const volume = Math.random() * 1000;

      candles.push({ time, open, high, low, close, volume });
      price = close;
    }

    return candles;
  }

  private getMockOrderBook(): OrderBook {
    const basePrice = 97500;
    const bids = Array.from({ length: 20 }, (_, i) => ({
      price: basePrice - (i + 1) * 0.5,
      quantity: Math.random() * 10,
    }));
    const asks = Array.from({ length: 20 }, (_, i) => ({
      price: basePrice + (i + 1) * 0.5,
      quantity: Math.random() * 10,
    }));

    return { lastUpdateId: Date.now(), bids, asks };
  }

  private getPopularSymbols(): Symbol[] {
    return [
      { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING' },
      { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'TRADING' },
      { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', status: 'TRADING' },
      { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', status: 'TRADING' },
      { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', status: 'TRADING' },
    ];
  }
}

export const binance = new BinanceService();
