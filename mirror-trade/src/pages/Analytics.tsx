import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Activity, Target, Award, AlertTriangle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useStore } from '@/stores/store';
import { formatCurrency, formatNumber } from '@/lib/hyperliquid';

const performanceData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  value: 100 + i * 0.5 + Math.sin(i * 0.3) * 5 + Math.random() * 3,
  volume: Math.random() * 10000,
}));

const winLossData = [
  { name: 'Winning Trades', value: 45, color: '#10b981' },
  { name: 'Losing Trades', value: 20, color: '#f43f5e' },
];

const monthlyData = [
  { month: 'Jan', pnl: 1200, trades: 23 },
  { month: 'Feb', pnl: -400, trades: 18 },
  { month: 'Mar', pnl: 2100, trades: 31 },
  { month: 'Apr', pnl: 800, trades: 25 },
  { month: 'May', pnl: 1600, trades: 28 },
  { month: 'Jun', pnl: 2200, trades: 35 },
];

const assetAllocation = [
  { name: 'HYPE', value: 35, color: '#818cf8' },
  { name: 'BTC', value: 25, color: '#f59e0b' },
  { name: 'ETH', value: 20, color: '#6366f1' },
  { name: 'SOL', value: 12, color: '#10b981' },
  { name: 'Other', value: 8, color: '#64748b' },
];

export default function Analytics() {
  const { positions, trades } = useStore();
  const [timeframe, setTimeframe] = useState('30d');

  const stats = {
    totalTrades: 247,
    winRate: 68.5,
    avgWin: 125.50,
    avgLoss: -68.30,
    profitFactor: 2.34,
    maxDrawdown: -8.5,
    sharpeRatio: 1.82,
    expectancy: 57.20,
    totalPnL: positions.reduce((sum, p) => sum + p.unrealizedPnl, 0),
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analytics
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Deep dive into your trading performance</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl bg-white/5">
          {['7d', '30d', '90d', 'All'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Trades', value: stats.totalTrades, color: 'text-white' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-emerald-400' },
          { label: 'Avg Win', value: formatCurrency(stats.avgWin), color: 'text-emerald-400' },
          { label: 'Avg Loss', value: formatCurrency(stats.avgLoss), color: 'text-rose-400' },
          { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), color: 'text-indigo-400' },
          { label: 'Max Drawdown', value: `${stats.maxDrawdown}%`, color: 'text-rose-400' },
          { label: 'Sharpe Ratio', value: stats.sharpeRatio.toFixed(2), color: 'text-purple-400' },
          { label: 'Expectancy', value: formatCurrency(stats.expectancy), color: 'text-cyan-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 text-center"
          >
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Performance Over Time</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Win/Loss Ratio</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {winLossData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-400">{item.name}</span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Monthly PnL</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Asset Allocation</h2>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {assetAllocation.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Trading Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, label: 'Best Trade', value: '+$1,245.00', color: 'text-emerald-400' },
            { icon: AlertTriangle, label: 'Worst Trade', value: '-$432.00', color: 'text-rose-400' },
            { icon: Clock, label: 'Avg Hold Time', value: '4h 32m', color: 'text-indigo-400' },
            { icon: Award, label: 'Consecutive Wins', value: '12', color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
