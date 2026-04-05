export interface Trader {
  id: string;
  address: string;
  name: string;
  totalPnl: number;
  winRate: number;
  followers: number;
  copyFee: number;
  isActive: boolean;
  lastTradeTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  walletAddress: string;
  apiKey?: string;
  signingKey?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface TraderSubscription {
  id: string;
  userId: string;
  traderId: string;
  enabled: boolean;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  userId: string;
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
  orderId?: string;
  status: 'open' | 'closed' | 'liquidated';
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  traderId: string;
  traderAddress: string;
  asset: string;
  side: 'Long' | 'Short';
  price: number;
  size: number;
  timestamp: number;
  fee?: number;
  hash?: string;
}

export interface CopyTradeSignal {
  traderId: string;
  traderAddress: string;
  traderName: string;
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

export interface HyperliquidOrder {
  asset: string;
  side: 'B' | 'S';
  sz: number;
  px: number;
  oid?: number;
  orderType?: { type: 'Limit' } | { type: 'Market' } | { type: 'Trigger', triggerPx: number, isMarket: boolean };
  reduceOnly?: boolean;
  time?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'trade' | 'position' | 'signal';
  payload: any;
}
