import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CalculatorPage() {
  const [values, setValues] = useState({
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
    const rewardRiskRatio = priceDistance > 0 ? Math.abs(values.takeProfit - values.entryPrice) / priceDistance : 0;

    return { riskAmount, positionSize, positionValue, potentialReward, rewardRiskRatio };
  };

  const results = calculate();

  return (
    <div className="space-y-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Calculator</h1>
        <p className="text-sm text-[#666]">Calculate position size based on risk</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="hl-card p-4 space-y-4">
          <h2 className="text-sm font-medium text-white">Input Parameters</h2>
          
          <div>
            <label className="hl-label">Account Balance ($)</label>
            <input
              type="number"
              value={values.accountBalance}
              onChange={(e) => setValues({ ...values, accountBalance: parseFloat(e.target.value) || 0 })}
              className="hl-input"
            />
          </div>

          <div>
            <label className="hl-label">Risk Per Trade (%)</label>
            <input
              type="number"
              value={values.riskPercent}
              onChange={(e) => setValues({ ...values, riskPercent: parseFloat(e.target.value) || 0 })}
              className="hl-input"
              step="0.5"
            />
            <div className="flex gap-2 mt-2">
              {[0.5, 1, 2, 5].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setValues({ ...values, riskPercent: pct })}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    values.riskPercent === pct
                      ? 'bg-[#00d4ff] text-black'
                      : 'bg-[#1f1f24] text-[#999] hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="hl-label">Entry Price</label>
              <input
                type="number"
                value={values.entryPrice}
                onChange={(e) => setValues({ ...values, entryPrice: parseFloat(e.target.value) || 0 })}
                className="hl-input"
              />
            </div>
            <div>
              <label className="hl-label text-[#ff3366]">Stop Loss</label>
              <input
                type="number"
                value={values.stopLoss}
                onChange={(e) => setValues({ ...values, stopLoss: parseFloat(e.target.value) || 0 })}
                className="hl-input border-[#ff3366]/30 focus:border-[#ff3366]/50"
              />
            </div>
            <div>
              <label className="hl-label text-[#00ff88]">Take Profit</label>
              <input
                type="number"
                value={values.takeProfit}
                onChange={(e) => setValues({ ...values, takeProfit: parseFloat(e.target.value) || 0 })}
                className="hl-input border-[#00ff88]/30 focus:border-[#00ff88]/50"
              />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="hl-card p-4">
            <h3 className="text-xs text-[#666] mb-2">Position Size</h3>
            <p className="text-3xl font-mono font-bold text-white">{results.positionSize.toFixed(6)}</p>
            <p className="text-xs text-[#666]">units</p>
          </div>

          <div className="hl-card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666]">Risk Amount</span>
              <span className="text-sm font-mono text-[#ff3366]">${results.riskAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666]">Position Value</span>
              <span className="text-sm font-mono text-white">${results.positionValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666]">Potential Loss</span>
              <span className="text-sm font-mono text-[#ff3366]">${results.riskAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666]">Potential Reward</span>
              <span className="text-sm font-mono text-[#00ff88]">${results.potentialReward.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-[#2a2a2e] flex justify-between items-center">
              <span className="text-sm font-medium text-white">Reward:Risk</span>
              <span className="text-lg font-mono font-bold text-[#00d4ff]">{results.rewardRiskRatio.toFixed(2)}:1</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
