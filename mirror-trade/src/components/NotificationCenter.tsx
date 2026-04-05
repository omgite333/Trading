import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, TrendingUp, Zap, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'trade' | 'signal' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'trade', title: 'Trade Executed', message: 'Long 50 HYPE @ $35.42', timestamp: Date.now() - 60000, read: false },
  { id: '2', type: 'signal', title: 'New Signal', message: 'WhaleHunter opened Long BTC', timestamp: Date.now() - 120000, read: false },
  { id: '3', type: 'success', title: 'Stop Loss Hit', message: 'ETH position closed at $3,420', timestamp: Date.now() - 300000, read: true },
  { id: '4', type: 'error', title: 'Order Failed', message: 'Slippage exceeded 0.5%', timestamp: Date.now() - 600000, read: true },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'signal': return <Zap className="w-4 h-4 text-accent" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-danger" />;
      case 'success': return <Check className="w-4 h-4 text-success" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-mono font-semibold text-white">Notifications</h3>
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`flex items-start gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      notification.type === 'trade' ? 'bg-primary/10' :
                      notification.type === 'signal' ? 'bg-accent/10' :
                      notification.type === 'error' ? 'bg-danger/10' :
                      'bg-success/10'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{notification.message}</p>
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
