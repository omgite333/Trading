import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, ArrowUpRight, ArrowDownRight, Zap, Eye, EyeOff } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useStore } from '@/stores/store';
import { formatCurrency, formatNumber } from '@/lib/hyperliquid';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const chartData = Array.from({ length: 24 }, (_, i) => ({
  value: 100 + Math.sin(i * 0.3) * 10 + Math.random() * 5,
  volume: Math.random() * 1000,
}));

export default function Dashboard() {
  const { traders, positions, trades } = useStore();
  const followingTraders = traders.filter(t => t.isFollowing);
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  
  const stats = [
    { label: 'Portfolio Value', value: '$12,458.32', change: '+12.45%', positive: true, icon: DollarSign },
    { label: 'Total PnL', value: formatCurrency(totalPnl), change: totalPnl >= 0 ? '+8.2%' : '-3.1%', positive: totalPnl >= 0, icon: totalPnl >= 0 ? TrendingUp : TrendingDown },
    { label: 'Active Copiers', value: formatNumber(followingTraders.length), change: '+2 today', positive: true, icon: Users },
    { label: 'Copy Volume', value: '$45,231', change: '+23.5%', positive: true, icon: Activity },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome back
          </span>
        </h1>
        <p className="text-gray-400">Here's your copy trading overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={item}
            className="glass rounded-2xl p-6 hover-lift"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stat.positive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.positive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Performance</h2>
              <p className="text-sm text-gray-500">24h portfolio value</p>
            </div>
            <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
              <option>24h</option>
              <option>7d</option>
              <option>30d</option>
              <option>All</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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

        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top Traders</h2>
          <div className="space-y-3">
            {traders.slice(0, 5).map((trader, i) => (
              <div key={trader.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {trader.name.slice(0, 2).toUpperCase()}
                  </div>
                  {i === 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] text-black font-bold">
                      1
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{trader.name}</p>
                  <p className="text-xs text-gray-500">{formatNumber(trader.followers)} followers</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${trader.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trader.totalPnl >= 0 ? '+' : ''}${(trader.totalPnl / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-gray-500">{trader.winRate}% WR</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {trades.slice(0, 5).map((trade, i) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  trade.side === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {trade.side === 'Long' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-medium">{trade.traderName}</span>
                    <span className="text-gray-500"> {trade.side.toLowerCase()}</span>
                    <span className="text-indigo-400 font-medium ml-1">{trade.asset}</span>
                  </p>
                  <p className="text-xs text-gray-500">${trade.price.toFixed(2)} × {trade.size}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: 'Find Traders', color: 'from-indigo-500 to-indigo-600' },
              { icon: Eye, label: 'Watch List', color: 'from-purple-500 to-purple-600' },
              { icon: Activity, label: 'Copy Trade', color: 'from-pink-500 to-pink-600' },
              { icon: DollarSign, label: 'Deposit', color: 'from-emerald-500 to-emerald-600' },
            ].map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-3`}
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
