import { useState, useCallback } from 'react';
import { useStore } from '@/stores/store';

export function useWallet() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    connectWallet();
    setIsConnecting(false);
  }, [connectWallet]);
  
  const disconnect = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);
  
  return {
    isConnected,
    walletAddress,
    isConnecting,
    connect,
    disconnect,
  };
}
