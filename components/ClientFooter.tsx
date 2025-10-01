'use client';

import dynamic from 'next/dynamic';

// Dynamically import Footer to ensure it only runs on client
const Footer = dynamic(() => import('./Footer'), {
  ssr: false,
  loading: () => (
    <footer className="relative py-20 sm:py-28 -mt-20 sm:-mt-28">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            <div className="h-4 w-3/4 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-24 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
              <div className="h-4 w-12 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-16 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
              <div className="h-4 w-20 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
              <div className="h-4 w-18 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-20 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded-md backdrop-blur-sm animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
});

export default function ClientFooter() {
  return <Footer />;
}
