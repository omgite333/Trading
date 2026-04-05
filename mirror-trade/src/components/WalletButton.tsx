import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, Settings, Key, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { useWallet, SUPPORTED_CHAINS } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';

export function WalletButton() {
  const {
    address,
    chainId,
    balance,
    isConnected,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connect,
    disconnect,
    formattedAddress,
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const chainName = chainId ? SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]?.name : null;

  return (
    <>
      <div className="relative">
        {isConnected ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {address?.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <span className="font-mono text-sm text-white block">
                  {formattedAddress}
                </span>
                {balance && (
                  <span className="text-[10px] text-gray-400">
                    {balance} ETH
                  </span>
                )}
              </div>
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
                    className="absolute right-0 top-full mt-2 w-72 glass-strong rounded-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Connected Wallet</p>
                        {chainName && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                            {chainName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-white flex-1 truncate">
                          {address}
                        </p>
                        <button
                          onClick={copyAddress}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Copy Address"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={`https://etherscan.io/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="View on Etherscan"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {balance && (
                        <p className="text-sm text-gray-400 mt-1">
                          Balance: <span className="text-white font-mono">{balance} ETH</span>
                        </p>
                      )}
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
                      
                      <Link
                        to="/settings"
                        onClick={() => setShowDropdown(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">Settings</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          disconnect();
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
            onClick={connect}
            disabled={isConnecting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" />
            {isConnecting ? 'Connecting...' : isMetaMaskInstalled ? 'Connect Wallet' : 'Install MetaMask'}
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 p-3 glass-strong rounded-xl border border-rose-500/30 z-50"
        >
          <div className="flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </motion.div>
      )}
    </>
  );
}
