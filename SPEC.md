# MirrorTrade - Hyperliquid Copy Trading SaaS

## Concept & Vision

A sleek, professional copy-trading platform that bridges elite Hyperliquid traders with retail users. The interface channels the aesthetic of Bloomberg Terminal meets Cyberpunk — data-dense but visually striking with real-time pulse animations that make the trading floor feel alive. Users should feel like they're plugged into the financial matrix.

## Design Language

### Aesthetic Direction
Dark terminal aesthetic with cyan/magenta accents — inspired by trading terminals and sci-fi interfaces. High contrast data visualization with glowing elements.

### Color Palette
- **Background**: `#030712` (deep void)
- **Surface**: `rgba(255,255,255,0.03)` (glass cards)
- **Border**: `rgba(255,255,255,0.08)` (subtle dividers)
- **Primary**: `#818cf8` (indigo - actions, links)
- **Secondary**: `#c084fc` (purple - special elements)
- **Success**: `#10b981` (profit, long positions)
- **Danger**: `#f43f5e` (loss, short positions, warnings)
- **Accent**: `#f472b6` (pink - special elements)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#9ca3af`
- **Text Muted**: `#6b7280`

### Typography
- **Headings**: Inter (clean, modern)
- **Body**: Inter (clean readability for data)
- **Numbers/Data**: JetBrains Mono (aligned, precise) - fallback to monospace

### Motion Philosophy
- Real-time data pulses with subtle glow animations
- Trade executions trigger ripple effects on cards
- Numbers animate when changing (count up/down)
- Smooth spring animations for UI interactions
- Staggered animations for lists and grids

### Visual Assets
- Lucide icons throughout
- Glassmorphism UI with backdrop blur
- Gradient text effects on headings
- Hover lift animations on cards
- Scrollbar styling

## Layout & Structure

### Pages Implemented (10 pages)
1. **Dashboard** - Overview with stats, top traders, recent activity
2. **Trades** - Copy trading interface with trader selection
3. **Trade** - Full trading interface with charts, order book, quick trade
4. **Positions** - Open positions with PnL tracking
5. **Orders** - Open orders and order history
6. **History** - Trade history and PnL records
7. **Analytics** - Performance charts and statistics
8. **Calculator** - Position sizing calculator with risk management
9. **Settings** - User preferences and configuration

### Sidebar Navigation
- Collapsible sidebar (64px collapsed, 256px expanded)
- Glass morphism background
- Active nav indicator with gradient
- Mobile responsive with overlay menu

## Features & Interactions

### Phase 1: Data Ingestion ✅
- [x] Fetch trader data with mock data generation
- [x] Display trader stats (PnL, win rate, followers)
- [x] Follow/unfollow trader functionality
- [x] Trade history display

### Phase 2: User Management ✅
- [x] Wallet connection simulation
- [x] User settings persistence (Zustand + localStorage)
- [x] Per-trader follow with individual settings
- [x] Risk parameters: SL%, TP%, position size mode

### Phase 3: Trading Interface ✅
- [x] Binance API integration for real-time data
- [x] TradingView-style charts (lightweight-charts)
- [x] Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- [x] Order book visualization
- [x] Recent trades feed
- [x] Quick trade panel

### Phase 4: Analytics & Tools ✅
- [x] Position sizing calculator
- [x] Risk/reward analysis
- [x] PnL tracking
- [x] Performance charts

## Component Inventory

### Layout Components
- **Layout.tsx** - Main layout with sidebar, header, ticker
- **Sidebar** - Collapsible navigation
- **Header** - Search, quick actions, wallet, theme toggle
- **PriceTicker** - Bottom ticker bar with live prices

### UI Components
- **Glass** - Glassmorphism card component
- **ThemeToggle** - Dark/Light mode switcher
- **Skeleton** - Loading placeholder
- **Badge** - Status badges
- **Button** - Styled buttons with variants

### Feature Components
- **WalletButton** - Connect/disconnect wallet
- **NotificationCenter** - Notifications panel
- **PriceTicker** - Scrolling price ticker
- **TraderCard** - Trader display card
- **TradeRow** - Individual trade display
- **PositionCard** - Position display card

## Technical Approach

### Frontend Stack
```
Vite + React 18 + TypeScript
├── Tailwind CSS (styling)
├── Zustand (state management)
├── React Query (server state)
├── Framer Motion (animations)
├── React Router (navigation)
├── Recharts (charts)
├── lightweight-charts (TradingView-style)
└── Lucide React (icons)
```

### Backend Stack
```
Node.js + Express
├── REST API (traders, simulation, PnL)
├── WebSocket (real-time updates)
└── Binance Proxy (CORS bypass)
```

### File Structure
```
/mirror-trade
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── PriceTicker.tsx
│   │   ├── WalletButton.tsx
│   │   ├── NotificationCenter.tsx
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
│   │   ├── binance.ts (Binance API client)
│   │   └── hyperliquid.ts (Hyperliquid utilities)
│   ├── stores/
│   │   ├── store.ts (Zustand store)
│   │   └── themeStore.ts (Theme state)
│   ├── types/
│   │   └── index.ts (TypeScript types)
│   ├── hooks/
│   │   └── useStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts

/backend
├── server.js (Express server)
├── package.json
└── ...
```

### State Management
- Zustand for global state with persistence
- React Query for API data fetching with caching
- localStorage for theme and settings persistence

### API Integration
- **Binance Public API** (no auth required):
  - `/api/v3/ticker/24hr` - 24h ticker stats
  - `/api/v3/klines` - Candlestick data
  - `/api/v3/depth` - Order book
  - `/api/v3/trades` - Recent trades
  - `/api/v3/exchangeInfo` - Trading pairs
  - WebSocket streams for real-time updates

### Backend API Endpoints
```
GET  /health - Health check
GET  /api/traders - List all traders
GET  /api/prices - Current prices
POST /api/simulate - Simulate trade execution
POST /api/calculate-pnl - Calculate PnL
GET  /api/binance/* - Binance proxy endpoints
```

## Implementation Phases

### Phase 1: Core UI & Data Display ✅
- [x] Build dashboard layout
- [x] Implement trader list with mock data
- [x] Add wallet connection
- [x] Create trade history display

### Phase 2: Hyperliquid Integration
- [ ] Connect to real Hyperliquid API
- [ ] Fetch leaderboard data
- [ ] Poll for user fills
- [ ] Display real trades

### Phase 3: Copy Trading Logic ✅
- [x] Follow/unfollow functionality
- [x] Settings management
- [x] Trade signal generation
- [x] Simulated execution (no real trades)

### Phase 4: Trading Interface ✅
- [x] Full trading page with charts
- [x] Order book visualization
- [x] Quick trade panel
- [ ] Real order placement

## Current Status

### Completed
- 10 pages with full UI
- 14+ reusable components
- Binance API integration with real data
- TradingView-style candlestick charts
- Position sizing calculator
- Dark/Light theme support
- Glassmorphism UI design
- Framer Motion animations
- Zustand state management
- Express backend with Binance proxy

### Next Steps
1. Hyperliquid real API integration
2. Wallet connection (real MetaMask/WalletConnect)
3. Order execution
4. WebSocket real-time updates
5. Technical indicators on charts
6. Performance optimizations
