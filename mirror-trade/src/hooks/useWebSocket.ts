import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '@/stores/store';
import { api, wsClient } from '@/lib/api';
import type { Trade, CopyTradeSignal } from '@/types';

export function useWebSocket() {
  const wsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { traders, addTrade, updatePosition, positions, setTraders } = useStore();

  const loadTraders = useCallback(async () => {
    try {
      const data = await api.traders.list();
      if (data && Array.isArray(data)) {
        const tradersWithFollowing = data.map((t: any) => ({
          ...t,
          isFollowing: traders.find(ft => ft.id === t.id)?.isFollowing || false,
        }));
        setTraders(tradersWithFollowing);
      }
    } catch (error) {
      console.log('Using mock data - Backend unavailable');
    }
  }, [traders, setTraders]);

  const handleSignal = useCallback((signal: any) => {
    const trader = traders.find(t => t.id === signal.traderId || t.address === signal.traderAddress);
    
    if (trader?.isFollowing) {
      const newTrade: Trade = {
        id: `trade-${Date.now()}-${Math.random()}`,
        traderId: signal.traderId,
        traderName: signal.traderName || trader.name,
        traderAddress: signal.traderAddress,
        asset: signal.asset,
        side: signal.side,
        price: signal.price,
        size: signal.size,
        timestamp: signal.timestamp,
      };
      addTrade(newTrade);
    }
  }, [traders, addTrade]);

  useEffect(() => {
    loadTraders();
    
    wsClient.connect();
    wsClient.on('connected', () => setIsConnected(true));
    wsClient.on('signal', handleSignal);

    const followingTraders = traders.filter(t => t.isFollowing);
    if (followingTraders.length > 0) {
      wsClient.subscribe(followingTraders.map(t => t.id));
    }

    wsRef.current = setInterval(loadTraders, 30000);

    return () => {
      wsClient.off('signal', handleSignal);
      if (wsRef.current) clearInterval(wsRef.current);
    };
  }, [loadTraders, handleSignal]);

  useEffect(() => {
    const followingTraders = traders.filter(t => t.isFollowing);
    if (followingTraders.length > 0) {
      wsClient.subscribe(followingTraders.map(t => t.id));
    }
  }, [traders]);

  return { isConnected };
}
