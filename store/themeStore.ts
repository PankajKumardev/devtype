import { create } from 'zustand';

export type ThemeType = 'dark' | 'ocean' | 'forest' | 'sunset' | 'light';

interface ThemeColors {
  bg: string;
  bgSub: string;
  text: string;
  sub: string;
  main: string;
  error: string;
  border: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    bg: '#323437',
    bgSub: '#2c2e31',
    text: '#d1d0c5',
    sub: '#646669',
    main: '#e2b714',
    error: '#ca4754',
    border: '#3d3d3d',
  },
  ocean: {
    bg: '#1a2634',
    bgSub: '#152028',
    text: '#c7d5e0',
    sub: '#5a7a8c',
    main: '#00b4d8',
    error: '#ef476f',
    border: '#2a3f4f',
  },
  forest: {
    bg: '#1e2d24',
    bgSub: '#172119',
    text: '#c9d1c8',
    sub: '#5a7a5a',
    main: '#4ade80',
    error: '#f87171',
    border: '#2d3d2d',
  },
  sunset: {
    bg: '#2d1f2f',
    bgSub: '#251a27',
    text: '#e0d0d5',
    sub: '#8a6a7a',
    main: '#f472b6',
    error: '#ef4444',
    border: '#3d2f3f',
  },
  light: {
    bg: '#f5f5f5',
    bgSub: '#e8e8e8',
    text: '#323437',
    sub: '#999999',
    main: '#e2b714',
    error: '#ca4754',
    border: '#d0d0d0',
  },
};

interface ThemeState {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  getColors: () => ThemeColors;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: 'dark',
  setTheme: (theme) => {
    set({ currentTheme: theme });
    // Apply theme to document
    const colors = themes[theme];
    document.documentElement.style.setProperty('--color-bg', colors.bg);
    document.documentElement.style.setProperty('--color-bg-sub', colors.bgSub);
    document.documentElement.style.setProperty('--color-text', colors.text);
    document.documentElement.style.setProperty('--color-sub', colors.sub);
    document.documentElement.style.setProperty('--color-main', colors.main);
    document.documentElement.style.setProperty('--color-error', colors.error);
    document.documentElement.style.setProperty('--color-border', colors.border);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('devtype-theme', theme);
    }
  },
  getColors: () => themes[get().currentTheme],
}));
