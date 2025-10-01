'use client';

import { useThemeColors } from '@/hooks/useThemeColors';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // O hook aplicará as cores automaticamente via useEffect
  useThemeColors();
  
  return <>{children}</>;
}
