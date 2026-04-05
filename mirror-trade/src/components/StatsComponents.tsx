import React from 'react';
import { TrendingUp, Users, BarChart3, Activity, Zap, Shield, Target } from 'lucide-react';
import { useStore } from '@/stores/store';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/hyperliquid';

export function EnhancedStatsBar() {
  const { traders, positions, trades, traderSettings } = useStore();
  
  const followingCount = traders.filter(t => t.isFollowing).length;
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const todayTrades = trades.filter(t => Date.now() - t.timestamp < 86400000).length;
  const volume = positions.reduce((sum, p) => sum + p.size * p.currentPrice, 0);
  const winRate = positions.filter(p => p.unrealizedPnl > 0).length / Math.max(positions.length, 1) * 100;
  const openPositions = positions.length;
  const avgPnl = positions.length > 0 ? totalPnl / positions.length : 0;
  
  const stats = [
    { 
      label: 'Portfolio PnL', 
      value: formatCurrency(totalPnl), 
      subValue: `${positions.length} positions`,
      icon: TrendingUp, 
      color: totalPnl >= 0 ? 'text-success' : 'text-danger',
      bgColor: totalPnl >= 0 ? 'from-success/10' : 'from-danger/10'
    },
    { 
      label: 'Win Rate', 
      value: `${winRate.toFixed(1)}%`, 
      subValue: `${positions.filter(p => p.unrealizedPnl > 0).length}W / ${positions.filter(p => p.unrealizedPnl < 0).length}L`,
      icon: Target, 
      color: winRate >= 50 ? 'text-success' : 'text-danger',
      bgColor: winRate >= 50 ? 'from-success/10' : 'from-danger/10'
    },
    { 
      label: 'Active Copiers', 
      value: formatNumber(followingCount, 0), 
      subValue: 'traders',
      icon: Users, 
      color: 'text-primary',
      bgColor: 'from-primary/10'
    },
    { 
      label: 'Trades Today', 
      value: formatNumber(todayTrades, 0), 
      subValue: `${formatCurrency(volume)} volume`,
      icon: BarChart3, 
      color: 'text-accent',
      bgColor: 'from-accent/10'
    },
  ];
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl bg-surface border border-border p-4 group hover:border-primary/30 transition-all"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`font-mono text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniChart() {
  const [data] = React.useState(() => 
    Array.from({ length: 24 }, (_, i) => ({
      value: 100 + Math.sin(i * 0.3) * 10 + Math.random() * 5,
      time: i,
    }))
  );
  
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const range = max - min;
  
  const path = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const areaPath = path + ` L 100 100 L 0 100 Z`;
  
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono font-semibold text-white">Pnl History</h3>
          <p className="text-xs text-gray-500">24h performance</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-success">+12.45%</p>
        </div>
      </div>
      
      <div className="h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartGradient)" />
          <path d={path} fill="none" stroke="#00ff88" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}
