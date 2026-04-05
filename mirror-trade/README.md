# MirrorTrade - Hyperliquid Copy Trading Platform

A sophisticated copy-trading SaaS that bridges elite Hyperliquid traders with retail users. Built with Vite + React + TypeScript + Tailwind CSS.

## Features

### Phase 1: Data Ingestion (The "Watcher")
- Real-time monitoring of Top 10 traders from Hyperliquid
- WebSocket connection for live trade updates
- Polling fallback with 1-2 second intervals
- Trade capture: asset, side (Long/Short), price, size, timestamp

### Phase 2: User Management & Risk Engine
- Per-trader follow/unfollow with individual settings
- Configurable Stop Loss (SL) and Take Profit (TP) percentages
- Position sizing modes:
  - **Fixed Amount**: Trade a set USD amount per signal
  - **Proportional**: Mirror the whale's position size percentage
- Slippage tolerance protection (0.1% - 5%)
- Max position size limits

### Phase 3: Execution Engine (The "Actuator")
- API key management with secure storage
- Limit order strategy (not market orders) to protect against slippage
- Automatic SL/TP order placement after entry
- Real-time position tracking with PnL calculations

### Phase 4: Frontend Dashboard
- Dark terminal aesthetic with cyan/magenta accents
- Real-time PnL calculations and statistics
- Live trade feed with auto-scroll
- Execution log for debugging
- Responsive design for mobile/desktop

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Real-time**: WebSocket (Hyperliquid API)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or copy the project to a native Windows directory
cd C:\your-path\mirror-trade

# Install dependencies
npm install --ignore-scripts

# Start development server
npm run dev
```

> **Note**: Due to WSL/Windows path issues, avoid running npm from WSL paths. Use a native Windows terminal (PowerShell/CMD) instead.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
mirror-trade/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TraderCard.tsx
│   │   ├── TradeHistory.tsx
│   │   ├── Portfolio.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── ApiKeyModal.tsx
│   │   ├── WalletButton.tsx
│   │   ├── ExecutionLog.tsx
│   │   └── StatsComponents.tsx
│   ├── hooks/
│   │   ├── useTraders.ts
│   │   ├── useWallet.ts
│   │   ├── useWalletConnect.ts
│   │   ├── useWebSocket.ts
│   │   └── useHyperliquid.ts
│   ├── lib/
│   │   ├── hyperliquid.ts
│   │   └── trading.ts
│   ├── stores/
│   │   └── store.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── favicon.svg
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## API Integration

The app connects to Hyperliquid's Info API:
- **REST**: `https://api.hyperliquid.xyz/info`
- **WebSocket**: `wss://api.hyperliquid.xyz/ws`

### Endpoints Used
- `POST { type: "leaderboard" }` - Top traders
- `POST { type: "userFills" }` - Trade history
- `POST { type: "allMids" }` - Current prices
- WebSocket subscriptions for real-time updates

## Copy Trading Logic

### Position Size Calculation
```typescript
// Fixed mode
size = min(fixedAmount, maxPositionSize)

// Proportional mode
size = min(walletBalance * proportionalPercent / 100, maxPositionSize)
```

### Slippage Protection
```typescript
// Orders are skipped if price moved beyond tolerance
slippage = abs((currentPrice - entryPrice) / entryPrice) * 100
if (slippage > maxSlippageTolerance) skip order
```

### SL/TP Calculation
```typescript
// For Long positions
stopLoss = entryPrice * (1 - slPercent / 100)
takeProfit = entryPrice * (1 + tpPercent / 100)

// For Short positions (inverse)
stopLoss = entryPrice * (1 + slPercent / 100)
takeProfit = entryPrice * (1 - tpPercent / 100)
```

## Demo Mode

The app includes a demo mode with:
- Mock trader data
- Simulated whale trades (click "Simulate Whale Trade")
- Random trade generation for testing UI

## Security Considerations

1. **API Keys**: Only create signing keys with trading permissions, never withdrawal access
2. **Slippage**: Always set appropriate slippage tolerance to protect against front-running
3. **Position Limits**: Set max position sizes to limit exposure
4. **SL/TP**: Always configure stop losses to prevent unlimited losses

## Future Enhancements

- [ ] Real wallet connection (WalletConnect integration)
- [ ] PostgreSQL backend for user data persistence
- [ ] Redis for real-time trade signal caching
- [ ] Backend execution engine (Python/FastAPI)
- [ ] Multi-wallet support
- [ ] Trade history analytics
- [ ] Performance notifications

## License

MIT

---

Built for educational purposes. Use at your own risk. Not financial advice.
