export interface Trader {
  id: string;
  address: string;
  name: string;
  avatar?: string;
  totalPnl: number;
  winRate: number;
  followers: number;
  copyFee: number;
  isFollowing: boolean;
  isActive: boolean;
  lastTradeTime?: number;
}

export interface Trade {
  id: string;
  traderId: string;
  traderName: string;
  traderAddress: string;
  asset: string;
  side: 'Long' | 'Short';
  price: number;
  size: number;
  timestamp: number;
  fee?: number;
}

export interface Position {
  id: string;
  traderId: string;
  traderName: string;
  asset: string;
  side: 'Long' | 'Short';
  entryPrice: number;
  currentPrice: number;
  size: number;
  unrealizedPnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: number;
}

export interface UserSettings {
  slippageTolerance: number;
  positionSizeMode: 'fixed' | 'proportional';
  fixedAmount: number;
  proportionalPercent: number;
  defaultStopLoss: number;
  defaultTakeProfit: number;
  maxPositionSize: number;
}

export interface TraderSettings extends UserSettings {
  traderId: string;
  enabled: boolean;
}

export interface CopyTradeSignal {
  traderId: string;
  traderAddress: string;
  asset: string;
  side: 'Long' | 'Short';
  price: number;
  size: number;
  timestamp: number;
}

export interface HyperliquidFill {
  hash: string;
  timestamp: number;
  user: string;
  asset: string;
  side: string;
  price: number;
  size: number;
  fee: number;
}
