import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { wsService } from './services/websocket.js';
import { fetchLeaderboard, fetchUserFills, fetchAllMids } from './services/hyperliquid.js';
import { getCachedLeaderboard, cacheLeaderboard, getCachedTradeFills, cacheTradeFills } from './services/redis.js';
import { createExecutionPlan, calculatePnL } from './services/trading.js';
import type { UserSettings, CopyTradeSignal } from './types/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/traders', async (req, res) => {
  try {
    let traders = await getCachedLeaderboard();
    
    if (!traders) {
      traders = await fetchLeaderboard();
      await cacheLeaderboard(traders, 60);
    }
    
    res.json({ success: true, data: traders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/traders/:address/fills', async (req, res) => {
  try {
    const { address } = req.params;
    let fills = await getCachedTradeFills(address);
    
    if (!fills) {
      fills = await fetchUserFills(address);
      await cacheTradeFills(address, fills, 30);
    }
    
    res.json({ success: true, data: fills });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/prices', async (req, res) => {
  try {
    const mids = await fetchAllMids();
    res.json({ success: true, data: mids });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/simulate', (req, res) => {
  try {
    const { signal, settings, walletBalance, currentPrice } = req.body as {
      signal: CopyTradeSignal;
      settings: UserSettings;
      walletBalance: number;
      currentPrice: number;
    };
    
    const plan = createExecutionPlan(signal, settings, walletBalance, currentPrice);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/calculate-pnl', (req, res) => {
  try {
    const { entryPrice, currentPrice, size, side } = req.body;
    const pnl = calculatePnL(entryPrice, currentPrice, size, side);
    res.json({ success: true, data: pnl });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ws/clients', (req, res) => {
  const count = wsService.getConnectedClients();
  res.json({ success: true, data: { count } });
});

app.post('/api/webhook/hyperliquid', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const body = JSON.parse(req.body.toString());
    console.log('Webhook received:', body);
    res.json({ received: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

async function start() {
  try {
    await wsService.initialize(3002);
    await wsService.loadTraders();
    
    app.listen(config.port, () => {
      console.log(`HTTP server running on port ${config.port}`);
      console.log(`WebSocket server running on port 3002`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
