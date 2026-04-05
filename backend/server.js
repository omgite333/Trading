const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { WebSocketServer } = require('ws');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));

const PORT = 3001;
const WS_PORT = 3002;
const BINANCE_API = 'https://api.binance.com/api/v3';
const BINANCE_WS = 'wss://stream.binance.com:9443/ws';

const traders = [
  { id: '1', address: '0x1234567890abcdef1234567890abcdef12345678', name: 'WhaleHunter', totalPnl: 2847293.45, winRate: 72.5, followers: 12847, copyFee: 10, isFollowing: false, isActive: false },
  { id: '2', address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'CryptoKing', totalPnl: 1956234.89, winRate: 68.2, followers: 9834, copyFee: 15, isFollowing: false, isActive: false },
  { id: '3', address: '0x9876543210fedcba9876543210fedcba98765432', name: 'DeFiMaster', totalPnl: 1523847.23, winRate: 64.8, followers: 7623, copyFee: 20, isFollowing: false, isActive: true },
  { id: '4', address: '0xfedcba9876543210fedcba9876543210fedcba98', name: 'AlphaSeeker', totalPnl: 1284932.67, winRate: 71.3, followers: 6547, copyFee: 12, isFollowing: false, isActive: false },
  { id: '5', address: '0x5678901234abcdef5678901234abcdef56789012', name: 'RiskManager', totalPnl: 987234.12, winRate: 59.4, followers: 5432, copyFee: 8, isFollowing: false, isActive: false },
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MirrorTrade API
app.get('/api/traders', (req, res) => {
  res.json({ success: true, data: traders });
});

app.get('/api/prices', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      'HYPE': '35.42',
      'BTC': '97542.50',
      'ETH': '3456.78',
      'SOL': '178.90',
      'ARB': '1.23'
    }
  });
});

app.get('/api/ws/clients', (req, res) => {
  res.json({ success: true, data: { count: wss ? wss.clients.size : 0 } });
});

app.post('/api/simulate', (req, res) => {
  const { signal, settings, walletBalance, currentPrice } = req.body;
  res.json({
    success: true,
    data: {
      asset: signal.asset,
      side: signal.side,
      size: walletBalance * (settings.proportionalPercent / 100),
      entryPrice: currentPrice,
      stopLoss: currentPrice * 0.95,
      takeProfit: currentPrice * 1.10,
      shouldExecute: true
    }
  });
});

app.post('/api/calculate-pnl', (req, res) => {
  const { entryPrice, currentPrice, size, side } = req.body;
  let pnl;
  if (side === 'Long') {
    pnl = (currentPrice - entryPrice) * size;
  } else {
    pnl = (entryPrice - currentPrice) * size;
  }
  res.json({ success: true, data: { unrealizedPnl: pnl, pnlPercent: (pnl / (entryPrice * size)) * 100 } });
});

// Binance Proxy API
app.get('/api/binance/tickers', async (req, res) => {
  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr`);
    const data = await response.json();
    
    const tickers = data
      .filter(t => t.symbol.endsWith('USDT') && t.status === 'TRADING')
      .map(t => ({
        symbol: t.symbol,
        price: parseFloat(t.lastPrice),
        change24h: parseFloat(t.priceChange),
        changePercent24h: parseFloat(t.priceChangePercent),
        high24h: parseFloat(t.highPrice),
        low24h: parseFloat(t.lowPrice),
        volume24h: parseFloat(t.volume),
        quoteVolume24h: parseFloat(t.quoteVolume),
      }))
      .sort((a, b) => b.quoteVolume24h - a.quoteVolume24h);
    
    res.json({ success: true, data: tickers });
  } catch (error) {
    console.error('Binance tickers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tickers' });
  }
});

app.get('/api/binance/klines', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', interval = '1h', limit = 500 } = req.query;
    const response = await fetch(`${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const data = await response.json();
    
    const klines = data.map(k => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
    
    res.json({ success: true, data: klines });
  } catch (error) {
    console.error('Binance klines error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch klines' });
  }
});

app.get('/api/binance/orderbook', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', limit = 20 } = req.query;
    const response = await fetch(`${BINANCE_API}/depth?symbol=${symbol}&limit=${limit}`);
    const data = await response.json();
    
    res.json({
      success: true,
      data: {
        lastUpdateId: data.lastUpdateId,
        bids: data.bids.map((b) => ({ price: parseFloat(b[0]), quantity: parseFloat(b[1]) })),
        asks: data.asks.map((a) => ({ price: parseFloat(a[0]), quantity: parseFloat(a[1]) })),
      }
    });
  } catch (error) {
    console.error('Binance orderbook error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order book' });
  }
});

app.get('/api/binance/trades', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', limit = 50 } = req.query;
    const response = await fetch(`${BINANCE_API}/trades?symbol=${symbol}&limit=${limit}`);
    const data = await response.json();
    
    const trades = data.map(t => ({
      id: t.id,
      price: parseFloat(t.price),
      quantity: parseFloat(t.qty),
      time: t.time,
      isBuyerMaker: t.isBuyerMaker,
    }));
    
    res.json({ success: true, data: trades });
  } catch (error) {
    console.error('Binance trades error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trades' });
  }
});

app.get('/api/binance/symbols', async (req, res) => {
  try {
    const response = await fetch(`${BINANCE_API}/exchangeInfo`);
    const data = await response.json();
    
    const symbols = data.symbols
      .filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING')
      .map(s => ({
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        quoteAsset: s.quoteAsset,
        status: s.status,
      }));
    
    res.json({ success: true, data: symbols });
  } catch (error) {
    console.error('Binance symbols error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch symbols' });
  }
});

app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
  console.log(`Binance proxy enabled: /api/binance/*`);
});

let wss = null;
try {
  wss = new WebSocketServer({ port: WS_PORT });
  console.log(`WebSocket server running on port ${WS_PORT}`);
  
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
        }
        if (msg.type === 'subscribe') {
          ws.send(JSON.stringify({ type: 'subscribed', payload: { subscriptions: msg.payload?.traderIds || [] } }));
        }
      } catch (e) {
        console.error('WS message error:', e);
      }
    });
    
    ws.on('close', () => console.log('Client disconnected'));
  });
} catch (e) {
  console.log('WebSocket port may be in use');
}

console.log('\n🚀 MirrorTrade Backend Ready!');
console.log(`   REST API: http://localhost:${PORT}`);
console.log(`   WebSocket: ws://localhost:${WS_PORT}`);
