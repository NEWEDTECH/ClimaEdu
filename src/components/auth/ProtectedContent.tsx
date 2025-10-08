'use client';

import { ProtectedRoute } from './ProtectedRoute';

interface ProtectedContentProps {
  children: React.ReactNode;
}

export function ProtectedContent({ children }: ProtectedContentProps) {
  return <ProtectedRoute> {children} </ProtectedRoute>
}
