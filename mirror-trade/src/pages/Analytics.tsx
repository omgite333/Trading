import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, PieChart, DollarSign } from 'lucide-react';
import { useWalletStore } from '@/stores/walletStore';

export default function Analytics() {
  const { trades, positions, totalPnl, balances } = useWalletStore();

  const stats = {
    totalPnl,
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
  const usdtBalance = balances.find(b => b.asset === 'USDT')?.free || 0;
  const portfolioValue = usdtBalance + totalPnl;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-[#666]">Track your performance</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Portfolio Value</span>
          </div>
          <p className="text-xl font-mono font-semibold text-white">${portfolioValue.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Total PnL</span>
          </div>
          <p className={`text-xl font-mono font-semibold ${totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Win Rate</span>
          </div>
          <p className="text-xl font-mono font-semibold text-white">{stats.winRate}%</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="hl-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#666]" />
            <span className="text-xs text-[#666]">Total Trades</span>
          </div>
          <p className="text-xl font-mono font-semibold text-white">{stats.totalTrades}</p>
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
          <h2 className="text-sm font-medium text-white mb-4">Recent Trades</h2>
          <div className="space-y-2">
            {trades.slice(0, 5).map((trade, i) => (
              <div key={trade.id || i} className="flex items-center justify-between p-2 bg-[#0a0a0b] rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${
                    trade.side === 'BUY' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#ff3366]/10 text-[#ff3366]'
                  }`}>
                    {trade.side === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-white">{trade.symbol.replace('USDT', '')}</p>
                    <p className="text-xs text-[#666]">
                      {new Date(trade.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white">${trade.price.toFixed(2)}</p>
                  <p className="text-xs text-[#666]">{trade.quantity}</p>
                </div>
              </div>
            ))}
            {trades.length === 0 && (
              <p className="text-sm text-[#666] text-center py-4">No trades yet</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="hl-card p-4">
          <h2 className="text-sm font-medium text-white mb-4">Asset Distribution</h2>
          <div className="space-y-3">
            {[
              { asset: 'USDT', percent: Math.round((usdtBalance / (usdtBalance + Math.abs(totalPnl))) * 100) || 100, color: 'bg-[#00d4ff]' },
              { asset: 'Positions', percent: Math.round((Math.abs(totalPnl) / (usdtBalance + Math.abs(totalPnl))) * 100) || 0, color: 'bg-[#00ff88]' },
            ].map((item) => (
              <div key={item.asset} className="flex items-center gap-3">
                <span className="text-sm text-white w-20">{item.asset}</span>
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="hl-card p-4">
        <h2 className="text-sm font-medium text-white mb-4">Open Positions</h2>
        {positions.length === 0 ? (
          <p className="text-sm text-[#666] text-center py-4">No open positions</p>
        ) : (
          <div className="space-y-2">
            {positions.map((pos) => (
              <div key={pos.id} className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${
                    pos.side === 'LONG' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#ff3366]/10 text-[#ff3366]'
                  }`}>
                    {pos.side === 'LONG' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-white">{pos.symbol.replace('USDT', '')}</p>
                    <p className="text-xs text-[#666]">{pos.side} × {pos.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${pos.unrealizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-[#666]">{pos.unrealizedPnlPercent.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
