import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { hyperliquid } from '@/lib/hyperliquid';
import { useStore } from '@/stores/store';
import type { Trader, Trade, Position } from '@/types';

export function useLeaderboard() {
  const { setTraders } = useStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => hyperliquid.fetchLeaderboard(),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  useEffect(() => {
    if (data) {
      const { traders } = useStore.getState();
      const updatedTraders = data.map((trader: Trader) => {
        const existingTrader = traders.find(t => t.address === trader.address);
        return existingTrader ? { ...trader, isFollowing: existingTrader.isFollowing } : trader;
      });
      setTraders(updatedTraders);
    }
  }, [data, setTraders]);

  return { traders: data || [], isLoading, error, refetch };
}

export function useTraderFills(address: string | null) {
  return useQuery({
    queryKey: ['fills', address],
    queryFn: () => address ? hyperliquid.fetchUserFills(address) : Promise.resolve([]),
    enabled: !!address,
    refetchInterval: 5000,
    staleTime: 2000,
  });
}

export function useAllMids() {
  return useQuery({
    queryKey: ['allMids'],
    queryFn: () => hyperliquid.fetchAllMids(),
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useAssetList() {
  return useQuery({
    queryKey: ['assetList'],
    queryFn: () => hyperliquid.fetchAssetList(),
    staleTime: 60000,
  });
}

export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: () => hyperliquid.fetchMeta(),
    staleTime: 60000,
  });
}

export function useAccountData(address: string | null) {
  return useQuery({
    queryKey: ['accountData', address],
    queryFn: () => address ? hyperliquid.fetchAccountData(address) : Promise.resolve(null),
    enabled: !!address,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useOpenOrders(address: string | null) {
  return useQuery({
    queryKey: ['openOrders', address],
    queryFn: () => address ? hyperliquid.fetchOpenOrders(address) : Promise.resolve([]),
    enabled: !!address,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useTrades() {
  const { trades } = useStore();
  return trades;
}

export function usePositions() {
  const { positions } = useStore();
  return positions;
}

export function useFollowingTraders() {
  const { traders } = useStore();
  return traders.filter(t => t.isFollowing);
}

export function useTradeSimulation() {
  const queryClient = useQueryClient();
  const { traders, traderSettings, userSettings, addTrade, setPositions, positions } = useStore();

  const simulateNewTrade = useCallback(() => {
    const followingTraders = traders.filter(t => t.isFollowing);
    if (followingTraders.length === 0) return null;

    const trader = followingTraders[Math.floor(Math.random() * followingTraders.length)];
    const assets = ['HYPE', 'BTC', 'ETH', 'SOL', 'ARB', 'OP', 'MATIC', 'AVAX'];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const side = Math.random() > 0.5 ? 'Long' : 'Short';
    const price = 10 + Math.random() * 100;

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      traderId: trader.id,
      traderName: trader.name,
      traderAddress: trader.address,
      asset,
      side,
      price,
      size: Math.random() * 10,
      timestamp: Date.now(),
    };

    addTrade(newTrade);

    const settings = traderSettings[trader.id] || userSettings;
    const walletBalance = 10000;
    const tradeSize = settings.positionSizeMode === 'fixed' 
      ? settings.fixedAmount 
      : walletBalance * (settings.proportionalPercent / 100);

    const positionValue = tradeSize;
    const positionSize = positionValue / price;

    const stopLossPercent = settings.defaultStopLoss / 100;
    const takeProfitPercent = settings.defaultTakeProfit / 100;

    const stopLoss = side === 'Long' 
      ? price * (1 - stopLossPercent)
      : price * (1 + stopLossPercent);
    
    const takeProfit = side === 'Long' 
      ? price * (1 + takeProfitPercent)
      : price * (1 - takeProfitPercent);

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      traderId: trader.id,
      traderName: trader.name,
      asset,
      side,
      entryPrice: price,
      currentPrice: price,
      size: positionSize,
      unrealizedPnl: 0,
      pnlPercent: 0,
      stopLoss,
      takeProfit,
      openedAt: Date.now(),
    };

    setPositions([...positions, newPosition]);

    return { trade: newTrade, position: newPosition };
  }, [traders, traderSettings, userSettings, addTrade, setPositions, positions]);

  return { simulateNewTrade };
}

export function useFillSubscription(address: string | null) {
  const { addTrade } = useStore();

  useEffect(() => {
    if (!address) return;

    const unsubscribe = hyperliquid.subscribeToFills(address, (fill) => {
      const newTrade: Trade = {
        id: `trade-${fill.hash}`,
        traderId: '0',
        traderName: formatAddress(address),
        traderAddress: address,
        asset: fill.asset,
        side: fill.side === 'L' ? 'Long' : 'Short',
        price: parseFloat(fill.price),
        size: parseFloat(fill.sz),
        timestamp: fill.timestamp,
        fee: parseFloat(fill.fee),
      };

      addTrade(newTrade);
    });

    return () => {
      unsubscribe();
    };
  }, [address, addTrade]);
}

function formatAddress(address: string): string {
  if (!address) return 'Unknown';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
