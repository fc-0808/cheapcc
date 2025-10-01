'use client';

import dynamic from 'next/dynamic';

// Dynamically import UnifiedBackground to ensure it only runs on client
const UnifiedBackground = dynamic(() => import('./UnifiedBackground'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f111a] via-[#131629] to-[#0c0e17] z-0" />
    </div>
  )
});

export default function ClientUnifiedBackground() {
  return <UnifiedBackground />;
}
