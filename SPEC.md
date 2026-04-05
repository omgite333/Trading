# MirrorTrade - Hyperliquid Copy Trading SaaS

## Concept & Vision

A sleek, professional copy-trading platform that bridges elite Hyperliquid traders with retail users. The interface channels the aesthetic of Bloomberg Terminal meets Cyberpunk — data-dense but visually striking with real-time pulse animations that make the trading floor feel alive. Users should feel like they're plugged into the financial matrix.

## Design Language

### Aesthetic Direction
Dark terminal aesthetic with cyan/magenta accents — inspired by trading terminals and sci-fi interfaces. High contrast data visualization with glowing elements.

### Color Palette
- **Background**: `#0a0a0f` (deep void)
- **Surface**: `#12121a` (elevated cards)
- **Border**: `#1e1e2e` (subtle dividers)
- **Primary**: `#00d4ff` (cyan - actions, links)
- **Success**: `#00ff88` (profit, long positions)
- **Danger**: `#ff3366` (loss, short positions, warnings)
- **Accent**: `#bf5af2` (purple - special elements)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#6b7280`
- **Text Muted**: `#4b5563`

### Typography
- **Headings**: JetBrains Mono (monospace, technical feel)
- **Body**: Inter (clean readability for data)
- **Numbers/Data**: JetBrains Mono (aligned, precise)

### Motion Philosophy
- Real-time data pulses with subtle glow animations
- Trade executions trigger ripple effects on cards
- Numbers animate when changing (count up/down)
- Skeleton loaders with scan-line effect during loading
- Smooth spring animations for UI interactions

### Visual Assets
- Lucide icons with 1.5px stroke
- Animated gradient borders on active cards
- Subtle grid pattern background
- Glowing orbs for status indicators

## Layout & Structure

### Dashboard (Main View)
```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Logo | Wallet Connect | Navigation                      │
├─────────────────────────────────────────────────────────────────┤
│ Stats Bar: Total PnL | Active Copiers | Trades Today | Volume   │
├───────────────────────────────────┬─────────────────────────────┤
│                                   │                             │
│   Top Traders Panel               │   My Portfolio Panel       │
│   - Ranked list of whales         │   - Following list          │
│   - Win rate, PnL, Followers      │   - Active positions       │
│   - Follow/Unfollow toggle        │   - Recent trades           │
│   - Real-time trade indicator     │                             │
│                                   │                             │
├───────────────────────────────────┴─────────────────────────────┤
│ Trade History (Live Feed) - Scrolling real-time fills           │
└─────────────────────────────────────────────────────────────────┘
```

### Settings Modal
- Slippage tolerance slider (0.1% - 5%)
- Position sizing: Fixed amount OR Proportional
- Stop Loss % (default 5%)
- Take Profit % (default 10%)
- Max position size
- Per-trader overrides

## Features & Interactions

### Phase 1: Data Ingestion
- [ ] Fetch Top 10 traders from Hyperliquid Leaderboard API
- [ ] Poll `userFills` endpoint every 1 second for each followed trader
- [ ] Display real-time trade indicators when whales trade
- [ ] Trade capture: asset, side, price, size, timestamp

### Phase 2: User Management
- [ ] Wallet connection (MetaMask, WalletConnect)
- [ ] User settings persistence (localStorage for MVP, PostgreSQL later)
- [ ] Per-trader follow/unfollow with individual settings
- [ ] Risk parameters: SL%, TP%, Slippage tolerance, Position size mode

### Phase 3: Execution Engine
- [ ] Hyperliquid API integration for order placement
- [ ] Limit order strategy (not market orders)
- [ ] Automatic SL/TP order placement after entry
- [ ] Slippage check before execution
- [ ] Order status tracking

### Phase 4: Frontend Dashboard
- [ ] Real-time PnL calculations
- [ ] Trade history with live updates
- [ ] Trader cards with stats
- [ ] Settings modal per trader
- [ ] Connection status indicator

## Component Inventory

### Header
- Logo with glow effect
- Wallet connect button (disconnected: cyan outline, connected: gradient fill)
- Navigation tabs with underline indicator

### StatCard
- Large number with currency/percentage formatting
- Label below
- Subtle gradient background
- Pulse animation when value changes

### TraderCard
- Avatar placeholder (gradient circle with initials)
- Name/address (truncated)
- Win rate badge (green/red based on >50%)
- Total PnL with color coding
- Follower count
- "Follow" toggle button (outlined → filled when following)
- Live trade indicator (pulsing dot when trading)

### TradeRow
- Timestamp
- Trader avatar + name
- Asset badge
- Side indicator (LONG/SHORT with color)
- Price
- Size
- PnL if closed

### SettingsModal
- Overlay with blur backdrop
- Form with labeled inputs
- Slider for percentages
- Radio buttons for position sizing
- Save/Cancel buttons

### PositionCard
- Asset and side
- Entry price vs current price
- Unrealized PnL (color coded)
- Size
- SL/TP indicators
- Time since entry

## Technical Approach

### Frontend (Vite + React)
```
/src
  /components
    /ui (shadcn components)
    Header.tsx
    StatCard.tsx
    TraderCard.tsx
    TradeRow.tsx
    PositionCard.tsx
    SettingsModal.tsx
  /hooks
    useHyperliquid.ts
    useWallet.ts
    useTraders.ts
  /lib
    hyperliquid.ts (API client)
    utils.ts
  /stores
    traderStore.ts
    userStore.ts
  /types
    index.ts
  App.tsx
  main.tsx
```

### State Management
- Zustand for global state
- React Query for API data fetching
- localStorage persistence for user settings

### API Integration
- Hyperliquid Info API: `https://api.hyperliquid.xyz/info`
- Endpoints used:
  - `GET /exchangeInfo` - trading rules
  - `POST { type: "userFills" }` - trade history
  - `POST { type: "allMids" }` - current prices
  - `POST { type: "leaderboard" }` - top traders

### Real-time Updates
- Polling mechanism for MVP (1s interval)
- WebSocket upgrade path for production

## Implementation Phases

### Phase 1: Core UI & Data Display
- Build dashboard layout
- Implement trader list with mock data
- Add wallet connection
- Create trade history display

### Phase 2: Hyperliquid Integration
- Connect to real API
- Fetch leaderboard data
- Poll for user fills
- Display real trades

### Phase 3: Copy Trading Logic
- Follow/unfollow functionality
- Settings management
- Trade signal generation
- Simulated execution (no real trades)

### Phase 4: Execution (Demo Mode)
- Order placement logic
- SL/TP automation
- Slippage protection
- Position tracking
