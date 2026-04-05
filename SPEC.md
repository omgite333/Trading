# MirrorTrade - Hyperliquid Copy Trading SaaS

## Concept & Vision

A clean, professional copy-trading platform inspired by Hyperliquid's minimal dark interface. Features a complete trading engine with wallet management, order placement, and PnL tracking.

## Design Language (Hyperliquid-Inspired)

### Color Palette
- **Background**: `#0a0a0b` (deep black)
- **Surface**: `#131316` (card backgrounds)
- **Border**: `#2a2a2e` (subtle borders)
- **Primary**: `#00d4ff` (cyan - actions, links)
- **Success**: `#00ff88` (profit, long)
- **Danger**: `#ff3366` (loss, short)
- **Text**: `#e5e5e5` (primary text)
- **Muted**: `#666` / `#999` (secondary text)

## Trading Engine

### Features
- [x] **Wallet Management** - Balance tracking for USDT and assets
- [x] **Order Placement** - Limit, Market, Stop orders
- [x] **Position Tracking** - Open positions with real-time PnL
- [x] **PnL Calculation** - Unrealized and realized PnL
- [x] **Trade History** - Complete trade log with fees
- [x] **Order Book** - Real-time order book visualization
- [x] **Close Positions** - Close long/short positions

### State Management
```typescript
interface WalletState {
  balances: Balance[];
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  totalPnl: number;
}
```

### Trading Flow
1. User places buy/sell order
2. Order created with status 'open'
3. Order filled (market) or waiting (limit)
4. Position opened with entry price
5. Position PnL updates in real-time
6. User closes position
7. Realized PnL calculated and added to balance

## Pages (10 pages)

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Overview, wallet, positions, traders |
| Copy Trade | `/trades` | Browse and follow traders |
| Trade | `/trade` | Full trading interface with chart |
| Positions | `/positions` | Open positions table |
| Orders | `/orders` | Order management |
| History | `/history` | Trade history and PnL |
| Analytics | `/analytics` | Performance charts |
| Calculator | `/calculator` | Position sizing |
| Settings | `/settings` | User preferences |

## Technical Stack

```
Vite + React 18 + TypeScript
├── Tailwind CSS
├── Zustand (walletStore.ts, store.ts)
├── React Query
├── Framer Motion
├── React Router
├── lightweight-charts
└── Lucide React
```

## Key Files

```
src/
├── stores/
│   ├── walletStore.ts    # Trading engine state
│   └── themeStore.ts     # Theme management
├── hooks/
│   └── useTrading.ts     # Trading logic hook
├── pages/
│   ├── TradePage.tsx     # Full trading interface
│   ├── Positions.tsx     # Position management
│   ├── Orders.tsx         # Order management
│   └── History.tsx        # Trade history
```

## Running the Project

```bash
cd mirror-trade
npm install
npm run dev
```

## Features

### Trading Engine
- Buy/Sell with Limit, Market, Stop orders
- Position tracking with real-time PnL
- 0.1% trading fee
- Order book visualization
- Close positions with one click

### Wallet
- Starting balance: $10,000 USDT
- Real-time balance updates
- Locked balance for pending orders
- Position PnL visualization

### Charts
- TradingView-style candlestick charts
- Volume bars
- Multiple timeframes
- Real-time updates via Binance API
