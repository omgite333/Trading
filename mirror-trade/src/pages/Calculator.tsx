import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Percent, Shield, Target, AlertTriangle, Info } from 'lucide-react';

interface PositionSize {
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
}

export default function CalculatorPage() {
  const [values, setValues] = useState<PositionSize>({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: 97500,
    stopLoss: 96000,
    takeProfit: 100000,
  });

  const calculate = () => {
    const riskAmount = values.accountBalance * (values.riskPercent / 100);
    const priceDistance = Math.abs(values.entryPrice - values.stopLoss);
    const positionSize = priceDistance > 0 ? riskAmount / priceDistance : 0;
    const positionValue = positionSize * values.entryPrice;
    const potentialReward = Math.abs(values.takeProfit - values.entryPrice) * positionSize;
    const rewardRiskRatio = priceDistance > 0 ? (values.takeProfit - values.entryPrice) / priceDistance : 0;
    const breakevenDistance = (positionValue * 0.001) / positionSize;

    return {
      riskAmount,
      positionSize,
      positionValue,
      potentialReward,
      rewardRiskRatio,
      breakevenDistance,
      breakevenPercent: values.entryPrice > 0 ? (breakevenDistance / values.entryPrice) * 100 : 0,
    };
  };

  const results = calculate();

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPercent = (value: number) => {
    return value.toFixed(2) + '%';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Position Calculator
          </span>
        </h1>
        <p className="text-gray-400 mt-1">Calculate optimal position size based on your risk management</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Input Parameters</h2>
              <p className="text-xs text-gray-500">Configure your trade parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                Account Balance
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={values.accountBalance}
                  onChange={(e) => setValues({ ...values, accountBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">USD</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Percent className="w-4 h-4 text-gray-500" />
                Risk Per Trade
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={values.riskPercent}
                  onChange={(e) => setValues({ ...values, riskPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[0.5, 1, 2, 5].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setValues({ ...values, riskPercent: pct })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      values.riskPercent === pct
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Entry Price</label>
                <input
                  type="number"
                  value={values.entryPrice}
                  onChange={(e) => setValues({ ...values, entryPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Shield className="w-3 h-3" /> Stop Loss
                  </span>
                </label>
                <input
                  type="number"
                  value={values.stopLoss}
                  onChange={(e) => setValues({ ...values, stopLoss: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-rose-500/20 text-white font-mono text-sm focus:outline-none focus:border-rose-500/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Target className="w-3 h-3" /> Take Profit
                  </span>
                </label>
                <input
                  type="number"
                  value={values.takeProfit}
                  onChange={(e) => setValues({ ...values, takeProfit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-emerald-500/20 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Position Size</h3>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-white font-mono">{results.positionSize.toFixed(6)}</p>
              <p className="text-gray-500 text-sm">units to buy/sell</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs text-rose-400 mb-1">Risk Amount</p>
                <p className="font-mono font-semibold text-rose-400">${formatCurrency(results.riskAmount)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Position Value</p>
                <p className="font-mono font-semibold text-white">${formatCurrency(results.positionValue)}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Risk/Reward Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-400">Potential Loss</span>
                </div>
                <span className="font-mono font-semibold text-rose-400">${formatCurrency(results.riskAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-400">Potential Reward</span>
                </div>
                <span className="font-mono font-semibold text-emerald-400">${formatCurrency(results.potentialReward)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-gray-400">Reward:Risk Ratio</span>
                </div>
                <span className="font-mono font-bold text-indigo-400">{results.rewardRiskRatio.toFixed(2)}:1</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <p className="text-sm text-gray-400 mb-2">Breakeven After Fees</p>
            <p className="text-2xl font-bold text-white font-mono">
              ${values.entryPrice.toLocaleString()} → ${(values.entryPrice + results.breakevenDistance).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">+{formatPercent(results.breakevenPercent)} from entry</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
