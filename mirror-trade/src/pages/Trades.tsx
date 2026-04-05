import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Star, Copy } from 'lucide-react';
import { useStore } from '@/stores/store';

export default function Trades() {
  const { traders, toggleFollow } = useStore();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Copy Trade</h1>
        <p className="text-sm text-[#666]">Follow and copy elite traders</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {traders.map((trader, index) => (
          <motion.div
            key={trader.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="hl-card p-4 hover:border-[#00d4ff]/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1f1f24] to-[#2a2a2e] flex items-center justify-center text-white text-sm font-medium">
                  {trader.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{trader.name}</p>
                  <p className="text-xs text-[#666] font-mono">{trader.address.slice(0, 8)}...{trader.address.slice(-6)}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(trader.id)}
                className={`p-1.5 rounded transition-colors ${
                  trader.isFollowing 
                    ? 'text-[#00d4ff] bg-[#00d4ff]/10' 
                    : 'text-[#666] hover:text-white hover:bg-white/5'
                }`}
              >
                <Star className={`w-4 h-4 ${trader.isFollowing ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-[#666] uppercase">PnL</p>
                <p className={`text-sm font-mono font-semibold ${trader.totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {trader.totalPnl >= 0 ? '+' : ''}${(trader.totalPnl / 1000).toFixed(1)}K
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#666] uppercase">Win Rate</p>
                <p className={`text-sm font-mono font-semibold ${trader.winRate >= 50 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {trader.winRate}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#666] uppercase">Followers</p>
                <p className="text-sm font-mono font-semibold text-white">
                  {formatNumber(trader.followers)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2e]">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#666]" />
                <span className="text-xs text-[#666]">{trader.copyFee}% copy fee</span>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-[#00d4ff] text-black text-xs font-medium rounded hover:bg-[#00bce0] transition-colors">
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>

            {trader.isActive && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#00ff88]/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="text-[10px] text-[#00ff88]">Active</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
