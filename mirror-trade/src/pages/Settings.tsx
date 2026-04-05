import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Wallet, Sliders, Moon, Sun, Monitor, Save } from 'lucide-react';
import { useStore } from '@/stores/store';

export default function SettingsPage() {
  const { userSettings, setUserSettings } = useStore();
  const [activeTab, setActiveTab] = useState('trading');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'trading', label: 'Trading', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Wallet },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Settings
          </span>
        </h1>
        <p className="text-gray-400 mt-1">Manage your account and trading preferences</p>
      </motion.div>

      <div className="flex gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 shrink-0"
        >
          <nav className="glass rounded-2xl p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-6"
        >
          {activeTab === 'trading' && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Sliders className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">Trading Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slippage Tolerance
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={userSettings.slippageTolerance}
                      onChange={(e) => setUserSettings({ slippageTolerance: parseFloat(e.target.value) })}
                      className="flex-1 accent-indigo-500"
                    />
                    <span className="w-16 text-right font-mono text-indigo-400">
                      {userSettings.slippageTolerance}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Position Size Mode
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setUserSettings({ positionSizeMode: 'fixed' })}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        userSettings.positionSizeMode === 'fixed'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Fixed Amount
                    </button>
                    <button
                      onClick={() => setUserSettings({ positionSizeMode: 'proportional' })}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        userSettings.positionSizeMode === 'proportional'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Proportional
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {userSettings.positionSizeMode === 'fixed' ? 'Fixed Amount (USD)' : 'Proportional (%)'}
                  </label>
                  <input
                    type="number"
                    value={userSettings.positionSizeMode === 'fixed' ? userSettings.fixedAmount : userSettings.proportionalPercent}
                    onChange={(e) => {
                      if (userSettings.positionSizeMode === 'fixed') {
                        setUserSettings({ fixedAmount: parseFloat(e.target.value) });
                      } else {
                        setUserSettings({ proportionalPercent: parseFloat(e.target.value) });
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Stop Loss
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={userSettings.defaultStopLoss}
                        onChange={(e) => setUserSettings({ defaultStopLoss: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Take Profit
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={userSettings.defaultTakeProfit}
                        onChange={(e) => setUserSettings({ defaultTakeProfit: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Position Size (USD)
                  </label>
                  <input
                    type="number"
                    value={userSettings.maxPositionSize}
                    onChange={(e) => setUserSettings({ maxPositionSize: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {saved ? (
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      ✓ Saved!
                    </motion.div>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
              </div>
              
              <p className="text-gray-400">Notification settings coming soon...</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">Security Settings</h2>
              </div>
              
              <p className="text-gray-400">Security settings coming soon...</p>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">API Key Management</h2>
              </div>
              
              <p className="text-gray-400">API key management coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
