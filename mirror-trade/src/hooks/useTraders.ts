import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/stores/store';
import { fetchLeaderboard, fetchUserFills } from '@/lib/hyperliquid';
import type { Trade } from '@/types';

export function useTraders() {
  const { traders, setTraders, addTrade, initMockData, trades } = useStore();
  const pollIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    initMockData();
  }, [initMockData]);
  
  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await fetchLeaderboard();
        if (data.length > 0) {
          setTraders(data);
        }
      } catch (error) {
        console.log('Using mock data - API unavailable');
      }
    }
    
    loadLeaderboard();
  }, [setTraders]);
  
  const startPolling = useCallback(async () => {
    const followingTraders = traders.filter(t => t.isFollowing);
    
    for (const trader of followingTraders) {
      try {
        const fills = await fetchUserFills(trader.address);
        
        fills.slice(0, 5).forEach((fill) => {
          const newTrade: Trade = {
            id: fill.hash,
            traderId: trader.id,
            traderName: trader.name,
            traderAddress: fill.user,
            asset: fill.asset,
            side: fill.side === 'B' ? 'Long' : 'Short',
            price: fill.price,
            size: fill.size,
            timestamp: fill.timestamp * 1000,
            fee: fill.fee,
          };
          
          const exists = trades.some(t => t.id === newTrade.id);
          if (!exists) {
            addTrade(newTrade);
          }
        });
      } catch (error) {
        console.log(`Polling error for ${trader.name}`);
      }
    }
  }, [traders, trades, addTrade]);
  
  useEffect(() => {
    pollIntervalRef.current = window.setInterval(startPolling, 2000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [startPolling]);
  
  return { traders };
}
