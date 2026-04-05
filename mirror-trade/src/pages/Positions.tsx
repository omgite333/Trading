import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X, Settings } from 'lucide-react';
import { useStore } from '@/stores/store';

export default function Positions() {
  const { positions } = useStore();

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  const formatPercent = (num: number) => {
    return num >= 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Positions</h1>
        <p className="text-sm text-[#666]">Manage your open positions</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hl-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0a0a0b]">
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Asset</th>
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Side</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Size</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Entry</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Mark</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Liq. Price</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">PnL</th>
              <th className="text-right table-cell text-[10px] uppercase text-[#666]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.id} className="border-t border-[#2a2a2e] hover:bg-white/5">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      pos.side === 'Long' ? 'bg-[#00ff88]/10' : 'bg-[#ff3366]/10'
                    }`}>
                      {pos.side === 'Long' ? (
                        <TrendingUp className="w-3 h-3 text-[#00ff88]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-[#ff3366]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{pos.asset}</p>
                      <p className="text-[10px] text-[#666]">{pos.traderName}</p>
                    </div>
                  </div>
                </td>
                <td className={`table-cell text-sm font-medium ${pos.side === 'Long' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {pos.side}
                </td>
                <td className="table-cell text-right text-sm font-mono text-white">
                  {pos.size}
                </td>
                <td className="table-cell text-right text-sm font-mono text-[#999]">
                  ${formatPrice(pos.entryPrice)}
                </td>
                <td className="table-cell text-right text-sm font-mono text-white">
                  ${formatPrice(pos.currentPrice)}
                </td>
                <td className="table-cell text-right text-sm font-mono text-[#666]">
                  ${formatPrice(pos.currentPrice * (pos.side === 'Long' ? 0.95 : 1.05))}
                </td>
                <td className={`table-cell text-right text-sm font-mono font-medium ${
                  pos.unrealizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'
                }`}>
                  <p>{pos.unrealizedPnl >= 0 ? '+' : ''}${Math.abs(pos.unrealizedPnl).toFixed(2)}</p>
                  <p className="text-[10px]">{formatPercent(pos.pnlPercent)}</p>
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded hover:bg-white/5 text-[#666] hover:text-white transition-colors" title="Settings">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-[#ff3366]/10 text-[#666] hover:text-[#ff3366] transition-colors" title="Close">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={8} className="table-cell text-center py-12">
                  <div className="text-[#666]">
                    <p className="text-sm">No open positions</p>
                    <p className="text-xs mt-1">Start trading or copy a trader to see positions here</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
