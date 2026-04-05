import { useCallback, useEffect } from 'react';
import { useWalletStore, type Order, type Position } from '@/stores/walletStore';
import { binance, type Ticker } from '@/lib/binance';

export function useTrading() {
  const {
    balances,
    positions,
    orders,
    trades,
    totalPnl,
    totalBalance,
    placeOrder,
    cancelOrder,
    fillOrder,
    openPosition,
    closePosition,
    updatePositionPrices,
    updateBalance,
  } = useWalletStore();

  const getBalance = useCallback((asset: string) => {
    return balances.find(b => b.asset === asset)?.free || 0;
  }, [balances]);

  const executeBuy = useCallback((symbol: string, quantity: number, price: number) => {
    const baseAsset = symbol.replace('USDT', '');
    const orderValue = quantity * price;
    const balance = getBalance('USDT');

    if (orderValue > balance) {
      console.error('Insufficient balance');
      return null;
    }

    const order = placeOrder({
      symbol,
      side: 'BUY',
      type: 'LIMIT',
      price,
      quantity,
    });

    fillOrder(order.id, quantity, price);

    openPosition({
      symbol,
      side: 'LONG',
      entryPrice: price,
      quantity,
      openedAt: Date.now(),
    });

    const fee = orderValue * 0.001;
    updateBalance('USDT', balance - orderValue + fee);

    const newBalance = getBalance('USDT');
    updateBalance(baseAsset, (balances.find(b => b.asset === baseAsset)?.free || 0) + quantity);

    return order;
  }, [placeOrder, fillOrder, openPosition, getBalance, updateBalance, balances]);

  const executeSell = useCallback((symbol: string, quantity: number, price: number) => {
    const baseAsset = symbol.replace('USDT', '');
    const baseBalance = getBalance(baseAsset);

    if (quantity > baseBalance) {
      console.error('Insufficient balance');
      return null;
    }

    const position = positions.find(p => p.symbol === symbol && p.side === 'LONG');
    if (!position) {
      console.error('No position found to close');
      return null;
    }

    const trade = closePosition(position.id, price);
    
    if (trade) {
      updateBalance('USDT', getBalance('USDT') + trade.realizedPnl!);
      updateBalance(baseAsset, baseBalance - quantity);
    }

    return trade;
  }, [positions, closePosition, getBalance, updateBalance]);

  const executeShort = useCallback((symbol: string, quantity: number, price: number) => {
    const orderValue = quantity * price;
    const balance = getBalance('USDT');
    const requiredMargin = orderValue * 0.1;

    if (requiredMargin > balance) {
      console.error('Insufficient margin');
      return null;
    }

    const order = placeOrder({
      symbol,
      side: 'SELL',
      type: 'LIMIT',
      price,
      quantity,
    });

    fillOrder(order.id, quantity, price);

    openPosition({
      symbol,
      side: 'SHORT',
      entryPrice: price,
      quantity,
      openedAt: Date.now(),
    });

    return order;
  }, [placeOrder, fillOrder, openPosition, getBalance]);

  const coverShort = useCallback((symbol: string, quantity: number, price: number) => {
    const position = positions.find(p => p.symbol === symbol && p.side === 'SHORT');
    if (!position) {
      console.error('No short position found');
      return null;
    }

    const coverCost = quantity * price;
    const pnl = (position.entryPrice - price) * quantity;

    const trade = closePosition(position.id, price);

    if (trade) {
      updateBalance('USDT', getBalance('USDT') + coverCost + pnl);
    }

    return trade;
  }, [positions, closePosition, getBalance]);

  const cancelPendingOrder = useCallback((orderId: string) => {
    cancelOrder(orderId);
  }, [cancelOrder]);

  useEffect(() => {
    const updatePrices = async () => {
      try {
        const tickers = await binance.getTickers();
        const prices: Record<string, number> = {};
        
        positions.forEach(pos => {
          const ticker = tickers.find(t => t.symbol === pos.symbol);
          if (ticker) {
            prices[pos.symbol] = ticker.price;
          }
        });

        if (Object.keys(prices).length > 0) {
          updatePositionPrices(prices);
        }
      } catch (error) {
        console.error('Failed to update prices:', error);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);

    return () => clearInterval(interval);
  }, [positions, updatePositionPrices]);

  return {
    balances,
    positions,
    orders: orders.filter(o => o.status === 'open' || o.status === 'partial'),
    trades: trades.slice(0, 50),
    totalPnl,
    totalBalance,
    getBalance,
    executeBuy,
    executeSell,
    executeShort,
    coverShort,
    cancelOrder: cancelPendingOrder,
  };
}
