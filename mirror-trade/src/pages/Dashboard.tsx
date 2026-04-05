import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '@/stores/store';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { traders, positions, trades } = useStore();
  const followingTraders = traders.filter(t => t.isFollowing);
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  
  const stats = [
    { label: 'Portfolio Value', value: '$12,458.32', change: '+12.45%', positive: true, icon: DollarSign },
    { label: 'Total PnL', value: `$${totalPnl.toFixed(2)}`, change: totalPnl >= 0 ? '+8.2%' : '-3.1%', positive: totalPnl >= 0, icon: totalPnl >= 0 ? TrendingUp : TrendingDown },
    { label: 'Active Copiers', value: followingTraders.length.toString(), change: '+2 today', positive: true, icon: Users },
    { label: 'Copy Volume', value: '$45,231', change: '+23.5%', positive: true, icon: Activity },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={item}>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-[#666]">Your copy trading overview</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={item}
            className="hl-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-4 h-4 ${stat.positive ? 'text-[#00ff88]' : 'text-[#ff3366]'}`} />
              <span className={`text-xs font-mono ${stat.positive ? 'text-[#00ff88]' : 'text-[#ff33666]'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xl font-semibold text-white font-mono">{stat.value}</p>
            <p className="text-xs text-[#666] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="hl-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Top Traders</h2>
          </div>
          <div className="space-y-2">
            {traders.slice(0, 5).map((trader, i) => (
              <div key={trader.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1f1f24] to-[#2a2a2e] flex items-center justify-center text-white text-xs font-medium">
                  {trader.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{trader.name}</p>
                  <p className="text-xs text-[#666]">{trader.followers.toLocaleString()} followers</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold font-mono ${trader.totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {trader.totalPnl >= 0 ? '+' : ''}${(trader.totalPnl / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-[#666]">{trader.winRate}% WR</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="hl-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Recent Trades</h2>
          </div>
          <div className="space-y-2">
            {trades.slice(0, 6).map((trade, i) => (
              <div key={trade.id || i} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  trade.side === 'Long' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#ff3366]/10 text-[#ff3366]'
                }`}>
                  {trade.side === 'Long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-medium">{trade.traderName}</span>
                    <span className="text-[#999] ml-1">{trade.side}</span>
                    <span className="text-[#00d4ff] ml-1">{trade.asset}</span>
                  </p>
                  <p className="text-xs text-[#666]">${trade.price.toFixed(2)} × {trade.size}</p>
                </div>
                <span className="text-xs text-[#666]">
                  {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="hl-card p-4">
        <h2 className="text-sm font-medium text-white mb-4">Your Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left table-cell">Asset</th>
                <th className="text-left table-cell">Side</th>
                <th className="text-right table-cell">Size</th>
                <th className="text-right table-cell">Entry</th>
                <th className="text-right table-cell">Current</th>
                <th className="text-right table-cell">PnL</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-t border-[#2a2a2e] hover:bg-white/5">
                  <td className="table-cell font-medium text-white">{pos.asset}</td>
                  <td className={`table-cell ${pos.side === 'Long' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {pos.side}
                  </td>
                  <td className="table-cell text-right font-mono">{pos.size}</td>
                  <td className="table-cell text-right font-mono text-[#999]">${pos.entryPrice.toFixed(2)}</td>
                  <td className="table-cell text-right font-mono text-white">${pos.currentPrice.toFixed(2)}</td>
                  <td className={`table-cell text-right font-mono ${pos.unrealizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-[#666] py-8">
                    No open positions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
