'use client';

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { fetcher } from '@/utils/fetcher';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * SWRProvider - Global configuration for SWR data fetching
 * Provides consistent fetcher and configuration across the app
 */
export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnMount: true,
        revalidateIfStale: true,
        // Global cache settings
        dedupingInterval: 5000, // 5 seconds
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Enable suspense mode if needed
        // suspense: true,
        // Provider for persisting cache
        provider: (cache) => {
          // You could implement localStorage caching here
          return cache;
        },
        onError: (error) => {
          // Global error logging
          if (error.status !== 403 && error.status !== 404) {
            console.error('SWR Global Error:', error);
          }
        }
      }}
    >
      {children}
    </SWRConfig>
  );
} 