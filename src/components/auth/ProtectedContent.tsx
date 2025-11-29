'use client';

import { useEffect } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { useThemeStore } from '@/context/zustand/useThemeStore';

interface ProtectedContentProps {
  children: React.ReactNode;
}

export function ProtectedContent({ children }: ProtectedContentProps) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  
  // Initialize theme once when ProtectedContent mounts
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);
  
  return <ProtectedRoute> {children} </ProtectedRoute>
}
