'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { SignInWithEmailLinkUseCase } from '@/_core/modules/auth/core/use-cases/sign-in-with-email-link/sign-in-with-email-link.use-case';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';

export function EmailLinkHandler() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Verifying your sign-in link...');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailLink = async () => {
      try {
        // Get the current URL
        const url = window.location.href;
        
        // Log the URL for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Current URL:', url);
          setDebugInfo(`Current URL: ${url}`);
        }
        
        // Check if the URL contains sign-in parameters
        // For Firebase email link authentication, the URL should contain 'mode=signIn' and 'oobCode='
        const hasSignInParams = url.includes('mode=signIn') && url.includes('oobCode=');
        
        if (!hasSignInParams) {
          // Not a sign-in link, do nothing
          setStatus('checking');
          setMessage('No sign-in link detected');
          setDebugInfo('URL does not contain sign-in parameters (mode=signIn and oobCode=)');
          return;
        }

        setDebugInfo(`URL appears to be a sign-in link: ${url}`);

        try {
          // Get the auth service from the container
          const authService = container.get<AuthService>(Register.auth.service.AuthService);
          
          // Check if the current URL is a sign-in link
          const isSignInLink = authService.isSignInWithEmailLink(url);
          
          if (!isSignInLink) {
            setStatus('error');
            setMessage('Invalid sign-in link. Please try again.');
            setDebugInfo(`Auth service reports this is not a valid sign-in link: ${url}`);
            return;
          }

          setDebugInfo(`Auth service confirmed this is a valid sign-in link`);

          // First check if the email is in the URL (we added this in the EmulatorAuthLinks component)
          const urlParams = new URLSearchParams(window.location.search);
          const emailFromUrl = urlParams.get('email');
          
          // Then check if the email is in localStorage
          const emailFromStorage = window.localStorage.getItem('emailForSignIn');
          
          // Use the email from the URL if available, otherwise use the email from localStorage
          const email = emailFromUrl || emailFromStorage;
          
          if (!email) {
            // If we still don't have an email, show an error
            setStatus('error');
            setMessage('We could not find your email. Please try signing in again.');
            setDebugInfo('Email not found in localStorage or URL. localStorage keys: ' + Object.keys(localStorage).join(', '));
            return;
          }

          setDebugInfo(`Found email: ${email} (from ${emailFromUrl ? 'URL' : 'localStorage'})`);

          try {
            // Get the use case from the container
            const signInWithEmailLinkUseCase = container.get<SignInWithEmailLinkUseCase>(
              Register.auth.useCase.SignInWithEmailLinkUseCase
            );

            // Execute the use case
            const result = await signInWithEmailLinkUseCase.execute({
              email,
              link: url,
            });

            if (result.success) {
              setStatus('success');
              setMessage('You have been successfully signed in!');
              setDebugInfo(prev => `${prev}\nAuthentication successful. User ID: ${result.userId}`);
              
              // Check if the user is authenticated
              const isAuthenticated = authService.isAuthenticated();
              const currentUserId = authService.getCurrentUserId();
              
              setDebugInfo(prev => `${prev}\nAuthentication state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
              setDebugInfo(prev => `${prev}\nCurrent user ID: ${currentUserId || 'None'}`);
              
              // No need for automatic redirect, let the user click the button
            } else {
              setStatus('error');
              setMessage('Failed to sign in. Please try again.');
              setDebugInfo(`Sign-in failed with email: ${email}`);
            }
          } catch (error) {
            console.error('Error getting SignInWithEmailLinkUseCase:', error);
            setStatus('error');
            setMessage('Service unavailable. Please try again later.');
            setDebugInfo(`Error during sign-in with email: ${email}, Error: ${error}`);
          }
        } catch (error) {
          console.error('Error getting AuthService:', error);
          setStatus('error');
          setMessage('Authentication service unavailable. Please try again later.');
          setDebugInfo(`Error getting AuthService: ${error}`);
        }
      } catch (error) {
        console.error('Error signing in with email link:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
        setDebugInfo(`Unexpected error: ${error}`);
      }
    };

    handleEmailLink();
  }, [router]);

  // Function to manually trigger the redirect to home
  const goToHome = () => {
    // Get the auth service from the container
    try {
      const authService = container.get<AuthService>(Register.auth.service.AuthService);
      
      // Check if the user is authenticated
      const isAuthenticated = authService.isAuthenticated();
      const currentUserId = authService.getCurrentUserId();
      
      console.log('Authentication state before redirect:', isAuthenticated);
      console.log('Current user ID before redirect:', currentUserId);
      
      // Redirect to the home page
      router.push('/');
    } catch (error) {
      console.error('Error checking authentication before redirect:', error);
      router.push('/');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="text-center">
        {status === 'checking' && (
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-500"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
            <p className="mb-4">You have been successfully signed in. Click the button below to go to the home page.</p>
            <button
              onClick={goToHome}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
        
        {/* Debug information in development mode */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-left">
            <h3 className="text-sm font-semibold mb-1">Debug Info:</h3>
            <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
          </div>
        )}
        
        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
