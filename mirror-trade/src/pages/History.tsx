import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '@/stores/store';

export default function HistoryPage() {
  const { trades, positions } = useStore();
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');

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
    }));

    const tradesList = trades.slice(0, 20).map((t, i) => ({
      id: `trade-${t.id}-${i}`,
      timestamp: t.timestamp,
      type: 'trade' as const,
      asset: t.asset,
      side: t.side,
      price: t.price,
      size: t.size,
    }));

    return [...tradesList, ...closedPositions].sort((a, b) => b.timestamp - a.timestamp);
  }, [trades, positions]);

  const filteredHistory = historyData.filter(item => {
    if (search && !item.asset.toLowerCase().includes(search.toLowerCase())) return false;
    if (assetFilter !== 'all' && item.asset !== assetFilter) return false;
    return true;
  });

  const uniqueAssets = ['all', ...new Set(historyData.map(i => i.asset))];

  const stats = useMemo(() => {
    const closedItems = historyData.filter(i => i.type === 'position');
    const profitable = closedItems.filter(p => (p.pnl || 0) >= 0).length;
    const totalPnL = closedItems.reduce((sum, p) => sum + (p.pnl || 0), 0);
    return {
      totalTrades: historyData.length,
      winRate: closedItems.length > 0 ? (profitable / closedItems.length) * 100 : 0,
      totalPnL,
    };
  }, [historyData]);

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
            {stats.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Total PnL</p>
          <p className={`text-lg font-mono font-semibold ${stats.totalPnL >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
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
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="hl-select text-xs py-1.5"
          >
            {uniqueAssets.map(a => (
              <option key={a} value={a}>{a === 'all' ? 'All Assets' : a}</option>
            ))}
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
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Asset</th>
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Side</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Price</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Size</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">PnL</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-cell text-center py-12">
                  <HistoryIcon className="w-8 h-8 text-[#333] mx-auto mb-2" />
                  <p className="text-[#666] text-sm">No history found</p>
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, i) => (
                <tr key={item.id} className="border-t border-[#2a2a2e] hover:bg-white/5">
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5 text-[#666]">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      item.type === 'trade' ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'bg-[#a855f7]/10 text-[#a855f7]'
                    }`}>
                      {item.type === 'trade' ? 'Trade' : 'Closed'}
                    </span>
                  </td>
                  <td className="table-cell text-sm font-medium text-white">{item.asset}</td>
                  <td className={`table-cell text-sm ${item.side === 'Long' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {item.side}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-white">${formatPrice(item.price)}</td>
                  <td className="table-cell text-right text-sm font-mono text-[#999]">{item.size}</td>
                  <td className="table-cell text-right">
                    {item.pnl !== undefined && (
                      <span className={`text-sm font-mono ${(item.pnl || 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                        {(item.pnl || 0) >= 0 ? '+' : ''}${(item.pnl || 0).toFixed(2)}
                      </span>
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
