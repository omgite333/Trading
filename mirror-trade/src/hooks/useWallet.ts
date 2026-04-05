import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/stores/store';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
    };
  }
}

interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useStore();
  const [state, setState] = useState<WalletState>({
    address: walletAddress,
    chainId: null,
    balance: null,
    isConnecting: false,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        setState(prev => ({
          ...prev,
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnecting: false,
        }));
        connectWallet();
      }
    } catch (error) {
      console.error('Check connection error:', error);
    }
  }, [connectWallet]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const balance = await window.ethereum.request({ 
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      }) as string;

      setState(prev => ({
        ...prev,
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        balance: (parseInt(balance, 16) / 1e18).toFixed(4),
        isConnecting: false,
      }));

      connectWallet();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect',
      }));
    }
  }, [connectWallet]);

  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      address: null,
      chainId: null,
      balance: null,
      error: null,
    }));
    disconnectWallet();
  }, [disconnectWallet]);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        setState(prev => ({ ...prev, error: 'Network not found. Please add it to MetaMask.' }));
      } else {
        setState(prev => ({ ...prev, error: error.message }));
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs.length === 0) {
          disconnect();
        } else {
          setState(prev => ({ ...prev, address: accs[0] }));
        }
      });

      window.ethereum.on('chainChanged', (chainId: unknown) => {
        setState(prev => ({ ...prev, chainId: parseInt(chainId as string, 16) }));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [checkConnection, disconnect]);

  const formatAddress = useCallback((address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;

  return {
    ...state,
    isConnected: !!state.address,
    isMetaMaskInstalled,
    connect,
    disconnect,
    switchNetwork,
    formattedAddress: state.address ? formatAddress(state.address) : null,
  };
}

export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
  42161: { name: 'Arbitrum One', symbol: 'ETH', explorer: 'https://arbiscan.io' },
  10: { name: 'Optimism', symbol: 'ETH', explorer: 'https://optimistic.etherscan.io' },
  8453: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' },
  137: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
};
