import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { binance, type Ticker } from '@/lib/binance';

export function PriceTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadTickers();
    
    const interval = setInterval(loadTickers, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadTickers = async () => {
    try {
      const data = await binance.getTickers();
      setTickers(data.slice(0, 15));
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to load tickers:', error);
      setIsConnected(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10">
      <div className="flex items-center">
        <div className="px-4 py-3 border-r border-white/10">
          <span className="text-xs text-gray-500 font-medium">MARKETS</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center">
            {tickers.map((ticker) => (
              <div
                key={ticker.symbol}
                className="flex items-center gap-2 px-4 py-3 border-r border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="font-medium text-white text-sm">
                  {ticker.symbol.replace('USDT', '')}
                </span>
                <span className="font-mono text-white text-sm">
                  ${formatPrice(ticker.price)}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${
                  ticker.changePercent24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {ticker.changePercent24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {ticker.changePercent24h >= 0 ? '+' : ''}{ticker.changePercent24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 border-l border-white/10">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-500">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
}
