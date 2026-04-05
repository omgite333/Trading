import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, TrendingUp, TrendingDown, Shield, Target, AlertTriangle, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/stores/store';

const ASSETS = [
  { symbol: 'HYPE', name: 'Hyperliquid', price: 35.42, change: 5.23 },
  { symbol: 'BTC', name: 'Bitcoin', price: 97542.50, change: 1.87 },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: -2.34 },
  { symbol: 'SOL', name: 'Solana', price: 178.90, change: 3.45 },
  { symbol: 'ARB', name: 'Arbitrum', price: 1.23, change: -0.56 },
];

export default function TradePage() {
  const { traders } = useStore();
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [side, setSide] = useState<'Long' | 'Short'>('Long');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(selectedAsset.price.toString());
  const [slippage, setSlippage] = useState(0.5);
  const [leverage, setLeverage] = useState(1);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const parsedPrice = parseFloat(price) || 0;
  const total = parsedAmount * parsedPrice;
  const fees = total * 0.001;
  const finalTotal = total + fees;

  const sizeInUsd = parsedAmount * parsedPrice;
  const liquidationPrice = side === 'Long'
    ? parsedPrice * (1 - 1 / leverage * 0.8)
    : parsedPrice * (1 + 1 / leverage * 0.8);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          to="/"
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trade
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Place a manual trade order</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Select Asset</label>
            <div className="relative">
              <button
                onClick={() => setShowAssetPicker(!showAssetPicker)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {selectedAsset.symbol.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{selectedAsset.symbol}</p>
                    <p className="text-xs text-gray-500">{selectedAsset.name}</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {showAssetPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 glass-strong rounded-xl z-10">
                  {ASSETS.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setPrice(asset.price.toString());
                        setShowAssetPicker(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <span className="font-medium text-white">{asset.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-white">${asset.price}</p>
                        <p className={`text-xs ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {asset.change >= 0 ? '+' : ''}{asset.change}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setSide('Long')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                  side === 'Long'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Long
              </button>
              <button
                onClick={() => setSide('Short')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                  side === 'Short'
                    ? 'bg-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Short
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Order Type</label>
            <div className="flex rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  orderType === 'limit'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Limit
              </button>
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  orderType === 'market'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Market
              </button>
            </div>
          </div>

          {orderType === 'limit' && (
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Price</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">USD</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
              placeholder="0.00"
            />
            <div className="flex gap-2 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setAmount(((10000 / parsedPrice) * pct / 100).toFixed(4))}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Leverage</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <span className="w-12 text-center font-mono text-indigo-400">{leverage}x</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              side === 'Long'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-lg hover:shadow-rose-500/25'
            }`}
          >
            {side === 'Long' ? 'Long' : 'Short'} {selectedAsset.symbol}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Asset</span>
                <span className="text-white font-medium">{selectedAsset.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Side</span>
                <span className={side === 'Long' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {side === 'Long' ? '↑ Long' : '↓ Short'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Order Type</span>
                <span className="text-white font-medium capitalize">{orderType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price</span>
                <span className="text-white font-mono">${parsedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-mono">{parsedAmount.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Leverage</span>
                <span className="text-indigo-400 font-mono">{leverage}x</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-mono">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Est. Fees (0.1%)</span>
                  <span className="text-white font-mono">${fees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Slippage Tolerance</span>
                  <span className="text-white font-mono">{slippage}%</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold font-mono">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Management</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Liquidation Price</p>
                  <p className="font-mono font-semibold text-white">${liquidationPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Max Loss at Liquidation</p>
                  <p className="font-mono font-semibold text-rose-400">-${(total * 0.8).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Take Profit / Stop Loss</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Take Profit</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">USD</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Stop Loss</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-rose-500/50"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">USD</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
