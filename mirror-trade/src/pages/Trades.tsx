import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowUpDown, TrendingUp, TrendingDown, Star, Eye, X, Settings, Users, ChevronDown } from 'lucide-react';
import { useStore } from '@/stores/store';
import { formatCurrency, formatPercent } from '@/lib/hyperliquid';

export default function Trades() {
  const { traders, toggleFollow } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'pnl' | 'winRate' | 'followers'>('pnl');
  const [filter, setFilter] = useState<'all' | 'following'>('all');
  const [selectedTrader, setSelectedTrader] = useState<typeof traders[0] | null>(null);

  const filteredTraders = traders
    .filter(t => {
      if (filter === 'following' && !t.isFollowing) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'pnl') return b.totalPnl - a.totalPnl;
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      return b.followers - a.followers;
    });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Copy Trading
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Follow top traders and mirror their positions</p>
        </div>
      </motion.div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search traders..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
            >
              <option value="all">All Traders</option>
              <option value="following">Following</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
            >
              <option value="pnl">Sort by PnL</option>
              <option value="winRate">Sort by Win Rate</option>
              <option value="followers">Sort by Followers</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTraders.map((trader, index) => (
              <motion.div
                key={trader.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all cursor-pointer"
                onClick={() => setSelectedTrader(trader)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {trader.name.slice(0, 2).toUpperCase()}
                      </div>
                      {trader.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{trader.name}</h3>
                      <p className="text-xs text-gray-500 font-mono">{trader.address.slice(0, 8)}...{trader.address.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total PnL</p>
                    <p className={`text-lg font-bold ${trader.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trader.totalPnl >= 0 ? '+' : ''}{formatCurrency(trader.totalPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                    <p className={`text-lg font-bold ${trader.winRate >= 60 ? 'text-emerald-400' : trader.winRate >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {trader.winRate}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {formatCurrency(trader.followers)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {trader.copyFee}%
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(trader.id);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      trader.isFollowing
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                    }`}
                  >
                    {trader.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedTrader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTrader(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-strong rounded-2xl p-6 w-full max-w-md"
            >
              <button
                onClick={() => setSelectedTrader(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {selectedTrader.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedTrader.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{selectedTrader.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">PnL</p>
                  <p className={`font-bold ${selectedTrader.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(selectedTrader.totalPnl)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                  <p className="font-bold text-white">{selectedTrader.winRate}%</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Followers</p>
                  <p className="font-bold text-white">{formatCurrency(selectedTrader.followers)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleFollow(selectedTrader.id);
                  setSelectedTrader(null);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                {selectedTrader.isFollowing ? 'Unfollow' : 'Start Copying'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
