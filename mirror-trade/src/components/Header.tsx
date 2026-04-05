import React from 'react';
import { TrendingUp } from 'lucide-react';
import { WalletButton } from './WalletButton';
import { NotificationCenter } from './NotificationCenter';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-tight">MirrorTrade</h1>
              <p className="text-xs text-gray-500">Hyperliquid Copy Trading</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-sm text-primary font-medium relative group">
              Dashboard
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Traders</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Positions</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">History</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Analytics</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <NotificationCenter />
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
