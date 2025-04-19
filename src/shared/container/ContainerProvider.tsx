'use client';

import { useEffect, useState } from 'react';
import { registerDependencies } from '../../_core/shared/container';

/**
 * Provider component to initialize the Inversify container
 * This is a client component that registers all dependencies when the app starts
 */
export function ContainerProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      // Register all dependencies
      registerDependencies();
      console.log('Container initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing container:', error);
      // Set initialized to true anyway to avoid blocking the UI
      setIsInitialized(true);
    }
  }, []);

  // Show a loading indicator while the container is initializing
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200"></div>
          <div className="mt-4 text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Render children once the container is initialized
  return <>{children}</>;
}
