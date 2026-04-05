import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Trader } from '@/types';
import { useStore } from '@/stores/store';

interface SettingsModalProps {
  trader: Trader;
  onClose: () => void;
}

export function SettingsModal({ trader, onClose }: SettingsModalProps) {
  const { userSettings, traderSettings, setTraderSettings, setUserSettings } = useStore();
  
  const settings = traderSettings[trader.id] || userSettings;
  
  const handleSave = (updates: Partial<typeof settings>) => {
    setTraderSettings(trader.id, updates);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-mono font-semibold text-white">Trade Settings</h2>
            <p className="text-xs text-gray-500">{trader.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slippage Tolerance
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={settings.slippageTolerance}
                onChange={(e) => handleSave({ slippageTolerance: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
              />
              <span className="font-mono text-sm text-primary w-12">
                {settings.slippageTolerance}%
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position Size Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSave({ positionSizeMode: 'fixed' })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  settings.positionSizeMode === 'fixed'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-transparent border-border text-gray-400 hover:border-gray-600'
                }`}
              >
                Fixed Amount
              </button>
              <button
                onClick={() => handleSave({ positionSizeMode: 'proportional' })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  settings.positionSizeMode === 'proportional'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-transparent border-border text-gray-400 hover:border-gray-600'
                }`}
              >
                Proportional
              </button>
            </div>
          </div>
          
          {settings.positionSizeMode === 'fixed' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fixed Amount (USD)
              </label>
              <input
                type="number"
                value={settings.fixedAmount}
                onChange={(e) => handleSave({ fixedAmount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-white font-mono focus:border-primary focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Percentage of Wallet
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={settings.proportionalPercent}
                  onChange={(e) => handleSave({ proportionalPercent: parseFloat(e.target.value) })}
                  className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                />
                <span className="font-mono text-sm text-primary w-12">
                  {settings.proportionalPercent}%
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stop Loss
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.defaultStopLoss}
                  onChange={(e) => handleSave({ defaultStopLoss: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white font-mono text-sm focus:border-primary focus:outline-none"
                />
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Take Profit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.defaultTakeProfit}
                  onChange={(e) => handleSave({ defaultTakeProfit: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white font-mono text-sm focus:border-primary focus:outline-none"
                />
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Position Size (USD)
            </label>
            <input
              type="number"
              value={settings.maxPositionSize}
              onChange={(e) => handleSave({ maxPositionSize: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-white font-mono focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
