# MirrorTrade - Hyperliquid Copy Trading SaaS

A sophisticated copy-trading platform that bridges elite Hyperliquid traders with retail users.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite + React)               │
│                     localhost:3000                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                     Backend (Node.js + Express)             │
│                    localhost:3001 (REST)                     │
│                    localhost:3002 (WebSocket)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │    Redis    │ │ Hyperliquid │
│   :5432     │ │   :6379     │ │    API      │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# WebSocket: ws://localhost:3002
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend
```bash
cd mirror-trade
npm install --ignore-scripts
cp .env.example .env
npm run dev
```

## Project Structure

```
mirror-trade/
├── mirror-trade/          # Frontend (Vite + React + TypeScript)
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── hooks/        # React Hooks
│   │   ├── lib/          # Utilities & API
│   │   ├── stores/       # Zustand State
│   │   └── types/        # TypeScript Types
│   └── Dockerfile
│
├── backend/               # Backend (Node.js + Express)
│   ├── src/
│   │   ├── api/          # REST Endpoints
│   │   ├── config/       # Configuration
│   │   ├── services/     # Business Logic
│   │   │   ├── hyperliquid.ts   # Hyperliquid API
│   │   │   ├── trading.ts       # Trading Engine
│   │   │   ├── websocket.ts      # WebSocket Server
│   │   │   ├── redis.ts         # Redis Cache
│   │   │   └── worker.ts        # Background Worker
│   │   └── types/        # TypeScript Types
│   └── Dockerfile
│
├── docker-compose.yml     # Docker orchestration
└── SPEC.md               # Technical specification
```

## Features

### Phase 1: Data Ingestion
- Real-time monitoring of Top 10 traders
- WebSocket connection for live updates
- Trade capture: asset, side, price, size

### Phase 2: User Management
- Per-trader follow settings
- Slippage tolerance (0.1% - 5%)
- Position sizing (fixed/proportional)
- SL/TP configuration

### Phase 3: Execution Engine
- API key management
- Limit order strategy
- Automatic SL/TP placement
- Slippage protection

### Phase 4: Frontend Dashboard
- Dark terminal UI
- Real-time PnL tracking
- Live trade feed
- Execution log

## API Endpoints

### REST API (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/traders` | Get leaderboard |
| GET | `/api/traders/:address/fills` | Get trader fills |
| GET | `/api/prices` | Get current prices |
| POST | `/api/simulate` | Simulate trade |
| POST | `/api/calculate-pnl` | Calculate PnL |
| GET | `/api/ws/clients` | WebSocket clients |

### WebSocket (Port 3002)

```javascript
// Connect
const ws = new WebSocket('ws://localhost:3002');

// Subscribe to traders
ws.send(JSON.stringify({
  type: 'subscribe',
  payload: { traderIds: ['trader-1', 'trader-2'] }
}));

// Receive signals
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'signal') {
    console.log('New trade signal:', msg.payload);
  }
};
```

## Configuration

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/mirror_trade
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz/info
HYPERLIQUID_WS_URL=wss://api.hyperliquid.xyz/ws
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
```

## Copy Trading Logic

### Position Size
```javascript
// Fixed mode
size = min(fixedAmount, maxPositionSize)

// Proportional mode  
size = min(walletBalance * percent / 100, maxPositionSize)
```

### Slippage Protection
```javascript
slippage = abs((currentPrice - entryPrice) / entryPrice) * 100
if (slippage > maxTolerance) skipOrder()
```

## Tech Stack

- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS, Zustand, TanStack Query
- **Backend**: Node.js, Express, TypeScript, WebSocket, Redis
- **Database**: PostgreSQL (optional)
- **Cache**: Redis
- **Docker**: nginx, alpine images

## Development

```bash
# Run backend
cd backend && npm run dev

# Run frontend
cd mirror-trade && npm run dev

# Run with Docker
docker-compose up -d
```

## Production Build

```bash
# Frontend
cd mirror-trade && npm run build

# Backend
cd backend && npm run build && npm start
```

## Security Notes

1. Only use signing keys with trading permissions
2. Set appropriate slippage tolerance
3. Configure max position sizes
4. Always set stop losses

---

Built for educational purposes. Use at your own risk.
