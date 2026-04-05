import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, Settings, Key, Copy, Check } from 'lucide-react';
import { useStore } from '@/stores/store';

export function WalletButton() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  return (
    <>
      <div className="relative">
        {isConnected ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
              <span className="font-mono text-sm text-white">
                {walletAddress && formatAddress(walletAddress)}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10">
                      <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-white flex-1">
                          {walletAddress && formatAddress(walletAddress)}
                        </p>
                        <button
                          onClick={copyAddress}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowApiModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors"
                      >
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">API Keys</span>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span className="text-sm text-rose-400">Disconnect</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </div>
    </>
  );
}
