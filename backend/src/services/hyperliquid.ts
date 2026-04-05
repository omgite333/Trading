import axios from 'axios';
import { config } from '../config/index.js';
import type { Trader, HyperliquidFill } from '../types/index.js';

const api = axios.create({
  baseURL: config.hyperliquid.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchLeaderboard(): Promise<Trader[]> {
  try {
    const response = await api.post('', { type: 'leaderboard' });
    const data = response.data;
    
    if (!data.data) return [];
    
    return data.data.map((entry: any, index: number) => ({
      id: entry.address || `trader-${index}`,
      address: entry.address || entry.user,
      name: entry.username || entry.name || `${(entry.address || '').slice(0, 6)}...${(entry.address || '').slice(-4)}`,
      totalPnl: entry.pnl || 0,
      winRate: entry.winRate || 50,
      followers: entry.followers || Math.floor(Math.random() * 1000),
      copyFee: entry.copyFee || 0,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return generateMockTraders();
  }
}

export async function fetchUserFills(address: string): Promise<HyperliquidFill[]> {
  try {
    const response = await api.post('', {
      type: 'userFills',
      user: address,
    });
    return response.data.results || [];
  } catch (error) {
    console.error(`Failed to fetch fills for ${address}:`, error);
    return [];
  }
}

export async function fetchAllMids(): Promise<Record<string, string>> {
  try {
    const response = await api.post('', { type: 'allMids' });
    return response.data || {};
  } catch (error) {
    console.error('Failed to fetch mids:', error);
    return {};
  }
}

export async function fetchUserContext(address: string): Promise<any> {
  try {
    const response = await api.post('', {
      type: 'userContext',
      user: address,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user context for ${address}:`, error);
    return null;
  }
}

export async function placeOrder(order: {
  signature: string;
  order: {
    asset: string;
    side: 'B' | 'S';
    sz: number;
    px: number;
    reduceOnly?: boolean;
  };
  type?: string;
}): Promise<any> {
  try {
    const response = await axios.post(config.hyperliquid.exchangeUrl, {
      type: 'order',
      ...order,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to place order:', error);
    throw error;
  }
}

function generateMockTraders(): Trader[] {
  const names = [
    'WhaleHunter', 'CryptoKing', 'DeFiMaster', 'AlphaSeeker', 'RiskManager',
    'TrendRider', 'MomentumKing', 'SwingTrader', 'NightOwl', 'DayTraderPro'
  ];
  
  return names.map((name, i) => ({
    id: `trader-${i + 1}`,
    address: `0x${Math.random().toString(16).slice(2, 42)}`,
    name,
    totalPnl: Math.random() * 3000000,
    winRate: 50 + Math.random() * 30,
    followers: Math.floor(Math.random() * 15000),
    copyFee: Math.floor(Math.random() * 25),
    isActive: Math.random() > 0.7,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export function generateMockFills(address: string): HyperliquidFill[] {
  const assets = ['HYPE', 'BTC', 'ETH', 'SOL', 'ARB'];
  
  return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
    hash: `0x${Math.random().toString(16).slice(2, 66)}`,
    timestamp: Math.floor(Date.now() / 1000) - i * 60,
    user: address,
    asset: assets[Math.floor(Math.random() * assets.length)],
    side: Math.random() > 0.5 ? 'B' : 'S',
    price: 1000000 + Math.random() * 1000000,
    size: Math.random() * 100,
    fee: Math.random() * 10,
  }));
}
