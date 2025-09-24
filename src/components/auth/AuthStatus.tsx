'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import { Button } from '@/components/button'

export function AuthStatus() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authService = container.get<AuthService>(Register.auth.service.AuthService);
        const authenticated = authService.isAuthenticated();
        const currentUserId = authService.getCurrentUserId();
        
        setIsAuthenticated(authenticated);
        setUserId(currentUserId);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check authentication immediately
    checkAuth();
    
    // Set up an interval to check authentication periodically
    const interval = setInterval(checkAuth, 2000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      const authService = container.get<AuthService>(Register.auth.service.AuthService);
      await authService.signOut();
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse mr-2"></div>
        Checking...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center text-sm">
        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
        <span className="text-gray-600 dark:text-gray-300">Not signed in</span>
        <Button
          onClick={() => router.push('/login')}
          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm">
      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
      <span className="text-gray-600 dark:text-gray-300">
        Signed in {userId && <span className="font-mono text-xs">({userId.substring(0, 8)}...)</span>}
      </span>
      <Button
        onClick={handleSignOut}
        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Sign Out
      </Button>
    </div>
  );
}
