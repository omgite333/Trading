# MirrorTrade - Hyperliquid Copy Trading SaaS

## Concept & Vision

A sleek, professional copy-trading platform that bridges elite Hyperliquid traders with retail users. The interface channels the aesthetic of Bloomberg Terminal meets Cyberpunk — data-dense but visually striking with real-time pulse animations.

## Completed Features

### Core Pages (10 pages)
- [x] **Dashboard** - Overview with stats, top traders, recent activity
- [x] **Trades** - Copy trading interface with trader selection
- [x] **TradePage** - Full trading interface with charts, order book, quick trade
- [x] **Positions** - Open positions with PnL tracking
- [x] **Orders** - Open orders and order history
- [x] **History** - Transaction history with filtering and stats
- [x] **Analytics** - Performance charts and statistics
- [x] **Calculator** - Position sizing calculator with risk management
- [x] **Settings** - User preferences and configuration

### Technical Features
- [x] **Binance API Integration** - Real-time price data, klines, orderbook, trades
- [x] **TradingView-style Charts** - Candlestick charts with lightweight-charts library
- [x] **Technical Indicators** - MA, EMA, Bollinger Bands, RSI
- [x] **Hyperliquid API Client** - Full API integration with React Query
- [x] **Wallet Connection** - MetaMask integration with chain switching
- [x] **State Management** - Zustand with localStorage persistence
- [x] **Theme Toggle** - Dark/Light mode support
- [x] **Mock Data Generation** - For traders, trades, positions

### Components
- [x] Layout with collapsible sidebar
- [x] Header with search, theme toggle, notifications
- [x] Price ticker bar
- [x] Wallet button with MetaMask integration
- [x] Notification center
- [x] Glass morphism UI cards
- [x] Theme toggle
- [x] Skeleton loaders

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

## API Integration

### Hyperliquid API (`https://api.hyperliquid.xyz/info`)
- `POST { type: "leaderboard" }` - Top traders
- `POST { type: "allMids" }` - Current prices
- `POST { type: "userFills" }` - User trade history
- `POST { type: "assetList" }` - Available assets
- `POST { type: "meta" }` - Trading pair metadata
- `POST { type: "accountSummary" }` - Account data
- `POST { type: "openOrders" }` - User open orders
- WebSocket for real-time fills

### Binance API (`https://api.binance.com/api/v3`)
- `/ticker/24hr` - 24h ticker stats
- `/klines` - Candlestick data
- `/depth` - Order book
- `/trades` - Recent trades
- `/exchangeInfo` - Trading pairs
- WebSocket streams for real-time updates

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
│   │   ├── useHyperliquid.ts
│   │   ├── useWallet.ts
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
- [ ] Order execution functionality (Hyperliquid exchange API)
- [ ] WebSocket real-time updates for fills
- [ ] Copy trading simulation engine

### Medium Priority
- [ ] More technical indicators (MACD, VWAP, ATR)
- [ ] Price alerts and notifications
- [ ] Performance optimizations
- [ ] Trade history export

### Low Priority
- [ ] Mobile responsive design improvements
- [ ] Keyboard shortcuts
- [ ] Dark/Light mode toggle animations
- [ ] Trading signals alerts
