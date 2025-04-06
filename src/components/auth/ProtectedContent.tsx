'use client';

import { ProtectedRoute } from './ProtectedRoute';

interface ProtectedContentProps {
  children: React.ReactNode;
}

export function ProtectedContent({ children }: ProtectedContentProps) {
  return (
    <ProtectedRoute
      fallback={
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-6">
            You need to be signed in to access this content. Please sign in to continue.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm">
              ClimaEdu uses passwordless authentication. You&apos;ll receive a sign-in link via email.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  );
}
