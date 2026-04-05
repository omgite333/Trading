import React from 'react';
import { TrendingUp, TrendingDown, Clock, Target, Shield } from 'lucide-react';
import type { Position } from '@/types';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/hyperliquid';

interface PositionCardProps {
  position: Position;
  onClick?: () => void;
}

export function PositionCard({ position, onClick }: PositionCardProps) {
  const isLong = position.side === 'Long';
  const isProfitable = position.unrealizedPnl >= 0;
  
  const timeAgo = Math.floor((Date.now() - position.openedAt) / 60000);
  
  return (
    <div 
      onClick={onClick}
      className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isLong ? 'bg-success/10' : 'bg-danger/10'
          }`}>
            {isLong ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-danger" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-white">{position.asset}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                isLong ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}>
                {position.side}
              </span>
            </div>
            <p className="text-xs text-gray-500">via {position.traderName}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`font-mono font-bold ${isProfitable ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(position.unrealizedPnl)}
          </p>
          <p className={`text-xs ${isProfitable ? 'text-success/70' : 'text-danger/70'}`}>
            {formatPercent(position.pnlPercent)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-background/50">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Entry</p>
          <p className="font-mono text-sm text-white">${formatNumber(position.entryPrice, 4)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current</p>
          <p className="font-mono text-sm text-white">${formatNumber(position.currentPrice, 4)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Size</p>
          <p className="font-mono text-sm text-white">{formatNumber(position.size, 4)}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Clock className="w-3 h-3" />
            {timeAgo}m ago
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-danger">
            <Shield className="w-3 h-3" />
            SL: ${formatNumber(position.stopLoss || 0, 4)}
          </span>
          <span className="flex items-center gap-1 text-success">
            <Target className="w-3 h-3" />
            TP: ${formatNumber(position.takeProfit || 0, 4)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PortfolioProps {
  positions: Position[];
  onPositionClick?: (position: Position) => void;
}

export function Portfolio({ positions, onPositionClick }: PortfolioProps) {
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const isProfitable = totalPnl >= 0;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono font-semibold text-white">My Positions</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Total PnL:</span>
          <span className={`font-mono font-bold ${isProfitable ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(totalPnl)}
          </span>
        </div>
      </div>
      
      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-surface border border-border rounded-xl text-gray-500">
          <p className="text-sm">No active positions</p>
          <p className="text-xs mt-1">Follow traders to start copying</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {positions.map((position) => (
            <PositionCard 
              key={position.id} 
              position={position}
              onClick={() => onPositionClick?.(position)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
