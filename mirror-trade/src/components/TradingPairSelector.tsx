import React, { useState } from 'react';
import { ChevronDown, Search, Star, TrendingUp } from 'lucide-react';

const ASSETS = [
  { symbol: 'HYPE', name: 'Hyperliquid', price: 35.42, change: 5.23 },
  { symbol: 'BTC', name: 'Bitcoin', price: 97542.50, change: 1.87 },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: -2.34 },
  { symbol: 'SOL', name: 'Solana', price: 178.90, change: 3.45 },
  { symbol: 'ARB', name: 'Arbitrum', price: 1.23, change: -0.56 },
  { symbol: 'OP', name: 'Optimism', price: 2.45, change: 1.23 },
  { symbol: 'MATIC', name: 'Polygon', price: 0.89, change: -1.12 },
  { symbol: 'AVAX', name: 'Avalanche', price: 35.67, change: 2.34 },
];

interface TradingPairSelectorProps {
  selected?: string[];
  onChange: (pairs: string[]) => void;
}

export function TradingPairSelector({ selected = [], onChange }: TradingPairSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredAssets = ASSETS.filter(
    a => a.symbol.toLowerCase().includes(search.toLowerCase()) ||
         a.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAsset = (symbol: string) => {
    if (selected.includes(symbol)) {
      onChange(selected.filter(s => s !== symbol));
    } else {
      onChange([...selected, symbol]);
    }
  };

  const selectedAssets = ASSETS.filter(a => selected.includes(a.symbol));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all"
      >
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-sm text-white">
          {selected.length === 0 ? 'All Pairs' : `${selected.length} Selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pairs..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-white text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => toggleAsset(asset.symbol)}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border ${
                      selected.includes(asset.symbol)
                        ? 'bg-primary border-primary'
                        : 'border-gray-600'
                    } flex items-center justify-center`}>
                      {selected.includes(asset.symbol) && (
                        <Star className="w-3 h-3 text-background" fill="currentColor" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{asset.symbol}</p>
                      <p className="text-xs text-gray-500">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-white">${asset.price.toLocaleString()}</p>
                    <p className={`font-mono text-xs ${asset.change >= 0 ? 'text-success' : 'text-danger'}`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {selected.length > 0 && (
              <div className="p-3 border-t border-border bg-background/50">
                <button
                  onClick={() => onChange([])}
                  className="w-full py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
