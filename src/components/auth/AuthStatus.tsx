'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '@/shared/container/container';
import { Register } from '@/shared/container/symbols';
import type { AuthService } from '@/modules/auth/infrastructure/services/AuthService';

export function AuthStatus() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Get the auth service from the container
      const authService = container.get<AuthService>(Register.auth.service.AuthService);
      
      // Check if the user is authenticated
      const checkAuth = () => {
        setIsAuthenticated(authService.isAuthenticated());
        setUserId(authService.getCurrentUserId());
        setIsLoading(false);
      };
      
      // Check authentication status initially
      checkAuth();
      
      // Set up an interval to check authentication status periodically
      const interval = setInterval(checkAuth, 5000);
      
      // Clean up the interval when the component unmounts
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error initializing AuthStatus:', error);
      setIsLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Get the auth service from the container
      const authService = container.get<AuthService>(Register.auth.service.AuthService);
      
      // Sign out
      await authService.signOut();
      
      // Update state
      setIsAuthenticated(false);
      setUserId(null);
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
        <span className="text-sm">Not signed in</span>
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
      <span className="text-sm">Signed in{userId ? ` (${userId})` : ''}</span>
      <button
        onClick={handleSignOut}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
        disabled={isLoading}
      >
        {isLoading ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
}
