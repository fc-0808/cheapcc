'use client';

import dynamic from 'next/dynamic';

// Dynamically import Header to ensure it only runs on client
const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 z-50 py-3 mx-3 my-4 rounded-[20px] transition-all duration-300 ease-in-out left-0 right-0 opacity-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between relative z-10">
        <div className="h-8 w-24 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
        <div className="h-8 w-8 bg-white/5 rounded-md backdrop-blur-sm animate-pulse md:hidden" />
        <div className="hidden md:flex items-center space-x-4">
          <div className="h-8 w-16 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
          <div className="h-8 w-20 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
          <div className="h-8 w-24 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
        </div>
      </div>
    </header>
  )
});

export default function ClientHeader() {
  return <Header />;
}
