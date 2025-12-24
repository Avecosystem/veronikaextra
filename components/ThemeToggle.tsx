// components/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === Theme.DARK;

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer
                 bg-gray-700 dark:bg-gray-300 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Toggle theme"
    >
      <div
        className={`w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md transform transition-transform duration-500
                    ${isDark ? 'translate-x-0' : 'translate-x-6'}`}
      ></div>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-yellow-400 opacity-0 dark:opacity-100 transition-opacity duration-300">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.459 4.218A9.993 9.006 0 0110 18a9.994 9.994 0 01-5.541-1.782l-.894.894a1 1 0 11-1.414-1.414l.894-.894A8 8 0 1014.541 15.782l.894.894a1 1 0 01-1.414 1.414l-.894-.894zM7 6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm-.707 3.293a1 1 0 00-1.414 0l-1 1a1 1 0 101.414 1.414l1-1a1 1 0 000-1.414zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.707-.293a1 1 0 00-1.414-1.414l-1 1a1 1 0 101.414 1.414l1-1z"></path></svg>
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-800 opacity-100 dark:opacity-0 transition-opacity duration-300">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
      </span>
    </button>
  );
};

export default ThemeToggle;
