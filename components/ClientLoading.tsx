'use client';

import dynamic from 'next/dynamic';

// Dynamically import Loading to ensure it only runs on client
const Loading = dynamic(() => import('../app/loading'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f111a] relative">
      <div className="text-center relative z-10 px-4 sm:px-0">
        <div className="mb-6 flex items-center justify-center">
          <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Cheap
            <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              CC
            </span>
          </div>
        </div>
        <div className="relative h-2 w-64 max-w-full mx-auto bg-white/10 backdrop-blur-sm rounded-full overflow-hidden mb-4 border border-white/20">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 rounded-full w-1/2 animate-pulse"></div>
        </div>
        <h2 className="text-sm font-medium text-gray-300 mb-1">Loading...</h2>
      </div>
    </div>
  )
});

export default function ClientLoading() {
  return <Loading />;
}
