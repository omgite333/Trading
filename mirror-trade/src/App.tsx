import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { EnhancedStatsBar, MiniChart } from '@/components/StatsComponents';
import { TraderCard } from '@/components/TraderCard';
import { TradeHistory } from '@/components/TradeHistory';
import { EnhancedTradeHistory } from '@/components/EnhancedTradeHistory';
import { Portfolio } from '@/components/Portfolio';
import { ExecutionLog } from '@/components/ExecutionLog';
import { TradingPairSelector } from '@/components/TradingPairSelector';
import { NotificationCenter } from '@/components/NotificationCenter';
import { PerformanceChart, AllocationChart, StatsOverview } from '@/components/Charts';
import { PositionDetailModal } from '@/components/PositionDetailModal';
import { useStore } from '@/stores/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useHyperliquid } from '@/hooks/useHyperliquid';
import type { Position } from '@/types';

export default function Dashboard() {
  const { traders, trades, positions, toggleFollow, initMockData } = useStore();
  const { isConnected: wsConnected } = useWebSocket();
  const { executionLog, simulateWhaleTrade } = useHyperliquid();
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  useEffect(() => {
    initMockData();
  }, [initMockData]);
  
  const followingTraders = traders.filter(t => t.isFollowing);
  
  const filteredPositions = selectedPairs.length > 0
    ? positions.filter(p => selectedPairs.includes(p.asset))
    : positions;
    
  const filteredTrades = selectedPairs.length > 0
    ? trades.filter(t => selectedPairs.includes(t.asset))
    : trades;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EnhancedStatsBar />
      
      <main className="max-w-[1800px] mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="font-mono font-bold text-xl text-white">Dashboard</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success' : 'bg-gray-500'}`} />
              {wsConnected ? 'Real-time' : 'Demo Mode'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TradingPairSelector selected={selectedPairs} onChange={setSelectedPairs} />
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showAnalytics
                  ? 'bg-primary text-background'
                  : 'bg-surface border border-border text-gray-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <PerformanceChart />
            </div>
            <div className="space-y-6">
              <AllocationChart />
              <StatsOverview />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <h3 className="font-mono font-semibold text-white">Top Traders</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                    {followingTraders.length} Following
                  </span>
                </div>
                <span className="text-xs text-gray-500">{traders.length} traders</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {traders.slice(0, 6).map((trader) => (
                    <TraderCard
                      key={trader.id}
                      trader={trader}
                      onToggleFollow={toggleFollow}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <Portfolio positions={filteredPositions} onPositionClick={setSelectedPosition} />
            
            <MiniChart />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EnhancedTradeHistory trades={filteredTrades} />
          <ExecutionLog logs={executionLog} />
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={simulateWhaleTrade}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-background font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Simulate Whale Trade (Demo)
          </button>
        </div>
      </main>
      
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between text-xs text-gray-500">
          <p>MirrorTrade - Hyperliquid Copy Trading Platform</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <p>Use at your own risk. Not financial advice.</p>
        </div>
      </footer>

      {selectedPosition && (
        <PositionDetailModal
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </div>
  );
}
