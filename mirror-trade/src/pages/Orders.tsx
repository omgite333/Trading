import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Clock, TrendingUp, TrendingDown, X, Edit3, Copy } from 'lucide-react';
import { binance, type Trade } from '@/lib/binance';

interface OpenOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_LOSS';
  price: number;
  quantity: number;
  filled: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  createdAt: number;
}

const mockOrders: OpenOrder[] = [
  { id: '1', symbol: 'BTCUSDT', side: 'BUY', type: 'LIMIT', price: 95000, quantity: 0.5, filled: 0.25, status: 'partial', createdAt: Date.now() - 3600000 },
  { id: '2', symbol: 'ETHUSDT', side: 'SELL', type: 'LIMIT', price: 3500, quantity: 2, filled: 0, status: 'open', createdAt: Date.now() - 7200000 },
  { id: '3', symbol: 'SOLUSDT', side: 'BUY', type: 'STOP_LOSS', price: 165, quantity: 10, filled: 0, status: 'open', createdAt: Date.now() - 1800000 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OpenOrder[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  useEffect(() => {
    loadRecentTrades();
  }, []);

  const loadRecentTrades = async () => {
    try {
      const trades = await binance.getRecentTrades('BTCUSDT', 20);
      setRecentTrades(trades);
    } catch (error) {
      console.error('Failed to load trades:', error);
    }
  };

  const cancelOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const openOrders = orders.filter(o => o.status === 'open' || o.status === 'partial');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Orders
          </span>
        </h1>
        <p className="text-gray-400 mt-1">Manage your open orders and trade history</p>
      </motion.div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 p-1 rounded-xl bg-white/5">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'open'
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Open Orders ({openOrders.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'history'
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Order History
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              {activeTab === 'open' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase border-b border-white/10">
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Pair</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Side</th>
                        <th className="text-right p-4 font-medium">Price</th>
                        <th className="text-right p-4 font-medium">Amount</th>
                        <th className="text-right p-4 font-medium">Filled</th>
                        <th className="text-right p-4 font-medium">Total</th>
                        <th className="text-right p-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-12 text-center text-gray-500">
                            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No open orders</p>
                          </td>
                        </tr>
                      ) : (
                        openOrders.map((order, i) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Clock className="w-4 h-4" />
                                {formatTime(order.createdAt)}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-white">{order.symbol.replace('USDT', '')}</span>
                              <span className="text-gray-500 ml-1">/USDT</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                order.type === 'LIMIT' ? 'bg-blue-500/10 text-blue-400' :
                                order.type === 'MARKET' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-amber-500/10 text-amber-400'
                              }`}>
                                {order.type}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`flex items-center gap-1 font-medium ${
                                order.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {order.side === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {order.side}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono text-white">
                              ${formatPrice(order.price)}
                            </td>
                            <td className="p-4 text-right font-mono text-white">
                              {order.quantity}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${(order.filled / order.quantity) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-400">
                                  {((order.filled / order.quantity) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right font-mono text-white">
                              ${formatPrice(order.price * order.quantity)}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => cancelOrder(order.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="p-12 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Order history will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-80 shrink-0"
        >
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Trades</h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-hide">
              {recentTrades.map((trade, i) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${trade.isBuyerMaker ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                    <span className="text-sm text-gray-400">{formatTime(trade.time)}</span>
                  </div>
                  <span className={`font-mono text-sm ${trade.isBuyerMaker ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ${trade.price.toFixed(2)}
                  </span>
                  <span className="font-mono text-sm text-gray-400">
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
