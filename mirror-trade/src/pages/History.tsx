import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, TrendingUp, TrendingDown, Search, Download, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useStore } from '@/stores/store';
import { formatCurrency, formatNumber } from '@/lib/hyperliquid';

interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'trade' | 'position';
  asset: string;
  side: 'Long' | 'Short';
  price: number;
  size: number;
  pnl?: number;
  status: 'profit' | 'loss' | 'open';
}

export default function HistoryPage() {
  const { trades, positions, initMockData } = useStore();
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [sideFilter, setSideFilter] = useState<'all' | 'Long' | 'Short'>('all');

  const historyData = useMemo(() => {
    const closedPositions = positions.slice(0, 10).map((p, i) => ({
      id: `closed-${p.id}-${i}`,
      timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 30),
      type: 'position' as const,
      asset: p.asset,
      side: p.side,
      price: p.entryPrice,
      size: p.size,
      pnl: p.unrealizedPnl,
      status: p.unrealizedPnl >= 0 ? 'profit' as const : 'loss' as const,
    }));

    const tradesList = trades.slice(0, 20).map((t, i) => ({
      id: `trade-${t.id}-${i}`,
      timestamp: t.timestamp,
      type: 'trade' as const,
      asset: t.asset,
      side: t.side,
      price: t.price,
      size: t.size,
      status: 'open' as const,
    }));

    return [...tradesList, ...closedPositions].sort((a, b) => b.timestamp - a.timestamp);
  }, [trades, positions]);

  const filteredHistory = useMemo(() => {
    return historyData.filter(item => {
      if (search && !item.asset.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (assetFilter !== 'all' && item.asset !== assetFilter) {
        return false;
      }
      if (sideFilter !== 'all' && item.side !== sideFilter) {
        return false;
      }
      return true;
    });
  }, [historyData, search, assetFilter, sideFilter]);

  const uniqueAssets = useMemo(() => {
    return ['all', ...new Set(historyData.map(i => i.asset))];
  }, [historyData]);

  const stats = useMemo(() => {
    const closedItems = historyData.filter(i => i.type === 'position');
    const totalVolume = historyData.reduce((sum, t) => sum + t.price * t.size, 0);
    const profitable = closedItems.filter(p => p.status === 'profit').length;
    const totalPnL = closedItems.reduce((sum, p) => sum + (p.pnl || 0), 0);

    return {
      totalTrades: historyData.length,
      totalVolume,
      winRate: closedItems.length > 0 ? (profitable / closedItems.length) * 100 : 0,
      totalPnL,
      profitableTrades: profitable,
      totalClosed: closedItems.length,
    };
  }, [historyData]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
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
              History
            </span>
          </h1>
          <p className="text-gray-400 mt-1">View your trading history and performance</p>
        </div>
        <button
          onClick={initMockData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-sm text-gray-500">Total Trades</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-gray-500">Trading Volume</p>
          </div>
          <p className="text-2xl font-bold text-white">${formatNumber(stats.totalVolume / 1000)}K</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-500">Win Rate</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.totalClosed > 0 ? stats.winRate.toFixed(1) : '0'}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.profitableTrades}/{stats.totalClosed} trades</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.totalPnL >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
              {stats.totalPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <p className="text-sm text-gray-500">Realized PnL</p>
          </div>
          <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(stats.totalPnL)}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
                  placeholder="Search asset..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              >
                {uniqueAssets.map(a => (
                  <option key={a} value={a}>{a === 'all' ? 'All Assets' : a}</option>
                ))}
              </select>
              <select
                value={sideFilter}
                onChange={(e) => setSideFilter(e.target.value as 'all' | 'Long' | 'Short')}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              >
                <option value="all">All Sides</option>
                <option value="Long">Long</option>
                <option value="Short">Short</option>
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
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No history found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or refresh the data</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'trade' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {item.type === 'trade' ? 'Trade' : 'Closed'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-white">{item.asset}</span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-sm ${item.side === 'Long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.side === 'Long' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {item.side}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono text-white">${formatPrice(item.price)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono text-gray-400">{item.size.toFixed(4)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono text-white">${formatPrice(item.price * item.size)}</span>
                    </td>
                    <td className="p-4 text-right">
                      {item.pnl !== undefined ? (
                        <span className={`font-mono font-medium ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
