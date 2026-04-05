import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Briefcase, 
  History, 
  BarChart3, 
  Settings,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useStore } from '@/stores/store';
import { NotificationCenter } from './NotificationCenter';
import { WalletButton } from './WalletButton';
import { PriceTicker } from './PriceTicker';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trades', icon: ArrowLeftRight, label: 'Copy Trade' },
  { path: '/trade', icon: BarChart3, label: 'Trade' },
  { path: '/positions', icon: Briefcase, label: 'Positions' },
  { path: '/orders', icon: History, label: 'Orders' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { positions } = useStore();
  
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  return (
    <div className="min-h-screen flex bg-[#0a0a0b]">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`
          fixed lg:relative z-50 h-screen bg-[#131316] border-r border-[#2a2a2e]
          ${collapsed ? 'w-16' : 'w-56'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-all duration-200 flex flex-col
        `}
      >
        <div className="p-4 border-b border-[#2a2a2e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#00d4ff] flex items-center justify-center">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 17l6-6 4 4 8-8" />
                <circle cx="21" cy="7" r="2" fill="currentColor" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <span className="font-semibold text-white text-sm">MirrorTrade</span>
                <span className="block text-[10px] text-[#666]">Hyperliquid Copy</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  nav-item ${isActive ? 'active border-l-2 border-[#00d4ff]' : ''}
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-[#00d4ff]' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 m-2 rounded bg-[#0a0a0b] border border-[#2a2a2e]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#666]">Portfolio PnL</span>
              <span className={`text-xs font-mono ${totalPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl >= 0 ? '$' : '-$'}{Math.abs(totalPnl).toFixed(2)}
              </span>
            </div>
            <div className="h-0.5 bg-[#2a2a2e] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00d4ff] rounded-full"
                style={{ width: '65%' }}
              />
            </div>
          </motion.div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1f1f24] border border-[#2a2a2e] items-center justify-center text-[#666] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0b]/95 backdrop-blur border-b border-[#2a2a2e]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded hover:bg-white/5 text-[#999]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-9 pr-4 py-2 bg-[#0a0a0b] border border-[#2a2a2e] rounded text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/trade"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#00d4ff] text-black text-sm font-medium rounded hover:bg-[#00bce0] transition-colors"
              >
                Trade
              </Link>
              <NotificationCenter />
              <WalletButton />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4">
          <Outlet />
        </main>

        <PriceTicker />
      </div>
    </div>
  );
}
