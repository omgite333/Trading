import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { useStore } from '@/stores/store';

export function NotificationCenter() {
  const { notifications, removeNotification, clearNotifications } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-[#00ff88]" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-[#ff3366]" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-[#f59e0b]" />;
      default: return <Info className="w-4 h-4 text-[#00d4ff]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded hover:bg-white/5 text-[#999] hover:text-white transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#ff3366] text-[10px] text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#131316] border border-[#2a2a2e] rounded-lg overflow-hidden z-50"
            >
              <div className="p-3 border-b border-[#2a2a2e] flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-[#666] hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-[#333] mx-auto mb-2" />
                    <p className="text-sm text-[#666]">No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 border-b border-[#2a2a2e] hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{notif.title}</p>
                          <p className="text-xs text-[#666] mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-[#666] mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notif.id)}
                          className="p-1 rounded hover:bg-white/5 text-[#666] hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
