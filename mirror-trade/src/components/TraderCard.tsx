import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Activity, Settings, Check } from 'lucide-react';
import type { Trader } from '@/types';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/hyperliquid';
import { SettingsModal } from './SettingsModal';

interface TraderCardProps {
  trader: Trader;
  onToggleFollow: (id: string) => void;
}

export function TraderCard({ trader, onToggleFollow }: TraderCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  
  const isProfitable = trader.totalPnl >= 0;
  const winRateColor = trader.winRate >= 60 ? 'text-success' : trader.winRate >= 50 ? 'text-primary' : 'text-danger';
  
  return (
    <>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all">
          {trader.isActive && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
                <span className="text-[10px] text-success font-medium">LIVE</span>
              </span>
            </div>
          )}
          
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
              <span className="font-mono font-bold text-sm text-primary">
                {trader.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-mono font-semibold text-white truncate">{trader.name}</h3>
              <p className="font-mono text-xs text-gray-500">
                {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total PnL</p>
              <p className={`font-mono font-semibold ${isProfitable ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(trader.totalPnl)}
              </p>
            </div>
            <div>
              <p className="text[10px] text-gray-500 uppercase tracking-wider mb-1">Win Rate</p>
              <p className={`font-mono font-semibold ${winRateColor}`}>
                {formatPercent(trader.winRate).replace('%', '')}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatNumber(trader.followers)}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {formatNumber(trader.copyFee)}%
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleFollow(trader.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  trader.isFollowing
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-primary text-background hover:bg-primary/90'
                }`}
              >
                {trader.isFollowing ? (
                  <>
                    <Check className="w-3 h-3" />
                    Following
                  </>
                ) : (
                  'Follow'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showSettings && (
        <SettingsModal
          trader={trader}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
