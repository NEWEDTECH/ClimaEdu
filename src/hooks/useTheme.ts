'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/context/zustand/useThemeStore';

export function useTheme() {
  const { isDarkMode, toggleTheme, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return { isDarkMode, toggleTheme };
}
