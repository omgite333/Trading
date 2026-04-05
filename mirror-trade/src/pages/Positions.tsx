import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X, Settings } from 'lucide-react';
import { useWalletStore } from '@/stores/walletStore';
import { useTrading } from '@/hooks/useTrading';

export default function Positions() {
  const { positions, totalPnl, balances } = useWalletStore();
  const { executeSell, coverShort } = useTrading();

  const usdtBalance = balances.find(b => b.asset === 'USDT')?.free || 0;

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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Total PnL</p>
          <p className={`text-lg font-mono font-semibold ${totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </p>
        </div>
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Open Positions</p>
          <p className="text-lg font-mono font-semibold text-white">{positions.length}</p>
        </div>
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Available Balance</p>
          <p className="text-lg font-mono font-semibold text-white">${usdtBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Positions Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hl-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0a0a0b]">
              <th className="text-left table-cell text-[10px] uppercase text-[#666]">Symbol</th>
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
            {positions.map((pos) => {
              const currentPrice = pos.currentPrice;
              const pnl = pos.unrealizedPnl;
              const pnlPercent = pos.unrealizedPnlPercent;

              return (
                <tr key={pos.id} className="border-t border-[#2a2a2e] hover:bg-white/5">
                  <td className="table-cell">
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
                        <p className="text-[10px] text-[#666]">USDT-M</p>
                      </div>
                    </div>
                  </td>
                  <td className={`table-cell text-sm font-medium ${pos.side === 'LONG' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {pos.side}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-white">
                    {pos.quantity}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-[#999]">
                    ${formatPrice(pos.entryPrice)}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-white">
                    ${formatPrice(currentPrice)}
                  </td>
                  <td className="table-cell text-right text-sm font-mono text-[#666]">
                    ${formatPrice(pos.side === 'LONG' ? pos.entryPrice * 0.95 : pos.entryPrice * 1.05)}
                  </td>
                  <td className={`table-cell text-right text-sm font-mono font-medium ${
                    pnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'
                  }`}>
                    <p>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</p>
                    <p className="text-[10px]">{formatPercent(pnlPercent)}</p>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-white/5 text-[#666] hover:text-white transition-colors" title="Settings">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (pos.side === 'LONG') {
                            executeSell(pos.symbol, pos.quantity, currentPrice);
                          } else {
                            coverShort(pos.symbol, pos.quantity, currentPrice);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-[#ff3366]/10 text-[#666] hover:text-[#ff3366] transition-colors"
                        title="Close"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {positions.length === 0 && (
              <tr>
                <td colSpan={8} className="table-cell text-center py-12">
                  <div className="text-[#666]">
                    <p className="text-sm">No open positions</p>
                    <p className="text-xs mt-1">Place a trade to see positions here</p>
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
