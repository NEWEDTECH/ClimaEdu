'use client';

import { useState, useEffect } from 'react';

export function EmulatorStatus() {
  const [isEmulatorRunning, setIsEmulatorRunning] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEmulator = async () => {
      try {
        // Try to connect to the Auth Emulator
        const response = await fetch('http://localhost:9099/', { 
          method: 'GET',
          // Set a short timeout to avoid hanging
          signal: AbortSignal.timeout(2000)
        });
        
        setIsEmulatorRunning(response.ok);
      } catch (error) {
        console.error('Error checking emulator status:', error);
        setIsEmulatorRunning(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run in development mode
    if (process.env.NODE_ENV === 'development') {
      checkEmulator();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
        <h3 className="text-lg font-semibold mb-2">Checking Firebase Emulator status...</h3>
      </div>
    );
  }

  if (isEmulatorRunning === false) {
    return (
      <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Firebase Emulator Not Running</h3>
        <p className="text-sm mb-4">
          The Firebase Emulator is not running. Email link authentication will not work properly.
        </p>
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium mb-2">Start the emulators with:</p>
          <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-x-auto">
            npm run emulators
          </pre>
          <p className="text-sm mt-2">Or use the combined command:</p>
          <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-x-auto">
            npm run dev:emulators
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Firebase Emulator Running</h3>
      <p className="text-sm">
        The Firebase Emulator is running correctly. Email link authentication should work properly.
      </p>
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        <p>Emulator UI: <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://localhost:4000</a></p>
        <p>Auth Emulator: <a href="http://localhost:9099" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://localhost:9099</a></p>
      </div>
    </div>
  );
}
