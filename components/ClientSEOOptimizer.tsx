'use client';

import dynamic from 'next/dynamic';

// Dynamically import SEOPerformanceOptimizer to ensure it only runs on client
const SEOPerformanceOptimizer = dynamic(() => import('./SEOPerformanceOptimizer'), {
  ssr: false,
  loading: () => null
});

export default function ClientSEOOptimizer() {
  return (
    <SEOPerformanceOptimizer 
      enableCriticalResourceHints={true}
      enableImageOptimization={true}
      enableFontOptimization={true}
      enableServiceWorker={false}
    />
  );
}
