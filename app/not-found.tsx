'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-[#ff3366] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#2c2d5a] mb-6">Page Not Found</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <p className="text-gray-600 mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              prefetch={false}
              className="px-6 py-2 bg-[#2c2d5a] text-white rounded-md hover:bg-[#3e3f7a] transition-colors"
            >
              Go to Homepage
            </Link>
            
            <Link 
              href="/dashboard"
              prefetch={false}
              className="px-6 py-2 border border-[#2c2d5a] text-[#2c2d5a] rounded-md hover:bg-[#f0f0f5] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact our support team.
        </p>
      </div>
    </div>
  );
}