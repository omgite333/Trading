import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, TrendingUp, TrendingDown, X, ExternalLink, Shield, Target, Clock, MoreVertical } from 'lucide-react';
import { useStore } from '@/stores/store';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/hyperliquid';
import type { Position } from '@/types';

export default function Positions() {
  const { positions } = useStore();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [filter, setFilter] = useState<'all' | 'profit' | 'loss'>('all');

  const filteredPositions = positions.filter(p => {
    if (filter === 'profit') return p.unrealizedPnl >= 0;
    if (filter === 'loss') return p.unrealizedPnl < 0;
    return true;
  });

  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Positions
          </span>
        </h1>
        <p className="text-gray-400 mt-1">Manage your active copied positions</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Positions</p>
              <p className="text-2xl font-bold text-white">{positions.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${totalPnl >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'} flex items-center justify-center`}>
              {totalPnl >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
            </div>
            <div>
              <p className="text-sm text-gray-500">Unrealized PnL</p>
              <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(totalPnl)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-white">
                {positions.length > 0 ? Math.round((positions.filter(p => p.unrealizedPnl >= 0).length / positions.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Positions</h2>
            <div className="flex gap-2">
              {(['all', 'profit', 'loss'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPositions.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No active positions</p>
            <p className="text-sm text-gray-600">Follow traders to start copying positions</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedPosition(position)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      position.side === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {position.side === 'Long' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">{position.asset}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          position.side === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {position.side}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">via {position.traderName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Entry</p>
                      <p className="font-mono text-white">${position.entryPrice.toFixed(4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Current</p>
                      <p className="font-mono text-white">${position.currentPrice.toFixed(4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="font-mono text-white">{position.size.toFixed(4)}</p>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-gray-500">PnL</p>
                      <p className={`font-mono font-bold ${position.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(position.unrealizedPnl)}
                      </p>
                      <p className={`text-xs ${position.pnlPercent >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                        {formatPercent(position.pnlPercent)}
                      </p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    SL: ${position.stopLoss?.toFixed(2) || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    TP: ${position.takeProfit?.toFixed(2) || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.floor((Date.now() - position.openedAt) / 60000)}m ago
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPosition(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass-strong rounded-2xl p-6 w-full max-w-lg"
            >
              <button
                onClick={() => setSelectedPosition(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  selectedPosition.side === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {selectedPosition.side === 'Long' ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedPosition.asset}</h3>
                  <p className="text-gray-500">{selectedPosition.side} Position</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-500 mb-1">Entry Price</p>
                  <p className="font-mono text-xl text-white">${selectedPosition.entryPrice.toFixed(4)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-500 mb-1">Current Price</p>
                  <p className="font-mono text-xl text-white">${selectedPosition.currentPrice.toFixed(4)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-500 mb-1">Size</p>
                  <p className="font-mono text-xl text-white">{selectedPosition.size.toFixed(4)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-500 mb-1">Unrealized PnL</p>
                  <p className={`font-mono text-xl font-bold ${selectedPosition.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(selectedPosition.unrealizedPnl)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl bg-rose-500/10 text-rose-400 font-medium hover:bg-rose-500/20 transition-colors">
                  Close Position
                </button>
                <button className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors">
                  Modify SL/TP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
