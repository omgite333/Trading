import React from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw } from 'lucide-react';
import { useStore } from '@/stores/store';

export default function SettingsPage() {
  const { userSettings, setUserSettings } = useStore();

  const handleSave = () => {
    console.log('Settings saved:', userSettings);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-[#666]">Configure your copy trading preferences</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hl-card p-4 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-white mb-3">Risk Management</h2>
          <div className="space-y-3">
            <div>
              <label className="hl-label">Default Stop Loss %</label>
              <input
                type="number"
                value={userSettings.defaultStopLoss}
                onChange={(e) => setUserSettings({ defaultStopLoss: parseFloat(e.target.value) || 0 })}
                className="hl-input"
                step="0.5"
              />
            </div>
            <div>
              <label className="hl-label">Default Take Profit %</label>
              <input
                type="number"
                value={userSettings.defaultTakeProfit}
                onChange={(e) => setUserSettings({ defaultTakeProfit: parseFloat(e.target.value) || 0 })}
                className="hl-input"
                step="0.5"
              />
            </div>
            <div>
              <label className="hl-label">Max Position Size ($)</label>
              <input
                type="number"
                value={userSettings.maxPositionSize}
                onChange={(e) => setUserSettings({ maxPositionSize: parseFloat(e.target.value) || 0 })}
                className="hl-input"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#2a2a2e] pt-4">
          <h2 className="text-sm font-medium text-white mb-3">Position Sizing</h2>
          <div className="space-y-3">
            <div>
              <label className="hl-label">Slippage Tolerance (%)</label>
              <input
                type="number"
                value={userSettings.slippageTolerance}
                onChange={(e) => setUserSettings({ slippageTolerance: parseFloat(e.target.value) || 0 })}
                className="hl-input"
                step="0.1"
              />
            </div>
            <div>
              <label className="hl-label">Position Size Mode</label>
              <select
                value={userSettings.positionSizeMode}
                onChange={(e) => setUserSettings({ positionSizeMode: e.target.value as 'fixed' | 'proportional' })}
                className="hl-select"
              >
                <option value="proportional">Proportional (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            {userSettings.positionSizeMode === 'fixed' ? (
              <div>
                <label className="hl-label">Fixed Amount ($)</label>
                <input
                  type="number"
                  value={userSettings.fixedAmount}
                  onChange={(e) => setUserSettings({ fixedAmount: parseFloat(e.target.value) || 0 })}
                  className="hl-input"
                />
              </div>
            ) : (
              <div>
                <label className="hl-label">Proportional Percent (%)</label>
                <input
                  type="number"
                  value={userSettings.proportionalPercent}
                  onChange={(e) => setUserSettings({ proportionalPercent: parseFloat(e.target.value) || 0 })}
                  className="hl-input"
                  step="0.5"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff] text-black text-sm font-medium rounded hover:bg-[#00bce0] transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
