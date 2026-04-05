import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/stores/themeStore';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'light'
            ? 'bg-white/10 text-yellow-400'
            : 'text-gray-500 hover:text-white'
        }`}
        title="Light"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'dark'
            ? 'bg-white/10 text-indigo-400'
            : 'text-gray-500 hover:text-white'
        }`}
        title="Dark"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all text-gray-500 hover:text-white`}
        title="System"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
