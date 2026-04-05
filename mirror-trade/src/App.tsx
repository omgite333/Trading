import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Positions from './pages/Positions';
import HistoryPage from './pages/History';
import Analytics from './pages/Analytics';
import TradePage from './pages/TradePage';
import SettingsPage from './pages/Settings';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="trades" element={<Trades />} />
              <Route path="positions" element={<Positions />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="trade" element={<TradePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
