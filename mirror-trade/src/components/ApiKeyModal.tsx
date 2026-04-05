import React from 'react';
import { X, ExternalLink, Key, AlertTriangle, Check } from 'lucide-react';
import { useStore } from '@/stores/store';

interface ApiKeyModalProps {
  onClose: () => void;
}

export function ApiKeyModal({ onClose }: ApiKeyModalProps) {
  const { isConnected, walletAddress } = useStore();
  const [apiKey, setApiKey] = React.useState('');
  const [signingKey, setSigningKey] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('mirror-trade-api-key', apiKey);
    localStorage.setItem('mirror-trade-signing-key', signingKey);
    setIsSaving(false);
    onClose();
  };
  
  const handleGenerateSigningKey = () => {
    const newKey = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setSigningKey(newKey);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-mono font-semibold text-white">API Key Management</h2>
              <p className="text-xs text-gray-500">Configure Hyperliquid API access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-danger mt-0.5" />
              <div className="text-sm">
                <p className="text-danger font-medium">Security Warning</p>
                <p className="text-gray-400 text-xs mt-1">
                  Your API keys allow trading but NOT withdrawals. Never share your keys with untrusted parties.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Address
            </label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-background border border-border">
              <span className="font-mono text-sm text-white">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
              </span>
              {isConnected && <Check className="w-4 h-4 text-success ml-auto" />}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key (Main)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Hyperliquid API key"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white font-mono text-sm focus:border-primary focus:outline-none pr-20"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded text-xs text-gray-400 hover:text-white"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Signing Key
            </label>
            <div className="relative">
              <input
                type="text"
                value={signingKey}
                onChange={(e) => setSigningKey(e.target.value)}
                placeholder="Generate or enter signing key"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white font-mono text-sm focus:border-primary focus:outline-none pr-28"
                readOnly
              />
              <button
                onClick={handleGenerateSigningKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded text-xs bg-primary/20 text-primary hover:bg-primary/30"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Create a signing key on Hyperliquid with trading permissions only
            </p>
          </div>
          
          <div className="pt-2">
            <a
              href="https://app.hyperliquid.xyz/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Get API keys from Hyperliquid
              <ExternalLink className="w-3 h-3" />
            </a>
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
            onClick={handleSave}
            disabled={isSaving || !apiKey || !signingKey}
            className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}
