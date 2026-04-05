import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, Wallet, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/stores/store';
import { useWalletStore } from '@/stores/walletStore';
import { useTrading } from '@/hooks/useTrading';

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
  const { traders, trades } = useStore();
  const { balances, positions, totalPnl } = useWalletStore();
  const { getBalance } = useTrading();
  
  const usdtBalance = getBalance('USDT');
  const followingTraders = traders.filter(t => t.isFollowing);
  const unrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  
  const stats = [
    { label: 'Portfolio Value', value: `$${(usdtBalance + unrealizedPnl).toFixed(2)}`, change: '+12.45%', positive: true, icon: DollarSign },
    { label: 'Total PnL', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, change: totalPnl >= 0 ? '+8.2%' : '-3.1%', positive: totalPnl >= 0, icon: totalPnl >= 0 ? TrendingUp : TrendingDown },
    { label: 'Active Copiers', value: followingTraders.length.toString(), change: '+2 today', positive: true, icon: Users },
    { label: 'Open Positions', value: positions.length.toString(), change: `${positions.length > 0 ? 'Active' : 'None'}`, positive: positions.length > 0, icon: Activity },
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
              <span className={`text-xs font-mono ${stat.positive ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
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
            <h2 className="text-sm font-medium text-white">Wallet</h2>
            <Link to="/trade" className="text-xs text-[#00d4ff] hover:underline">Trade →</Link>
          </div>
          <div className="space-y-2">
            {balances.filter(b => b.free > 0).map((balance) => (
              <div key={balance.asset} className="flex items-center justify-between py-2 border-b border-[#2a2a2e] last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1f1f24] flex items-center justify-center text-white text-xs font-medium">
                    {balance.asset.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{balance.asset}</p>
                    <p className="text-xs text-[#666]">{balance.asset === 'USDT' ? 'USDT Balance' : 'Asset Balance'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium text-white">
                    {balance.asset === 'USDT' ? '$' : ''}{balance.free.toFixed(balance.asset === 'USDT' ? 2 : 4)}
                  </p>
                  {balance.locked > 0 && (
                    <p className="text-xs text-[#666]">Locked: {balance.locked.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="hl-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Open Positions</h2>
            <Link to="/positions" className="text-xs text-[#00d4ff] hover:underline">View All →</Link>
          </div>
          {positions.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 text-[#333] mx-auto mb-2" />
              <p className="text-sm text-[#666]">No open positions</p>
              <Link to="/trade" className="text-xs text-[#00d4ff] hover:underline mt-1 inline-block">Start Trading</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {positions.slice(0, 3).map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-2 bg-[#0a0a0b] rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      pos.side === 'LONG' ? 'bg-[#00ff88]/10' : 'bg-[#ff3366]/10'
                    }`}>
                      {pos.side === 'LONG' ? (
                        <TrendingUp className="w-3 h-3 text-[#00ff88]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-[#ff3366]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{pos.symbol.replace('USDT', '')}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="hl-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Top Traders</h2>
            <Link to="/trades" className="text-xs text-[#00d4ff] hover:underline">View All →</Link>
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
            <Link to="/history" className="text-xs text-[#00d4ff] hover:underline">View All →</Link>
          </div>
          <div className="space-y-2">
            {trades.slice(0, 6).map((trade, i) => (
              <div key={trade.id || i} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  trade.side === 'Long' || trade.side === 'BUY' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#ff3366]/10 text-[#ff3366]'
                }`}>
                  {trade.side === 'Long' || trade.side === 'BUY' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
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
    </motion.div>
  );
}
