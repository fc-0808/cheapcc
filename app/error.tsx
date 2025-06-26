'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error to console
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-[#ff3366] mb-4">Oops!</h1>
        <h2 className="text-2xl font-semibold text-[#2c2d5a] mb-6">Something went wrong</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <p className="text-gray-600 mb-6">
            We're sorry, but we encountered an unexpected error. Our team has been notified.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2 bg-[#2c2d5a] text-white rounded-md hover:bg-[#3e3f7a] transition-colors"
            >
              Try again
            </button>
            
            <Link 
              href="/"
              prefetch={false}
              className="px-6 py-2 border border-[#2c2d5a] text-[#2c2d5a] rounded-md hover:bg-[#f0f0f5] transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-left">
            <p className="font-medium text-red-800 mb-2">Error details (development only):</p>
            <pre className="text-xs text-red-700 overflow-auto max-h-40 p-2 bg-red-100 rounded">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}