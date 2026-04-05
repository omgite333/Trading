import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Trade } from '@/types';
import { formatCurrency, formatTime, formatNumber } from '@/lib/hyperliquid';

interface TradeRowProps {
  trade: Trade;
}

export function TradeRow({ trade }: TradeRowProps) {
  const isLong = trade.side === 'Long';
  
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors border-b border-border/50 last:border-0">
      <div className="w-20 text-xs text-gray-500 font-mono">
        {formatTime(trade.timestamp)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white font-medium truncate">{trade.traderName}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
            isLong
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}>
            {isLong ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {trade.side}
          </span>
        </div>
      </div>
      
      <div className="w-16 text-center">
        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">
          {trade.asset}
        </span>
      </div>
      
      <div className="w-28 text-right">
        <span className="font-mono text-sm text-white">
          ${formatNumber(trade.price, trade.price < 100 ? 4 : 2)}
        </span>
      </div>
      
      <div className="w-24 text-right">
        <span className="font-mono text-sm text-gray-300">
          {formatNumber(trade.size, 4)}
        </span>
      </div>
      
      <div className="w-32 text-right">
        <span className="font-mono text-sm text-gray-300">
          ${formatNumber(trade.price * trade.size, 2)}
        </span>
      </div>
    </div>
  );
}

export function TradeHistory({ trades }: { trades: Trade[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-mono font-semibold text-white">Live Trade Feed</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No trades yet</p>
            <p className="text-xs mt-1">Follow traders to see their activity</p>
          </div>
        ) : (
          trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} />
          ))
        )}
      </div>
    </div>
  );
}
