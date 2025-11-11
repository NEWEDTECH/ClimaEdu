'use client';

import { useThemeStore } from '@/context/zustand/useThemeStore';

export function useTheme() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  
  // Theme is initialized by ProtectedContent, not here
  return { isDarkMode, toggleTheme };
}
