import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, Check, ExternalLink, ChevronDown, LogOut } from 'lucide-react';
import { useWallet, SUPPORTED_CHAINS } from '@/hooks/useWallet';

export function WalletButton() {
  const {
    address,
    chainId,
    balance,
    isConnected,
    isConnecting,
    isMetaMaskInstalled,
    connect,
    disconnect,
    formattedAddress,
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);
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
    <div className="relative">
      {isConnected ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f24] border border-[#2a2a2e] rounded hover:bg-[#2a2a2e] transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-[#00d4ff] flex items-center justify-center">
              <span className="text-[8px] font-bold text-black">
                {address?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-white font-mono">{formattedAddress}</span>
            <ChevronDown className={`w-3 h-3 text-[#666] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#131316] border border-[#2a2a2e] rounded-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-[#2a2a2e]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#666]">Connected</span>
                      {chainName && (
                        <span className="px-1.5 py-0.5 rounded bg-[#1f1f24] text-[#00d4ff] text-[10px]">
                          {chainName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-mono flex-1 truncate">{address}</p>
                      <button onClick={copyAddress} className="p-1 rounded hover:bg-white/5 text-[#999]">
                        {copied ? <Check className="w-3 h-3 text-[#00ff88]" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-white/5 text-[#999]">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {balance && <p className="text-xs text-[#666] mt-1">{balance} ETH</p>}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { disconnect(); setShowDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-[#ff3366] hover:bg-[#ff3366]/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
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
          className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff] text-black text-sm font-medium rounded hover:bg-[#00bce0] transition-colors disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      )}
    </div>
  );
}
