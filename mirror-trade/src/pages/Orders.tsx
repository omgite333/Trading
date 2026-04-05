import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, X, History, ListOrdered } from 'lucide-react';
import { useWalletStore } from '@/stores/walletStore';
import { useTrading } from '@/hooks/useTrading';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const { orders, trades, totalPnl } = useWalletStore();
  const { cancelOrder } = useTrading();

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  const openOrders = orders.filter(o => o.status === 'open' || o.status === 'partial');
  const filledOrders = orders.filter(o => o.status === 'filled');

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Orders</h1>
        <p className="text-sm text-[#666]">View and manage your orders</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Open Orders</p>
          <p className="text-lg font-mono font-semibold text-white">{openOrders.length}</p>
        </div>
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Total Trades</p>
          <p className="text-lg font-mono font-semibold text-white">{trades.length}</p>
        </div>
        <div className="hl-card p-3">
          <p className="text-[10px] text-[#666] uppercase">Realized PnL</p>
          <p className={`text-lg font-mono font-semibold ${totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
          <div className="flex gap-1 p-1 bg-[#0a0a0b] rounded mb-3 w-fit">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'open' ? 'bg-[#1f1f24] text-white' : 'text-[#666] hover:text-white'
              }`}
            >
              Open Orders ({openOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'history' ? 'bg-[#1f1f24] text-white' : 'text-[#666] hover:text-white'
              }`}
            >
              Order History ({filledOrders.length})
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
                  <th className="text-right table-cell text-[10px] uppercase text-[#666]">Total</th>
                  <th className="text-right table-cell text-[10px] uppercase text-[#666]">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'open' ? (
                  openOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="table-cell text-center py-12">
                        <ListOrdered className="w-8 h-8 text-[#333] mx-auto mb-2" />
                        <p className="text-sm text-[#666]">No open orders</p>
                      </td>
                    </tr>
                  ) : (
                    openOrders.map((order) => (
                      <tr key={order.id} className="border-t border-[#2a2a2e] hover:bg-white/5">
                        <td className="table-cell">
                          <div className="flex items-center gap-1.5 text-[#666]">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="text-sm font-medium text-white">
                            {order.symbol.replace('USDT', '')}
                          </span>
                          <span className="text-[#666] text-xs ml-1">USDT</span>
                        </td>
                        <td className="table-cell">
                          <span className="px-2 py-0.5 bg-[#1f1f24] rounded text-[10px] text-white">
                            {order.type}
                          </span>
                        </td>
                        <td className={`table-cell text-sm font-medium ${order.side === 'BUY' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                          {order.side}
                        </td>
                        <td className="table-cell text-right text-sm font-mono text-white">
                          ${formatPrice(order.price)}
                        </td>
                        <td className="table-cell text-right text-sm font-mono text-white">
                          {order.quantity}
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 h-1 bg-[#2a2a2e] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00d4ff] rounded-full"
                                style={{ width: `${(order.filled / order.quantity) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#666] w-8">
                              {((order.filled / order.quantity) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="table-cell text-right text-sm font-mono text-white">
                          ${formatPrice(order.price * order.quantity)}
                        </td>
                        <td className="table-cell text-right">
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="p-1.5 rounded hover:bg-[#ff3366]/10 text-[#666] hover:text-[#ff3366] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  filledOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="table-cell text-center py-12">
                        <History className="w-8 h-8 text-[#333] mx-auto mb-2" />
                        <p className="text-sm text-[#666]">No order history</p>
                      </td>
                    </tr>
                  ) : (
                    filledOrders.map((order) => (
                      <tr key={order.id} className="border-t border-[#2a2a2e] hover:bg-white/5">
                        <td className="table-cell text-[#666] text-xs">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="table-cell text-sm text-white">
                          {order.symbol.replace('USDT', '')}/USDT
                        </td>
                        <td className="table-cell">
                          <span className="px-2 py-0.5 bg-[#1f1f24] rounded text-[10px] text-white">
                            {order.type}
                          </span>
                        </td>
                        <td className={`table-cell text-sm ${order.side === 'BUY' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                          {order.side}
                        </td>
                        <td className="table-cell text-right font-mono text-white">
                          ${formatPrice(order.price)}
                        </td>
                        <td className="table-cell text-right font-mono text-white">
                          {order.quantity}
                        </td>
                        <td className="table-cell text-right font-mono text-[#00ff88]">
                          {order.quantity} (100%)
                        </td>
                        <td className="table-cell text-right font-mono text-white">
                          ${formatPrice(order.price * order.quantity)}
                        </td>
                        <td className="table-cell text-right">
                          <span className="text-[10px] px-2 py-0.5 bg-[#00ff88]/10 text-[#00ff88] rounded">
                            Filled
                          </span>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Trades */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-64">
          <div className="hl-card p-3">
            <h3 className="text-xs font-medium text-[#666] mb-2">Recent Trades</h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {trades.slice(0, 20).map((trade, i) => (
                <div key={trade.id || i} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${trade.side === 'BUY' ? 'bg-[#00ff88]' : 'bg-[#ff3366]'}`} />
                    <span className="text-xs text-[#666]">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className={`text-xs font-mono ${trade.side === 'BUY' ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {trade.side}
                  </span>
                  <span className="text-xs font-mono text-white">
                    ${trade.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-[#999]">
                    {trade.quantity}
                  </span>
                  {trade.realizedPnl !== undefined && (
                    <span className={`text-xs font-mono ${trade.realizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                      {trade.realizedPnl >= 0 ? '+' : ''}{trade.realizedPnl.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
              {trades.length === 0 && (
                <p className="text-xs text-[#666] text-center py-4">No trades yet</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
