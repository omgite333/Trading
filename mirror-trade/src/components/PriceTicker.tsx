import React, { useState, useEffect } from 'react';
import { binance, type Ticker } from '@/lib/binance';

export function PriceTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([]);

  useEffect(() => {
    const loadTickers = async () => {
      const data = await binance.getTickers();
      const top = data.filter(t => t.quoteVolume24h > 100000000).slice(0, 8);
      setTickers(top);
    };

    loadTickers();
    const interval = setInterval(loadTickers, 10000);

    binance.subscribeToTicker('BTCUSDT', () => {});
    binance.subscribeToTicker('ETHUSDT', () => {});

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  return (
    <div className="h-10 bg-[#0a0a0b] border-t border-[#2a2a2e] overflow-x-auto">
      <div className="flex items-center h-full px-4 gap-6">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-white">
              {ticker.symbol.replace('USDT', '')}
            </span>
            <span className="text-xs font-mono text-white">
              ${formatPrice(ticker.price)}
            </span>
            <span className={`text-[10px] font-mono ${(ticker.changePercent24h || 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
              {(ticker.changePercent24h || 0) >= 0 ? '+' : ''}{(ticker.changePercent24h || 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
