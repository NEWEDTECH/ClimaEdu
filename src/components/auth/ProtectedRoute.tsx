'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/_core/shared/firebase/firebase-client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const authenticated = !!user;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('ProtectedRoute - Auth state changed:', authenticated);
        console.log('ProtectedRoute - User:', user?.uid || 'null');
      }
      
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      // Redirect to login if not authenticated and no fallback is provided
      if (!authenticated && !fallback) {
        router.push('/login');
      }
    }, (error) => {
      // Handle errors in auth state listener
      console.error('Error in auth state listener:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      if (!fallback) {
        router.push('/login');
      }
    });
    
    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, [router, fallback]);

  // Show loading state while checking authentication
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-500"></div>
          <p className="text-center text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback if provided, otherwise this should not be rendered as we redirect in the useEffect
  return fallback ? <>{fallback}</> : null;
}
