import type { Trader, Trade, Position, UserSettings, HyperliquidFill } from '@/types';

const API_BASE = 'https://api.hyperliquid.xyz/info';

export async function fetchLeaderboard(): Promise<Trader[]> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'leaderboard' }),
  });
  
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  
  const data = await response.json();
  return data.data?.map((entry: any, index: number) => ({
    id: `trader-${index}`,
    address: entry.address || entry.user,
    name: entry.username || entry.name || `${entry.address?.slice(0, 6)}...${entry.address?.slice(-4)}`,
    totalPnl: entry.pnl || 0,
    winRate: entry.winRate || 50,
    followers: entry.followers || Math.floor(Math.random() * 1000),
    copyFee: entry.copyFee || 0,
    isFollowing: false,
    isActive: false,
  })) || [];
}

export async function fetchUserFills(address: string): Promise<HyperliquidFill[]> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'userFills',
      user: address,
    }),
  });
  
  if (!response.ok) throw new Error('Failed to fetch user fills');
  
  const data = await response.json();
  return data.results || [];
}

export async function fetchAllMids(): Promise<Record<string, string>> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'allMids' }),
  });
  
  if (!response.ok) throw new Error('Failed to fetch prices');
  
  const data = await response.json();
  return data;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCurrency(num: number, decimals = 2): string {
  const prefix = num >= 0 ? '' : '-';
  return `${prefix}$${formatNumber(Math.abs(num), decimals)}`;
}

export function formatPercent(num: number): string {
  return `${num >= 0 ? '+' : ''}${formatNumber(num, 2)}%`;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
}

export function generateMockTraders(): Trader[] {
  return [
    { id: '1', address: '0x1234567890abcdef1234567890abcdef12345678', name: 'WhaleHunter', totalPnl: 2847293.45, winRate: 72.5, followers: 12847, copyFee: 10, isFollowing: false, isActive: false },
    { id: '2', address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'CryptoKing', totalPnl: 1956234.89, winRate: 68.2, followers: 9834, copyFee: 15, isFollowing: true, isActive: false },
    { id: '3', address: '0x9876543210fedcba9876543210fedcba98765432', name: 'DeFiMaster', totalPnl: 1523847.23, winRate: 64.8, followers: 7623, copyFee: 20, isFollowing: false, isActive: true },
    { id: '4', address: '0xfedcba9876543210fedcba9876543210fedcba98', name: 'AlphaSeeker', totalPnl: 1284932.67, winRate: 71.3, followers: 6547, copyFee: 12, isFollowing: false, isActive: false },
    { id: '5', address: '0x5678901234abcdef5678901234abcdef56789012', name: 'RiskManager', totalPnl: 987234.12, winRate: 59.4, followers: 5432, copyFee: 8, isFollowing: true, isActive: false },
    { id: '6', address: '0xabcdef5678901234abcdef5678901234abcdef56', name: 'TrendRider', totalPnl: 845672.45, winRate: 66.7, followers: 4231, copyFee: 18, isFollowing: false, isActive: false },
    { id: '7', address: '0x1234abcdef5678901234abcdef5678901234abcd', name: 'MomentumKing', totalPnl: 723489.34, winRate: 58.9, followers: 3876, copyFee: 5, isFollowing: false, isActive: false },
    { id: '8', address: '0xdef123456789abcdef123456789abcdef12345678', name: 'SwingTrader', totalPnl: 612345.78, winRate: 62.1, followers: 3124, copyFee: 10, isFollowing: false, isActive: false },
    { id: '9', address: '0x789abcdef0123456789abcdef0123456789abcdef', name: 'NightOwl', totalPnl: 534217.92, winRate: 55.3, followers: 2876, copyFee: 25, isFollowing: false, isActive: false },
    { id: '10', address: '0x0123456789abcdef0123456789abcdef01234567', name: 'DayTraderPro', totalPnl: 478923.56, winRate: 69.8, followers: 2543, copyFee: 15, isFollowing: false, isActive: false },
  ];
}

export function generateMockTrades(): Trade[] {
  const assets = ['HYPE', 'BTC', 'ETH', 'SOL', 'ARB', 'OP', 'MATIC', 'AVAX'];
  const sides: ('Long' | 'Short')[] = ['Long', 'Short'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `trade-${i}`,
    traderId: `trader-${Math.floor(Math.random() * 10) + 1}`,
    traderName: generateMockTraders()[Math.floor(Math.random() * 10)]?.name || 'Unknown',
    traderAddress: '0x' + Math.random().toString(16).slice(2, 42),
    asset: assets[Math.floor(Math.random() * assets.length)],
    side: sides[Math.floor(Math.random() * 2)],
    price: 10 + Math.random() * 100,
    size: Math.floor(Math.random() * 100) + 1,
    timestamp: Date.now() - Math.floor(Math.random() * 3600000),
  }));
}

export function generateMockPositions(): Position[] {
  return [
    { id: '1', traderId: '2', traderName: 'CryptoKing', asset: 'HYPE', side: 'Long', entryPrice: 32.45, currentPrice: 34.12, size: 50, unrealizedPnl: 83.5, pnlPercent: 5.15, stopLoss: 30.5, takeProfit: 38.0, openedAt: Date.now() - 7200000 },
    { id: '2', traderId: '5', traderName: 'RiskManager', asset: 'BTC', side: 'Short', entryPrice: 97500, currentPrice: 96800, size: 0.1, unrealizedPnl: 70, pnlPercent: 7.18, stopLoss: 99000, takeProfit: 94000, openedAt: Date.now() - 3600000 },
    { id: '3', traderId: '2', traderName: 'CryptoKing', asset: 'ETH', side: 'Long', entryPrice: 3450, currentPrice: 3420, size: 2, unrealizedPnl: -60, pnlPercent: -0.87, stopLoss: 3300, takeProfit: 3800, openedAt: Date.now() - 1800000 },
  ];
}

export const defaultUserSettings: UserSettings = {
  slippageTolerance: 0.5,
  positionSizeMode: 'proportional',
  fixedAmount: 100,
  proportionalPercent: 2,
  defaultStopLoss: 5,
  defaultTakeProfit: 10,
  maxPositionSize: 1000,
};
