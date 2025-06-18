'use client';

import { useState, useEffect } from 'react';
//import { useRouter } from 'next/navigation';

interface AuthLink {
  email: string;
  link: string;
  timestamp: number;
}

interface OobCode {
  email: string;
  oobLink: string;
  requestType: string;
  createTime: string;
}

interface EmulatorResponse {
  oobCodes: OobCode[];
}

export function EmulatorAuthLinks() {
  //const router = useRouter();
  const [authLinks, setAuthLinks] = useState<AuthLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthLinks = async () => {
      try {
        // The Firebase Auth Emulator runs on port 9099 by default
        const response = await fetch('http://localhost:9099/emulator/v1/projects/climaedu-18a58/oobCodes');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch auth links: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json() as EmulatorResponse;
        
        // Filter for email sign-in links and sort by timestamp (newest first)
        const emailLinks = data.oobCodes
          .filter((code: OobCode) => code.requestType === 'EMAIL_SIGNIN')
          .map((code: OobCode) => ({
            email: code.email,
            link: code.oobLink,
            timestamp: new Date(code.createTime).getTime(),
          }))
          .sort((a: AuthLink, b: AuthLink) => b.timestamp - a.timestamp);
        
        setAuthLinks(emailLinks);
      } catch (err) {
        console.error('Error fetching auth links:', err);
        setError('Failed to fetch authentication links from the emulator. Make sure the Firebase emulator is running.');
      } finally {
        setIsLoading(false);
      }
    };

    // Only run in development mode
    if (process.env.NODE_ENV === 'development') {
      fetchAuthLinks();
      
      // Refresh the links every 5 seconds
      const interval = setInterval(fetchAuthLinks, 5000);
      
      return () => clearInterval(interval);
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
        <h3 className="text-lg font-semibold mb-2">Loading emulator links...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Emulator Error</h3>
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (authLinks.length === 0) {
    return (
      <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Firebase Emulator</h3>
        <p className="text-sm">No authentication links found. Submit the form above to generate a link.</p>
      </div>
    );
  }

  const handleUseLink = (link: AuthLink) => {
    // Store the email in localStorage before navigating to the link
    window.localStorage.setItem('emailForSignIn', link.email);
    console.log(`Stored email in localStorage: ${link.email}`);
    
    // Extract the parameters from the link
    const url = new URL(link.link);
    const mode = url.searchParams.get('mode');
    const oobCode = url.searchParams.get('oobCode');
    const apiKey = url.searchParams.get('apiKey');
    
    const confirmUrl = `${window.location.origin}/auth/confirm?mode=${mode}&oobCode=${oobCode}&apiKey=${apiKey}&email=${encodeURIComponent(link.email)}`;
    console.log(`Redirecting to: ${confirmUrl}`);
    
    // Navigate to the confirm page
    window.location.href = confirmUrl;
    //router.push('/')
  };

  return (
    <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Firebase Emulator Authentication Links</h3>
      <p className="text-sm mb-4">
        When using the Firebase emulator, emails are not actually sent. Use these links to authenticate:
      </p>
      
      <div className="space-y-4">
        {authLinks.map((link, index) => (
          <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{link.email}</span>
              <span className="text-xs text-gray-500">
                {new Date(link.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center">
              <div className="text-sm text-gray-600 truncate flex-1 mr-2 overflow-hidden">
                <a
                  href={link.link}
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUseLink(link);
                  }}
                >
                  {link.link}
                </a>
              </div>
              <button
                onClick={() => handleUseLink(link)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Use Link
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
        Note: These links are only available in development mode with the Firebase emulator running.
      </p>
    </div>
  );
}
