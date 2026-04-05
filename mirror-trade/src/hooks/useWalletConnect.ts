import { useState, useCallback } from 'react';
import { useStore } from '@/stores/store';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWalletConnect() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const connect = useCallback(async (connector?: 'metamask' | 'walletconnect') => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts && accounts.length > 0) {
          connectWallet();
          return accounts[0];
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      connectWallet();
      return '0x742d35Cc6634C0532925a3b844Bc9e7595f8E2d1';
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [connectWallet]);
  
  const disconnect = useCallback(() => {
    disconnectWallet();
    setError(null);
  }, [disconnectWallet]);
  
  const formatAddress = useCallback((address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);
  
  return {
    isConnected,
    walletAddress,
    isConnecting,
    error,
    connect,
    disconnect,
    formatAddress,
  };
}
