# MirrorTrade Backend

Node.js backend for the MirrorTrade copy trading platform.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

### Traders
- `GET /api/traders` - Get leaderboard
- `GET /api/traders/:address/fills` - Get trader fills

### Prices
- `GET /api/prices` - Get current prices

### Simulation
- `POST /api/simulate` - Simulate trade execution
- `POST /api/calculate-pnl` - Calculate PnL

### WebSocket
- `WS localhost:3002` - Real-time signals

## Environment Variables

See `.env.example`
