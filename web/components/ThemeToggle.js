'use client';

import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const themeContext = useTheme();
  
  // Fallback if ThemeProvider is not available
  if (!themeContext) {
    return (
      <button
        className="
          relative inline-flex items-center justify-center
          w-10 h-10 rounded-xl
          bg-neutral-100 hover:bg-neutral-200
          dark:bg-neutral-800 dark:hover:bg-neutral-700
          border border-neutral-200 dark:border-neutral-700
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          dark:focus:ring-offset-neutral-900
          opacity-50 cursor-not-allowed
        "
        disabled
        aria-label="Theme toggle unavailable"
        title="Theme toggle unavailable"
      >
        <Sun className="w-5 h-5 text-amber-500" />
      </button>
    );
  }
  
  const { isDarkMode, toggleTheme } = themeContext;

  return (
    <button
      onClick={toggleTheme}
      className="
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-xl
        bg-neutral-100 hover:bg-neutral-200
        dark:bg-neutral-800 dark:hover:bg-neutral-700
        border border-neutral-200 dark:border-neutral-700
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-neutral-900
      "
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 text-amber-500
            transition-all duration-300 transform
            ${isDarkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
          `}
        />
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 text-blue-400
            transition-all duration-300 transform
            ${isDarkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
        />
      </div>
    </button>
  );
}