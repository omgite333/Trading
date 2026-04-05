import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trader, Trade, Position, UserSettings, TraderSettings } from '@/types';
import { generateMockTraders, generateMockTrades, generateMockPositions, defaultUserSettings } from '@/lib/hyperliquid';

interface AppState {
  traders: Trader[];
  trades: Trade[];
  positions: Position[];
  userSettings: UserSettings;
  traderSettings: Record<string, TraderSettings>;
  isConnected: boolean;
  walletAddress: string | null;
  notifications: Notification[];
  
  setTraders: (traders: Trader[]) => void;
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  setPositions: (positions: Position[]) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  
  toggleFollow: (traderId: string) => void;
  setUserSettings: (settings: Partial<UserSettings>) => void;
  setTraderSettings: (traderId: string, settings: Partial<TraderSettings>) => void;
  
  connectWallet: (address?: string) => void;
  disconnectWallet: () => void;
  
  initMockData: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      traders: [],
      trades: [],
      positions: [],
      userSettings: defaultUserSettings,
      traderSettings: {},
      isConnected: false,
      walletAddress: null,
      notifications: [],
      
      setTraders: (traders) => set({ traders }),
      
      setTrades: (trades) => set({ trades }),
      
      addTrade: (trade) => set((state) => ({
        trades: [trade, ...state.trades].slice(0, 100),
      })),
      
      setPositions: (positions) => set({ positions }),
      
      updatePosition: (id, updates) => set((state) => ({
        positions: state.positions.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),
      
      toggleFollow: (traderId) => set((state) => ({
        traders: state.traders.map((t) =>
          t.id === traderId ? { ...t, isFollowing: !t.isFollowing } : t
        ),
      })),
      
      setUserSettings: (settings) => set((state) => ({
        userSettings: { ...state.userSettings, ...settings },
      })),
      
      setTraderSettings: (traderId, settings) => set((state) => ({
        traderSettings: {
          ...state.traderSettings,
          [traderId]: {
            ...defaultUserSettings,
            ...state.traderSettings[traderId],
            ...settings,
            traderId,
          },
        },
      })),
      
      connectWallet: (address = '0x742d35Cc6634C0532925a3b844Bc9e7595f8E2d1') => set({ 
        isConnected: true, 
        walletAddress: address 
      }),
      
      disconnectWallet: () => set({ 
        isConnected: false, 
        walletAddress: null 
      }),
      
      initMockData: () => {
        const traders = generateMockTraders();
        const trades = generateMockTrades();
        const positions = generateMockPositions();
        set({ traders, trades, positions });
      },
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ].slice(0, 50),
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'mirror-trade-storage',
      partialize: (state) => ({
        userSettings: state.userSettings,
        traderSettings: state.traderSettings,
        traders: state.traders,
        notifications: state.notifications,
      }),
    }
  )
);
