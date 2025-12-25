'use client';

import { useThemeStore, themes, ThemeType } from '@/store/themeStore';
import { useEffect, useState } from 'react';

export default function ThemeSelector() {
  const { currentTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('devtype-theme') as ThemeType | null;
    if (saved && themes[saved]) {
      setTheme(saved);
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const themeOptions: { id: ThemeType; name: string }[] = [
    { id: 'dark', name: 'dark' },
    { id: 'ocean', name: 'ocean' },
    { id: 'forest', name: 'forest' },
    { id: 'sunset', name: 'sunset' },
    { id: 'light', name: 'light' },
  ];

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="text-sm text-sub hover:text-text transition-colors bg-transparent border-none cursor-pointer font-mono"
      >
        theme
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 bg-bg-sub border border-border rounded-lg py-2 min-w-[120px] z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              onClick={() => { setTheme(theme.id); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm font-mono border-none cursor-pointer transition-colors
                ${currentTheme === theme.id 
                  ? 'text-main bg-bg' 
                  : 'text-sub hover:text-text hover:bg-bg bg-transparent'
                }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
