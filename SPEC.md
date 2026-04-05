# MirrorTrade - Hyperliquid Copy Trading SaaS

## Concept & Vision

A clean, professional copy-trading platform inspired by Hyperliquid's minimal dark interface. The design prioritizes data clarity and usability with a focus on trading terminal aesthetics.

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

### Typography
- **Font**: Inter (400, 500, 600, 700)
- **Numbers**: System monospace for tabular data

### Visual Style
- Minimal, clean dark interface
- Subtle borders instead of glass effects
- Compact spacing for data density
- Simple hover states
- No excessive animations

## Pages (10 pages)

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Overview with stats, positions, recent trades |
| Copy Trade | `/trades` | Browse and follow traders |
| Trade | `/trade` | Trading interface with charts |
| Positions | `/positions` | Open positions table |
| Orders | `/orders` | Order management |
| History | `/history` | Transaction history |
| Analytics | `/analytics` | Performance charts |
| Calculator | `/calculator` | Position sizing |
| Settings | `/settings` | User preferences |

## Features

### Completed
- [x] 10 pages with Hyperliquid-inspired UI
- [x] Binance real-time data integration
- [x] TradingView-style candlestick charts
- [x] Order book visualization
- [x] MetaMask wallet connection
- [x] Position sizing calculator
- [x] Copy trading trader selection
- [x] Dark theme throughout

### Pending
- [ ] Real Hyperliquid order execution
- [ ] Copy trading auto-execution

## Technical Stack

```
Vite + React 18 + TypeScript
├── Tailwind CSS
├── Zustand (state)
├── React Query
├── Framer Motion
├── React Router
├── lightweight-charts
└── Lucide React
```

## Running the Project

```bash
cd mirror-trade
npm install
npm run dev
```
