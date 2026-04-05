import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, TrendingUp, TrendingDown, Search, Filter, Download, Calendar, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '@/stores/store';
import { formatCurrency, formatNumber } from '@/lib/hyperliquid';

export default function HistoryPage() {
  const { trades, positions } = useStore();
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const closedPositions = positions.slice(0, 5).map(p => ({
    ...p,
    closedAt: Date.now() - Math.random() * 86400000 * 7,
    status: p.unrealizedPnl >= 0 ? 'profit' : 'loss'
  }));

  const allHistory = [
    ...trades.map(t => ({ ...t, type: 'trade' as const })),
    ...closedPositions.map(p => ({ ...p, type: 'position' as const }))
  ].sort((a, b) => (b.timestamp || b.closedAt || 0) - (a.timestamp || a.closedAt || 0));

  const filteredHistory = allHistory.filter(item => {
    if (search && !('asset' in item) || !item.asset) return false;
    if (assetFilter !== 'all' && item.asset !== assetFilter) return false;
    return true;
  });

  const assets = ['all', ...new Set(allHistory.filter(i => 'asset' in i).map(i => i.asset))];

  const stats = {
    totalTrades: trades.length + closedPositions.length,
    totalVolume: trades.reduce((sum, t) => sum + t.price * t.size, 0),
    winRate: closedPositions.length > 0 ? (closedPositions.filter(p => p.status === 'profit').length / closedPositions.length) * 100 : 0,
    totalPnL: closedPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0)
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            History
          </span>
        </h1>
        <p className="text-gray-400 mt-1">View your trading history and performance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Trades', value: stats.totalTrades, icon: History },
          { label: 'Trading Volume', value: `$${formatNumber(stats.totalVolume / 1000)}K`, icon: TrendingUp },
          { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, icon: TrendingUp },
          { label: 'Realized PnL', value: formatCurrency(stats.totalPnL), icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
            <p className={`text-2xl font-bold ${stat.label.includes('PnL') ? (stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Transaction History</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none"
                />
              </div>
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                {assets.map(a => (
                  <option key={a} value={a}>{a === 'all' ? 'All Assets' : a}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-white/10">
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Asset</th>
                <th className="text-left p-4 font-medium">Side</th>
                <th className="text-right p-4 font-medium">Price</th>
                <th className="text-right p-4 font-medium">Size</th>
                <th className="text-right p-4 font-medium">Value</th>
                <th className="text-right p-4 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, i) => (
                <motion.tr
                  key={`${item.id}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">
                        {new Date(item.timestamp || item.closedAt || 0).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      'side' in item ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {'side' in item ? 'Trade' : 'Closed'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-white">{'asset' in item ? item.asset : 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    {'side' in item && (
                      <span className={`flex items-center gap-1 text-sm ${item.side === 'Long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.side === 'Long' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {item.side}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-mono text-white">{'price' in item ? `$${item.price.toFixed(2)}` : '-'}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-mono text-gray-400">{item.size.toFixed(4)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-mono text-white">${((item as any).price * item.size || 0).toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-right">
                    {'unrealizedPnl' in item && (
                      <span className={`font-mono font-medium ${item.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(item.unrealizedPnl)}
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No history found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
