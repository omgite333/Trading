import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/stores/store';
import { generateCopyTrade, simulateOrderExecution } from '@/lib/trading';
import type { CopyTradeSignal, Position } from '@/types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useHyperliquid() {
  const {
    traders,
    traderSettings,
    userSettings,
    addTrade,
    setPositions,
    positions,
    walletAddress,
  } = useStore();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  
  const logExecution = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);
  
  const simulateTrade = useCallback(async (signal: CopyTradeSignal) => {
    const settings = traderSettings[signal.traderId] || userSettings;
    const walletBalance = 10000;
    
    const order = generateCopyTrade(signal, settings, walletBalance);
    
    if (!order.shouldExecute) {
      logExecution(`⏭️  Skipped ${signal.asset} ${signal.side}: ${order.reason}`);
      return null;
    }
    
    logExecution(`📊 Processing ${signal.asset} ${signal.side} @ $${order.entryPrice.toFixed(4)}...`);
    
    setIsExecuting(true);
    
    try {
      const result = await simulateOrderExecution(order);
      
      if (result.success) {
        const newPosition: Position = {
          id: result.orderId,
          traderId: signal.traderId,
          traderName: signal.traderName,
          asset: signal.asset,
          side: order.side,
          entryPrice: result.fillPrice,
          currentPrice: result.fillPrice,
          size: order.size,
          unrealizedPnl: 0,
          pnlPercent: 0,
          stopLoss: order.stopLoss,
          takeProfit: order.takeProfit,
          openedAt: Date.now(),
        };
        
        setPositions([...positions, newPosition]);
        logExecution(`✅ Opened ${order.side} ${order.size.toFixed(4)} ${signal.asset} @ $${result.fillPrice.toFixed(4)}`);
        
        return newPosition;
      }
    } catch (error) {
      logExecution(`❌ Order failed: ${error}`);
    } finally {
      setIsExecuting(false);
    }
    
    return null;
  }, [traderSettings, userSettings, positions, setPositions, logExecution]);
  
  const simulateWhaleTrade = useCallback(() => {
    const followingTraders = traders.filter(t => t.isFollowing);
    if (followingTraders.length === 0) return;
    
    const trader = followingTraders[Math.floor(Math.random() * followingTraders.length)];
    const assets = ['HYPE', 'BTC', 'ETH', 'SOL', 'ARB'];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const side = Math.random() > 0.5 ? 'Long' : 'Short';
    const price = 10 + Math.random() * 100;
    
    const signal: CopyTradeSignal = {
      traderId: trader.id,
      traderAddress: trader.address,
      asset,
      side,
      price,
      size: Math.random() * 10,
      timestamp: Date.now(),
    };
    
    const newTrade = {
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
    logExecution(`🐋 ${trader.name} ${side.toLowerCase()} ${asset} @ $${price.toFixed(2)}`);
    
    simulateTrade(signal);
  }, [traders, addTrade, simulateTrade, logExecution]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        simulateWhaleTrade();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [simulateWhaleTrade]);
  
  return {
    simulateTrade,
    simulateWhaleTrade,
    isExecuting,
    executionLog,
  };
}
