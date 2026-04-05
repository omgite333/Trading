import React, { useEffect, useState } from 'react';
import { Terminal, TrendingUp, TrendingDown, Zap, Clock } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'trade' | 'signal' | 'error' | 'info';
}

export function ExecutionLog({ logs }: { logs: string[] }) {
  const [autoScroll, setAutoScroll] = useState(true);
  
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="font-mono font-semibold text-white">Execution Log</h3>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded border-gray-600 bg-background"
          />
          Auto-scroll
        </label>
      </div>
      
      <div className="h-[200px] overflow-y-auto scrollbar-thin p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Waiting for signals...</p>
          </div>
        ) : (
          logs.map((log, i) => {
            let icon = <Clock className="w-3 h-3 text-gray-500" />;
            let color = 'text-gray-400';
            
            if (log.includes('✅')) {
              icon = <TrendingUp className="w-3 h-3 text-success" />;
              color = 'text-success';
            } else if (log.includes('❌')) {
              icon = <TrendingDown className="w-3 h-3 text-danger" />;
              color = 'text-danger';
            } else if (log.includes('🐋')) {
              icon = <Zap className="w-3 h-3 text-primary" />;
              color = 'text-primary';
            } else if (log.includes('⏭️')) {
              icon = <Clock className="w-3 h-3 text-accent" />;
              color = 'text-accent';
            }
            
            return (
              <div
                key={i}
                className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 ${color}`}
              >
                {icon}
                <span className="flex-1">{log}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
