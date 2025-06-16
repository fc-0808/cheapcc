'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathTracked = useRef<string | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  const [trackingAttempts, setTrackingAttempts] = useState(0);

  // Debug logging in development mode
  const debug = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Create a full path with search params for more accurate tracking
    const fullPath = searchParams?.toString() 
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
      
    if (debug) {
      console.log(`[VisitorTracker] Path changed to: ${fullPath}`);
      console.log(`[VisitorTracker] Last tracked: ${lastPathTracked.current}`);
      console.log(`[VisitorTracker] Is tracking: ${isTrackingRef.current}`);
    }
    
    // Skip if already tracking this exact path (including query params)
    if (lastPathTracked.current === fullPath && trackingAttempts === 0) {
      if (debug) console.log('[VisitorTracker] Skipping - already tracked this path');
      return;
    }

    // Function to safely log a page visit
    const logVisit = () => {
      // Set tracking flag to prevent duplicate calls
      isTrackingRef.current = true;
      
      try {
        // Create a simple image beacon for tracking
        const trackingPixel = new Image();
        
        // Create a URL with query parameters
        const trackingUrl = new URL('/api/pixel', window.location.origin);
        trackingUrl.searchParams.set('path', pathname || '/');
        trackingUrl.searchParams.set('ref', encodeURIComponent(document.referrer || ''));
        trackingUrl.searchParams.set('t', Date.now().toString());
        
        if (debug) console.log(`[VisitorTracker] Sending tracking request to: ${trackingUrl.toString()}`);
        
        // Set onload and onerror handlers
        trackingPixel.onload = () => {
          if (debug) console.log('[VisitorTracker] Tracking successful');
          lastPathTracked.current = fullPath;
          isTrackingRef.current = false;
          setTrackingAttempts(0); // Reset attempts on success
        };
        
        trackingPixel.onerror = () => {
          console.warn('[VisitorTracker] Failed to track page visit');
          isTrackingRef.current = false;
          
          // Retry logic - attempt up to 2 more times with exponential backoff
          if (trackingAttempts < 2) {
            const delay = Math.pow(2, trackingAttempts) * 1000; // 1s, 2s
            setTimeout(() => {
              setTrackingAttempts(prev => prev + 1);
            }, delay);
          } else {
            setTrackingAttempts(0); // Reset after max attempts
          }
        };
        
        // Set the source to trigger the request
        trackingPixel.src = trackingUrl.toString();
      } catch (error) {
        console.error('[VisitorTracker] Error in visitor tracking:', error);
        isTrackingRef.current = false;
      }
    };

    // Add a small delay to avoid conflicts with initial page load
    const timeoutId = setTimeout(() => {
      logVisit();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, searchParams, trackingAttempts]); // Re-run when pathname, search params, or tracking attempts change

  // This component doesn't render anything
  return null;
} 