'use client';

import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  initializeTheme: () => void;
}

const THEME_STORAGE_KEY = 'app-theme';

// Helper to get theme from localStorage
const getStoredTheme = (): boolean => {
  if (typeof window === 'undefined') return true; // Default dark for SSR
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === null) return true; // Default dark if not set
  
  return stored === 'dark';
};

// Helper to save theme to localStorage
const saveTheme = (isDark: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    console.log('💾 Theme saved to localStorage:', isDark ? 'dark' : 'light');
  }
};

// Helper to apply theme to document
const applyTheme = (isDark: boolean) => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    console.log('🎨 Theme applied to DOM:', isDark ? 'dark' : 'light');
  }
};

// Initialize store with theme from localStorage
const initialTheme = typeof window !== 'undefined' ? getStoredTheme() : true;

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: initialTheme, // Initialize directly from localStorage
  
  toggleTheme: () => {
    const newTheme = !get().isDarkMode;
    set({ isDarkMode: newTheme });
    
    // Save to localStorage
    saveTheme(newTheme);
    
    // Apply to document
    applyTheme(newTheme);
  },
  
  setTheme: (isDark: boolean) => {
    set({ isDarkMode: isDark });
    
    // Save to localStorage
    saveTheme(isDark);
    
    // Apply to document
    applyTheme(isDark);
  },
  
  initializeTheme: () => {
    // Get current state (already initialized from localStorage)
    const { isDarkMode } = get();
    
    console.log('🎨 Initializing theme:', isDarkMode ? 'dark' : 'light');
    
    // Apply to document
    applyTheme(isDarkMode);
  },
}));
