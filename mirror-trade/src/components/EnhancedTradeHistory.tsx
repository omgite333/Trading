import React, { useState } from 'react';
import { Filter, Download, Search, ChevronDown } from 'lucide-react';
import type { Trade } from '@/types';
import { formatCurrency, formatNumber, formatTime } from '@/lib/hyperliquid';

interface TradeHistoryProps {
  trades: Trade[];
  allTrades?: Trade[];
}

export function EnhancedTradeHistory({ trades, allTrades = [] }: TradeHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const displayTrades = allTrades.length > 0 ? allTrades : trades;
  
  const assets = ['all', ...new Set(displayTrades.map(t => t.asset))];
  
  const filteredTrades = displayTrades.filter(trade => {
    if (search && !trade.traderName.toLowerCase().includes(search.toLowerCase()) &&
        !trade.asset.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (assetFilter !== 'all' && trade.asset !== assetFilter) {
      return false;
    }
    return true;
  });

  const stats = {
    total: filteredTrades.length,
    wins: filteredTrades.filter(t => t.side === 'Long').length,
    losses: filteredTrades.filter(t => t.side === 'Short').length,
    totalVolume: filteredTrades.reduce((sum, t) => sum + t.price * t.size, 0),
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-semibold text-white">Trade History</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trader or asset..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-white text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:border-primary focus:outline-none"
          >
            {assets.map(asset => (
              <option key={asset} value={asset}>
                {asset === 'all' ? 'All Assets' : asset}
              </option>
            ))}
          </select>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 pt-2">
            {(['all', 'won', 'lost'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-background'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xs text-gray-500">Total Trades</p>
            <p className="font-mono font-semibold text-white">{stats.total}</p>
          </div>
          <div className="p-3 rounded-lg bg-success/10">
            <p className="text-xs text-success">Long</p>
            <p className="font-mono font-semibold text-success">{stats.wins}</p>
          </div>
          <div className="p-3 rounded-lg bg-danger/10">
            <p className="text-xs text-danger">Short</p>
            <p className="font-mono font-semibold text-danger">{stats.losses}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <p className="text-xs text-primary">Volume</p>
            <p className="font-mono font-semibold text-primary">${formatNumber(stats.totalVolume / 1000, 1)}K</p>
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        {filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No trades found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-background/50 sticky top-0">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left p-3 font-medium">Time</th>
                <th className="text-left p-3 font-medium">Trader</th>
                <th className="text-left p-3 font-medium">Asset</th>
                <th className="text-left p-3 font-medium">Side</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Size</th>
                <th className="text-right p-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <span className="font-mono text-xs text-gray-500">
                      {formatTime(trade.timestamp)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-white">{trade.traderName}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">
                      {trade.asset}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      trade.side === 'Long' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm text-white">
                      ${formatNumber(trade.price, 4)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm text-gray-300">
                      {formatNumber(trade.size, 4)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm text-gray-300">
                      ${formatNumber(trade.price * trade.size, 2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
