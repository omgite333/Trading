import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart2, PieChart, Calendar } from 'lucide-react';

interface ChartData {
  time: string;
  value: number;
}

export function PerformanceChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');

  useEffect(() => {
    const generateData = () => {
      const now = Date.now();
      let points: ChartData[] = [];
      
      switch (timeframe) {
        case '1D':
          points = Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            value: 100 + Math.sin(i * 0.3) * 5 + Math.random() * 2,
          }));
          break;
        case '1W':
          points = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            time: day,
            value: 100 + Math.sin(Math.random() * 5) * 10 + Math.random() * 3,
          }));
          break;
        case '1M':
          points = Array.from({ length: 30 }, (_, i) => ({
            time: `Day ${i + 1}`,
            value: 100 + i * 0.5 + Math.random() * 5,
          }));
          break;
        case 'ALL':
          points = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
            time: month,
            value: 100 + Math.random() * 50 + Math.sin(Math.random() * 10) * 20,
          }));
          break;
      }
      
      setData(points);
    };
    
    generateData();
  }, [timeframe]);

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const current = values[values.length - 1];
  const start = values[0];
  const change = ((current - start) / start) * 100;
  const isPositive = change >= 0;

  const path = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 90 - ((d.value - min) / range) * 80;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = path + ` L 100 95 L 0 95 Z`;

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono font-semibold text-white">Performance</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-mono text-xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-background/50">
          {(['1D', '1W', '1M', 'ALL'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-background'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#00ff88' : '#ff3366'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? '#00ff88' : '#ff3366'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartGradient)" />
          <path 
            d={path} 
            fill="none" 
            stroke={isPositive ? '#00ff88' : '#ff3366'} 
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          <circle 
            cx="100" 
            cy={90 - ((current - min) / range) * 80} 
            r="1.5" 
            fill={isPositive ? '#00ff88' : '#ff3366'}
          />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-gray-500">High</p>
          <p className="font-mono text-sm text-white">{max.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-gray-500">Low</p>
          <p className="font-mono text-sm text-white">{min.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export function AllocationChart() {
  const allocations = [
    { name: 'HYPE', value: 35, color: '#00d4ff' },
    { name: 'BTC', value: 25, color: '#f7931a' },
    { name: 'ETH', value: 20, color: '#627eea' },
    { name: 'SOL', value: 15, color: '#00ffa3' },
    { name: 'Other', value: 5, color: '#bf5af2' },
  ];

  const total = allocations.reduce((sum, a) => sum + a.value, 0);
  let currentAngle = 0;

  const paths = allocations.map(a => {
    const angle = (a.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, startAngle + angle);
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return {
      ...a,
      path: `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`,
    };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="font-mono font-semibold text-white mb-4">Allocation</h3>
      
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.path}
                fill={p.color}
                className="transition-all hover:opacity-80"
              />
            ))}
          </svg>
        </div>
        
        <div className="flex-1 space-y-2">
          {allocations.map((a, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: a.color }} />
                <span className="text-sm text-white">{a.name}</span>
              </div>
              <span className="font-mono text-sm text-gray-400">{a.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsOverview() {
  const [stats] = useState({
    totalTrades: 247,
    winRate: 68.5,
    avgWin: 125.50,
    avgLoss: -68.30,
    profitFactor: 2.34,
    maxDrawdown: -8.5,
    sharpeRatio: 1.82,
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="font-mono font-semibold text-white mb-4">Statistics</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-gray-500">Total Trades</p>
          <p className="font-mono text-lg text-white">{stats.totalTrades}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-gray-500">Win Rate</p>
          <p className="font-mono text-lg text-success">{stats.winRate}%</p>
        </div>
        <div className="p-3 rounded-lg bg-success/10">
          <p className="text-xs text-success">Avg Win</p>
          <p className="font-mono text-lg text-success">${stats.avgWin}</p>
        </div>
        <div className="p-3 rounded-lg bg-danger/10">
          <p className="text-xs text-danger">Avg Loss</p>
          <p className="font-mono text-lg text-danger">${stats.avgLoss}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-gray-500">Profit Factor</p>
          <p className="font-mono text-lg text-primary">{stats.profitFactor}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-gray-500">Sharpe Ratio</p>
          <p className="font-mono text-lg text-accent">{stats.sharpeRatio}</p>
        </div>
      </div>
    </div>
  );
}
