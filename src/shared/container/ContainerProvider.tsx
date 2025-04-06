'use client';

import { useEffect } from 'react';
import { registerDependencies } from './containerRegister';

/**
 * Provider component to initialize the Inversify container
 * This is a client component that registers all dependencies when the app starts
 */
export function ContainerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register all dependencies
    registerDependencies();
  }, []);

  // Always render children to avoid hydration mismatch
  // The container will be initialized on the client side
  return <>{children}</>;
}
