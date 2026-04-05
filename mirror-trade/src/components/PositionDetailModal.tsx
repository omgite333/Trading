import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Clock, Shield, Target, ExternalLink, Copy } from 'lucide-react';
import type { Position } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/hyperliquid';

interface PositionDetailModalProps {
  position: Position;
  onClose: () => void;
}

export function PositionDetailModal({ position, onClose }: PositionDetailModalProps) {
  const [currentPrice, setCurrentPrice] = useState(position.currentPrice);
  const isLong = position.side === 'Long';
  const isProfitable = position.unrealizedPnl >= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 0.002 * prev;
        return prev + change;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const unrealizedPnl = isLong
    ? (currentPrice - position.entryPrice) * position.size
    : (position.entryPrice - currentPrice) * position.size;

  const pnlPercent = (unrealizedPnl / (position.entryPrice * position.size)) * 100;

  const distanceToSL = position.stopLoss
    ? Math.abs((position.entryPrice - position.stopLoss) / position.entryPrice) * 100
    : 0;

  const distanceToTP = position.takeProfit
    ? Math.abs((position.takeProfit - position.entryPrice) / position.entryPrice) * 100
    : 0;

  const distanceToMarket = isLong
    ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
    : ((position.entryPrice - currentPrice) / position.entryPrice) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isLong ? 'bg-success/10' : 'bg-danger/10'
            }`}>
              {isLong ? (
                <TrendingUp className="w-6 h-6 text-success" />
              ) : (
                <TrendingDown className="w-6 h-6 text-danger" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-xl text-white">{position.asset}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isLong ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                  {position.side}
                </span>
              </div>
              <p className="text-sm text-gray-500">via {position.traderName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background/50">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Entry Price</p>
              <p className="font-mono text-lg text-white">${position.entryPrice.toFixed(4)}</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Price</p>
              <p className={`font-mono text-lg ${currentPrice >= position.entryPrice ? 'text-success' : 'text-danger'}`}>
                ${currentPrice.toFixed(4)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-background/50">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Size</p>
              <p className="font-mono text-lg text-white">{position.size.toFixed(4)}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-background to-surface border border-border">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Unrealized PnL</p>
              <p className={`font-mono text-2xl font-bold ${unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(unrealizedPnl)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-mono text-lg ${pnlPercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPercent(pnlPercent)}
              </span>
              <span className={`font-mono text-sm ${distanceToMarket >= 0 ? 'text-success' : 'text-danger'}`}>
                {distanceToMarket >= 0 ? '+' : ''}{distanceToMarket.toFixed(2)}% from entry
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-danger" />
                <p className="text-sm text-danger font-medium">Stop Loss</p>
              </div>
              <p className="font-mono text-lg text-white">${position.stopLoss?.toFixed(4) || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{distanceToSL.toFixed(2)}% below entry</p>
            </div>
            <div className="p-4 rounded-xl bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-success" />
                <p className="text-sm text-success font-medium">Take Profit</p>
              </div>
              <p className="font-mono text-lg text-white">${position.takeProfit?.toFixed(4) || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{distanceToTP.toFixed(2)}% above entry</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Opened {new Date(position.openedAt).toLocaleDateString()}
            </span>
            <span className="font-mono">#{position.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-border">
          <button className="flex-1 py-3 rounded-xl bg-danger/10 text-danger font-medium hover:bg-danger/20 transition-all">
            Close Position
          </button>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all">
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
