# MirrorTrade - Hyperliquid Copy Trading SaaS

## Concept & Vision

A sleek, professional copy-trading platform that bridges elite Hyperliquid traders with retail users. The interface channels the aesthetic of Bloomberg Terminal meets Cyberpunk — data-dense but visually striking with real-time pulse animations that make the trading floor feel alive.

## Current Status

### Completed Features

#### Core Pages (10 pages)
- [x] **Dashboard** - Overview with stats, top traders, recent activity
- [x] **Trades** - Copy trading interface with trader selection
- [x] **TradePage** - Full trading interface with charts, order book, quick trade
- [x] **Positions** - Open positions with PnL tracking
- [x] **Orders** - Open orders and order history
- [x] **History** - Transaction history with filtering and stats
- [x] **Analytics** - Performance charts and statistics
- [x] **Calculator** - Position sizing calculator with risk management
- [x] **Settings** - User preferences and configuration

#### Technical Features
- [x] **Binance API Integration** - Real-time price data, klines, orderbook, trades
- [x] **TradingView-style Charts** - Candlestick charts with lightweight-charts library
- [x] **Technical Indicators** - MA, EMA, Bollinger Bands, RSI
- [x] **State Management** - Zustand with localStorage persistence
- [x] **Theme Toggle** - Dark/Light mode support
- [x] **Mock Data Generation** - For traders, trades, positions

#### Components
- Layout with collapsible sidebar
- Header with search, theme toggle, notifications
- Price ticker bar
- Wallet button
- Notification center
- Glass morphism UI cards
- Theme toggle
- Skeleton loaders

## Technical Stack

### Frontend
```
Vite + React 18 + TypeScript
├── Tailwind CSS (styling)
├── Zustand (state management)
├── React Query (server state)
├── Framer Motion (animations)
├── React Router (navigation)
├── Recharts (dashboard charts)
├── lightweight-charts (TradingView-style)
└── Lucide React (icons)
```

### Backend
```
Node.js + Express
├── REST API (traders, simulation, PnL)
├── WebSocket (real-time updates)
└── Binance Proxy (CORS bypass)
```

## File Structure

```
/mirror-trade
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── PriceTicker.tsx
│   │   ├── WalletButton.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── Charts.tsx
│   │   └── ui/
│   │       ├── ThemeToggle.tsx
│   │       └── ...
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Trades.tsx
│   │   ├── TradePage.tsx
│   │   ├── Positions.tsx
│   │   ├── Orders.tsx
│   │   ├── History.tsx
│   │   ├── Analytics.tsx
│   │   ├── Calculator.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   ├── binance.ts
│   │   └── hyperliquid.ts
│   ├── stores/
│   │   ├── store.ts
│   │   └── themeStore.ts
│   ├── hooks/
│   │   └── ...
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
└── package.json

/backend
├── server.js
└── package.json
```

## Next Steps

### High Priority
1. [ ] Hyperliquid real API integration
2. [ ] Real wallet connection (MetaMask/WalletConnect)
3. [ ] Order execution functionality
4. [ ] WebSocket real-time updates

### Medium Priority
1. [ ] More technical indicators (MACD, VWAP, ATR)
2. [ ] Price alerts and notifications
3. [ ] Trade copying simulation
4. [ ] Performance optimizations

### Low Priority
1. [ ] Mobile responsive design improvements
2. [ ] Keyboard shortcuts
3. [ ] Export functionality (CSV, PDF)
4. [ ] Dark/Light mode toggle animations
