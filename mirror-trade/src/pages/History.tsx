import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useWalletStore } from '@/stores/walletStore';

export default function HistoryPage() {
  const { trades, totalPnl } = useWalletStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'trade' | 'close'>('all');

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      if (search && !trade.symbol.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter === 'trade' && trade.realizedPnl === undefined) return false;
      if (typeFilter === 'close' && trade.realizedPnl === undefined) return false;
      return true;
    });
  }, [trades, search, typeFilter]);

  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.realizedPnl !== undefined);
    const profitable = closedTrades.filter(t => (t.realizedPnl || 0) >= 0).length;
    const totalRealizedPnl = closedTrades.reduce((sum, t) => sum + (t.realizedPnl || 0), 0);
    
    return {
      totalTrades: trades.length,
      winRate: closedTrades.length > 0 ? (profitable / closedTrades.length) * 100 : 0,
      realizedPnl: totalRealizedPnl,
    };
  }, [trades]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">History</h1>
        <p className="text-sm text-[#666]">View your trading history</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Total Trades</p>
          <p className="text-lg font-mono font-semibold text-white">{stats.totalTrades}</p>
        </div>
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Win Rate</p>
          <p className={`text-lg font-mono font-semibold ${stats.winRate >= 50 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {stats.totalTrades > 0 ? stats.winRate.toFixed(1) : '0'}%
          </p>
        </div>
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Realized PnL</p>
          <p className={`text-lg font-mono font-semibold ${stats.realizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {stats.realizedPnl >= 0 ? '+' : ''}${stats.realizedPnl.toFixed(2)}
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hl-card overflow-hidden">
        <div className="p-3 border-b border-[#2a2a2e] flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-8 pr-3 py-1.5 bg-[#0a0a0b] border border-[#2a2a2e] rounded text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#00d4ff]/50 w-40"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'trade' | 'close')}
            className="px-3 py-1.5 bg-[#0a0a0b] border border-[#2a2a2e] rounded text-xs text-white focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="trade">Trades</option>
            <option value="close">Position Closures</option>
          </select>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1f1f24] border border-[#2a2a2e] rounded text-xs text-[#999] hover:text-white transition-colors ml-auto">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-[#0a0a0b]">
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Date</th>
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Type</th>
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Pair</th>
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Side</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Price</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Amount</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Fee</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">PnL</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-cell text-center py-12">
                  <HistoryIcon className="w-8 h-8 text-[#333] mx-auto mb-2" />
                  <p className="text-[#666] text-sm">No history found</p>
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade, i) => (
                <tr key={trade.id || i} className="border-t border-[#2a2a2e] hover:bg-white/5">
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5 text-[#666]">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-[10px]">
                        {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      trade.realizedPnl !== undefined
                        ? 'bg-[#a855f7]/10 text-[#a855f7]'
                        : 'bg-[#00d4ff]/10 text-[#00d4ff]'
                    }`}>
                      {trade.realizedPnl !== undefined ? 'Close' : 'Trade'}
                    </span>
                  </td>
                  <td className="table-cell text-sm font-medium text-white">
                    {trade.symbol.replace('USDT', '')}/USDT
                  </td>
                  <td className={`table-cell text-sm ${trade.side === 'BUY' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {trade.side}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-white">
                    ${formatPrice(trade.price)}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-[#999]">
                    {trade.quantity}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-[#666]">
                    ${trade.fee.toFixed(2)}
                  </td>
                  <td className="table-cell text-right">
                    {trade.realizedPnl !== undefined ? (
                      <span className={`text-sm font-mono ${(trade.realizedPnl || 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                        {(trade.realizedPnl || 0) >= 0 ? '+' : ''}{trade.realizedPnl?.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[#666] text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
