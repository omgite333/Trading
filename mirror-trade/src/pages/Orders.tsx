import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, X, Link2 } from 'lucide-react';
import { binance, type Trade } from '@/lib/binance';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  useEffect(() => {
    binance.getRecentTrades('BTCUSDT', 20).then(setRecentTrades).catch(console.error);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Orders</h1>
        <p className="text-sm text-[#666]">View and manage your orders</p>
      </motion.div>

      <div className="flex gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
          <div className="flex gap-1 p-1 bg-[#0a0a0b] rounded mb-3 w-fit">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'open' ? 'bg-[#1f1f24] text-white' : 'text-[#666] hover:text-white'
              }`}
            >
              Open Orders
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'history' ? 'bg-[#1f1f24] text-white' : 'text-[#666] hover:text-white'
              }`}
            >
              Order History
            </button>
          </div>

          <div className="hl-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0a0a0b]">
                  <th className="text-left table-cell text-[10px] uppercase text-[#666]">Time</th>
                  <th className="text-left table-cell text-[10px] uppercase text-[#666]">Pair</th>
                  <th className="text-left table-cell text-[10px] uppercase text-[#666]">Type</th>
                  <th className="text-left table-cell text-[10px] uppercase text-[#666]">Side</th>
                  <th className="text-right table-cell text-[10px] uppercase text-[#666]">Price</th>
                  <th className="text-right table-cell text-[10px] uppercase text-[#666]">Amount</th>
                  <th className="text-right table-cell text-[10px] uppercase text-[#666]">Filled</th>
                  <th className="text-right table-cell text-[10px] uppercase text-[#666]">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'open' ? (
                  <tr>
                    <td colSpan={8} className="table-cell text-center py-12">
                      <div className="text-[#666] flex flex-col items-center">
                        <Link2 className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No open orders</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={8} className="table-cell text-center py-12">
                      <div className="text-[#666] flex flex-col items-center">
                        <Clock className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No order history</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-64">
          <div className="hl-card p-3">
            <h3 className="text-xs font-medium text-[#666] mb-2">Recent Trades</h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {recentTrades.map((trade, i) => (
                <div key={trade.id || i} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${trade.isBuyerMaker ? 'bg-[#ff3366]' : 'bg-[#00ff88]'}`} />
                    <span className="text-xs text-[#666]">
                      {new Date(trade.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`text-xs font-mono ${trade.isBuyerMaker ? 'text-[#ff3366]' : 'text-[#00ff88]'}`}>
                    ${trade.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-[#999]">
                    {trade.quantity.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
