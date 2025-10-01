'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import SWRProvider to ensure it only runs on client
const SWRProvider = dynamic(() => import('./SWRProvider'), {
  ssr: false,
  loading: () => <div className="contents">{/* Fallback content will be passed through */}</div>
});

interface ClientSWRProviderProps {
  children: ReactNode;
}

export default function ClientSWRProvider({ children }: ClientSWRProviderProps) {
  return <SWRProvider>{children}</SWRProvider>;
}
