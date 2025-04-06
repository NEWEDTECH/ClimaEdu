'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '@/shared/container/container';
import { Register } from '@/shared/container/symbols';
import type { AuthService } from '@/modules/auth/infrastructure/services/AuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authService = container.get<AuthService>(Register.auth.service.AuthService);
        const authenticated = authService.isAuthenticated();
        const currentUserId = authService.getCurrentUserId();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('ProtectedRoute - Authentication check:', authenticated);
          console.log('ProtectedRoute - Current user ID:', currentUserId);
        }
        
        setIsAuthenticated(authenticated);
        
        if (!authenticated && !fallback) {
          // Redirect to login page if not authenticated and no fallback is provided
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        if (!fallback) {
          router.push('/login');
        }
      }
    };
    
    // Check authentication immediately
    checkAuth();
    
    // Set up an interval to check authentication periodically
    const interval = setInterval(checkAuth, 2000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [router, fallback]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-500"></div>
          <p className="text-center text-gray-600">Checking authentication...</p>
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
