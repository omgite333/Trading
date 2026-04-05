import React, { useState } from 'react';
import { Wallet, Key, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useStore } from '@/stores/store';
import { ApiKeyModal } from './ApiKeyModal';

export function WalletButton() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent" />
              <span className="font-mono text-sm text-white">
                {walletAddress && formatAddress(walletAddress)}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                  <div className="p-3 border-b border-border">
                    <p className="text-xs text-gray-500">Connected Wallet</p>
                    <p className="font-mono text-sm text-white mt-1">
                      {walletAddress && formatAddress(walletAddress)}
                    </p>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowApiModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                    >
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">API Keys</span>
                    </button>
                    
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger/10 text-left"
                    >
                      <LogOut className="w-4 h-4 text-danger" />
                      <span className="text-sm text-danger">Disconnect</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-background font-medium hover:bg-primary/90 transition-all"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </div>
      
      {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}
    </>
  );
}
