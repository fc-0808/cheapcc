'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component that tracks page visits by sending a request to the tracking API.
 * This component should be included in the app's layout to track all page visits.
 */
export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to track the current page visit
    const trackPageVisit = async () => {
      try {
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: pathname }),
        });
      } catch (error) {
        // Fail silently - tracking should not affect user experience
        console.error('Error tracking page visit:', error);
      }
    };

    // Track the page visit when component mounts or pathname changes
    trackPageVisit();

    // For SPA navigation (client-side route changes)
    // You could also implement this using Router events if needed
  }, [pathname]); // Re-run when pathname changes

  // This component doesn't render anything
  return null;
} 