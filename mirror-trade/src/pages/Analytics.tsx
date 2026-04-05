import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { useStore } from '@/stores/store';

export default function Analytics() {
  const { traders, positions, trades } = useStore();

  const stats = {
    totalPnL: positions.reduce((sum, p) => sum + p.unrealizedPnl, 0),
    winRate: 68.5,
    totalTrades: trades.length,
    profitableDays: 18,
  };

  const weeklyData = [
    { day: 'Mon', pnl: 120 },
    { day: 'Tue', pnl: -45 },
    { day: 'Wed', pnl: 230 },
    { day: 'Thu', pnl: 89 },
    { day: 'Fri', pnl: -67 },
    { day: 'Sat', pnl: 156 },
    { day: 'Sun', pnl: 92 },
  ];

  const maxPnl = Math.max(...weeklyData.map(d => Math.abs(d.pnl)));

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-[#666]">Track your performance</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Total PnL</span>
          </div>
          <p className={`text-xl font-mono font-semibold ${stats.totalPnL >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Win Rate</span>
          </div>
          <p className="text-xl font-mono font-semibold text-white">{stats.winRate}%</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Total Trades</span>
          </div>
          <p className="text-xl font-mono font-semibold text-white">{stats.totalTrades}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Profitable Days</span>
          </div>
          <p className="text-xl font-mono font-semibold text-white">{stats.profitableDays}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="hl-card p-4">
        <h2 className="text-sm font-medium text-white mb-4">Weekly PnL</h2>
        <div className="flex items-end justify-between gap-2 h-40">
          {weeklyData.map((day, i) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-sm transition-all ${day.pnl >= 0 ? 'bg-[#00ff88]' : 'bg-[#ff3366]'}`}
                style={{ height: `${Math.abs(day.pnl) / maxPnl * 100}%` }}
              />
              <span className="text-[10px] text-[#666]">{day.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="hl-card p-4">
          <h2 className="text-sm font-medium text-white mb-4">Top Copied Traders</h2>
          <div className="space-y-3">
            {traders.filter(t => t.isFollowing).slice(0, 5).map((trader) => (
              <div key={trader.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1f1f24] flex items-center justify-center text-white text-xs font-medium">
                    {trader.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white">{trader.name}</p>
                    <p className="text-xs text-[#666]">{trader.followers} followers</p>
                  </div>
                </div>
                <p className={`text-sm font-mono ${trader.totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {trader.totalPnl >= 0 ? '+' : ''}${(trader.totalPnl / 1000).toFixed(1)}K
                </p>
              </div>
            ))}
            {traders.filter(t => t.isFollowing).length === 0 && (
              <p className="text-sm text-[#666] text-center py-4">No traders being copied</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="hl-card p-4">
          <h2 className="text-sm font-medium text-white mb-4">Asset Distribution</h2>
          <div className="space-y-3">
            {[
              { asset: 'HYPE', percent: 45, color: 'bg-[#00d4ff]' },
              { asset: 'BTC', percent: 25, color: 'bg-[#f7931a]' },
              { asset: 'ETH', percent: 18, color: 'bg-[#627eea]' },
              { asset: 'SOL', percent: 8, color: 'bg-[#9945ff]' },
              { asset: 'Other', percent: 4, color: 'bg-[#666]' },
            ].map((item) => (
              <div key={item.asset} className="flex items-center gap-3">
                <span className="text-sm text-white w-12">{item.asset}</span>
                <div className="flex-1 h-2 bg-[#1f1f24] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-xs text-[#666] w-8 text-right">{item.percent}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
