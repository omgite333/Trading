import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Balance {
  asset: string;
  free: number;
  locked: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP';
  price: number;
  quantity: number;
  filled: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  createdAt: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  fee: number;
  realizedPnl?: number;
  timestamp: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openedAt: number;
}

interface WalletState {
  balances: Balance[];
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  totalPnl: number;
  totalBalance: number;
  
  setBalances: (balances: Balance[]) => void;
  updateBalance: (asset: string, free: number, locked?: number) => void;
  placeOrder: (order: Omit<Order, 'id' | 'filled' | 'status' | 'createdAt'>) => Order;
  cancelOrder: (orderId: string) => void;
  fillOrder: (orderId: string, quantity: number, price: number) => void;
  openPosition: (position: Omit<Position, 'id' | 'currentPrice' | 'unrealizedPnl' | 'unrealizedPnlPercent'>) => Position;
  closePosition: (positionId: string, currentPrice: number) => Trade | null;
  updatePositionPrices: (prices: Record<string, number>) => void;
  calculatePnL: () => number;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balances: [
        { asset: 'USDT', free: 10000, locked: 0 },
        { asset: 'BTC', free: 0.5, locked: 0 },
        { asset: 'ETH', free: 5, locked: 0 },
      ],
      positions: [],
      orders: [],
      trades: [],
      totalPnl: 0,
      totalBalance: 10000,

      setBalances: (balances) => set({ balances }),

      updateBalance: (asset, free, locked = 0) => set((state) => {
        const index = state.balances.findIndex(b => b.asset === asset);
        if (index >= 0) {
          const newBalances = [...state.balances];
          newBalances[index] = { ...newBalances[index], free, locked };
          return { balances: newBalances };
        }
        return { balances: [...state.balances, { asset, free, locked }] };
      }),

      placeOrder: (orderData) => {
        const order: Order = {
          ...orderData,
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filled: 0,
          status: 'open',
          createdAt: Date.now(),
        };

        set((state) => ({
          orders: [...state.orders, order],
          balances: state.balances.map(b => {
            if (b.asset === 'USDT') {
              const orderValue = orderData.price * orderData.quantity;
              return { ...b, free: b.free - orderValue, locked: b.locked + orderValue };
            }
            return b;
          }),
        }));

        return order;
      },

      cancelOrder: (orderId) => {
        set((state) => {
          const order = state.orders.find(o => o.id === orderId);
          if (!order) return state;

          return {
            orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o),
            balances: state.balances.map(b => {
              if (b.asset === 'USDT') {
                const orderValue = order.price * (order.quantity - order.filled);
                return { ...b, free: b.free + orderValue, locked: b.locked - orderValue };
              }
              return b;
            }),
          };
        });
      },

      fillOrder: (orderId, quantity, price) => {
        set((state) => {
          const orderIndex = state.orders.findIndex(o => o.id === orderId);
          if (orderIndex < 0) return state;

          const order = state.orders[orderIndex];
          const newFilled = order.filled + quantity;
          const isFullyFilled = newFilled >= order.quantity;
          const orderValue = price * quantity;

          const trade: Trade = {
            id: `trade-${Date.now()}`,
            symbol: order.symbol,
            side: order.side,
            price,
            quantity,
            fee: orderValue * 0.001,
            timestamp: Date.now(),
          };

          return {
            orders: state.orders.map((o, i) => 
              i === orderIndex 
                ? { ...o, filled: newFilled, status: isFullyFilled ? 'filled' as const : 'partial' as const }
                : o
            ),
            trades: [trade, ...state.trades],
            balances: state.balances.map(b => {
              if (b.asset === 'USDT') {
                if (order.side === 'BUY') {
                  return { ...b, locked: b.locked - orderValue };
                } else {
                  return { ...b, free: b.free + orderValue - trade.fee };
                }
              }
              return b;
            }),
          };
        });
      },

      openPosition: (positionData) => {
        const position: Position = {
          ...positionData,
          id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          currentPrice: positionData.entryPrice,
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
        };

        set((state) => ({
          positions: [...state.positions, position],
        }));

        return position;
      },

      closePosition: (positionId, currentPrice) => {
        const state = get();
        const position = state.positions.find(p => p.id === positionId);
        if (!position) return null;

        const pnl = position.side === 'LONG'
          ? (currentPrice - position.entryPrice) * position.quantity
          : (position.entryPrice - currentPrice) * position.quantity;

        const trade: Trade = {
          id: `trade-${Date.now()}`,
          symbol: position.symbol,
          side: position.side === 'LONG' ? 'SELL' : 'BUY',
          price: currentPrice,
          quantity: position.quantity,
          fee: currentPrice * position.quantity * 0.001,
          realizedPnl: pnl,
          timestamp: Date.now(),
        };

        set((state) => ({
          positions: state.positions.filter(p => p.id !== positionId),
          trades: [trade, ...state.trades],
          balances: state.balances.map(b => {
            if (b.asset === 'USDT') {
              const closeValue = position.side === 'LONG'
                ? position.quantity * currentPrice
                : position.quantity * position.entryPrice;
              return { ...b, free: b.free + closeValue + pnl - trade.fee };
            }
            return b;
          }),
          totalPnl: state.totalPnl + pnl,
        }));

        return trade;
      },

      updatePositionPrices: (prices) => {
        set((state) => {
          const updatedPositions = state.positions.map(pos => {
            const currentPrice = prices[pos.symbol] || pos.currentPrice;
            const unrealizedPnl = pos.side === 'LONG'
              ? (currentPrice - pos.entryPrice) * pos.quantity
              : (pos.entryPrice - currentPrice) * pos.quantity;
            const unrealizedPnlPercent = (unrealizedPnl / (pos.entryPrice * pos.quantity)) * 100;

            return {
              ...pos,
              currentPrice,
              unrealizedPnl,
              unrealizedPnlPercent,
            };
          });

          const totalPnl = updatedPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
          const realizedPnl = state.trades.reduce((sum, t) => sum + (t.realizedPnl || 0), 0);

          return {
            positions: updatedPositions,
            totalPnl: totalPnl + realizedPnl,
            totalBalance: state.balances.find(b => b.asset === 'USDT')?.free || 0 + totalPnl,
          };
        });
      },

      calculatePnL: () => {
        const state = get();
        return state.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0) +
               state.trades.reduce((sum, t) => sum + (t.realizedPnl || 0), 0);
      },
    }),
    {
      name: 'mirror-trade-wallet',
      partialize: (state) => ({
        balances: state.balances,
        positions: state.positions,
        orders: state.orders,
        trades: state.trades,
        totalPnl: state.totalPnl,
      }),
    }
  )
);
