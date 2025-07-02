/**
 * Utility functions for component optimization across the application
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

/**
 * Custom hook for tracking when an element is in viewport
 * Used for lazy loading components
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current || hasIntersected) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options, hasIntersected]);

  return [ref, isIntersecting || hasIntersected];
}

/**
 * Efficiently memoize expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Creates a debounced function that delays invoking func until after wait
 * milliseconds have elapsed since the last time the debounced function was invoked
 */
export function createDebounce<T extends (...args: any[]) => any>(
  func: T, 
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * For reusable effects with cleanup
 */
export function useEffectWithCleanup(effect: () => (() => void) | undefined, deps: any[]) {
  useEffect(() => {
    const cleanup = effect();
    return () => {
      if (cleanup) cleanup();
    };
  }, deps);
}

/**
 * Prevents unnecessary re-renders with useCallback and referential equality
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T, deps: any[] = []): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);
  
  return useCallback((...args: any[]) => callbackRef.current(...args), []) as T;
}

/**
 * Check if code is running on client side to avoid SSR errors
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Cache key generator for data fetching
 */
export function generateCacheKey(endpoint: string, params: Record<string, any> = {}): string {
  return `${endpoint}:${JSON.stringify(params)}`;
}

/**
 * Function to chunk array operations for better performance
 */
export function chunkArrayOperations<T>(
  array: T[],
  operation: (item: T, index: number) => void,
  chunkSize = 5,
  delay = 0
): void {
  let index = 0;
  
  function processChunk() {
    const limit = Math.min(index + chunkSize, array.length);
    
    while (index < limit) {
      operation(array[index], index);
      index++;
    }
    
    if (index < array.length) {
      setTimeout(processChunk, delay);
    }
  }
  
  processChunk();
}

/**
 * Custom hook for delayed mounting of heavy components
 * to improve initial page load performance
 */
export function useDelayedMount(delay = 1000) {
  const [shouldMount, setShouldMount] = useState(false);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShouldMount(true);
    }, delay);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay]);
  
  return shouldMount;
}

/**
 * Get browser idle callback with fallback for unsupported browsers
 */
export function getIdleCallback(
  callback: IdleRequestCallback, 
  options?: IdleRequestOptions
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return Number(setTimeout(() => {
      const deadline = {
        timeRemaining: () => 10,
        didTimeout: false
      };
      callback(deadline);
    }, 1));
  }
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Creates a throttled version of a function that only invokes the
 * function at most once per every `wait` milliseconds
 * @param func Function to throttle
 * @param wait Wait time in ms
 * @returns Throttled function
 */
export function createThrottle<T extends (...args: any[]) => any>(
  func: T,
  wait = 100
): (...args: Parameters<T>) => void {
  let lastArgs: Parameters<T> | null = null;
  let lastTime = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    const now = Date.now();
    const remaining = wait - (now - lastTime);
    
    lastArgs = args;
    
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastTime = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        if (lastArgs) func(...lastArgs);
      }, remaining);
    }
  };
}

/**
 * Hook to detect if the device has a slow connection or low memory
 * @returns Object with isLowPowered and isSlowConnection flags
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isLowPowered: false,
    isSlowConnection: false
  });
  
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    
    // Check for device memory
    const isLowMemory = 'deviceMemory' in navigator && 
      (navigator as any).deviceMemory < 4;
    
    // Check for slow connection
    const isSlowConnection = 'connection' in navigator && 
      (navigator as any).connection &&
      ((navigator as any).connection.saveData ||
       (navigator as any).connection.effectiveType === 'slow-2g' ||
       (navigator as any).connection.effectiveType === '2g');
    
    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    setCapabilities({
      isLowPowered: isLowMemory || isMobile,
      isSlowConnection
    });
    
    // Listen for connection changes if available
    if ('connection' in navigator && (navigator as any).connection) {
      const conn = (navigator as any).connection;
      
      const updateConnectionStatus = () => {
        setCapabilities(prev => ({
          ...prev,
          isSlowConnection: conn.saveData || 
            conn.effectiveType === 'slow-2g' || 
            conn.effectiveType === '2g'
        }));
      };
      
      conn.addEventListener('change', updateConnectionStatus);
      return () => {
        conn.removeEventListener('change', updateConnectionStatus);
      };
    }
  }, []);
  
  return capabilities;
}

/**
 * Hook to detect when an element becomes visible in the viewport
 * @param options IntersectionObserver options
 * @returns [ref, isVisible] - Attach ref to the element you want to observe
 */
export function useIsVisible(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, {
      threshold: 0,
      rootMargin: '0px',
      ...options
    });
    
    observer.observe(ref.current);
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);
  
  return [ref, isVisible];
}

/**
 * Hook to detect when user is actually viewing the page (not in another tab)
 * @returns boolean indicating if page is visible
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
}

/**
 * Hook to detect network status
 * @returns Object with online status and connection information
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: 'unknown',
    saveData: false
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        online: navigator.onLine
      }));
    };
    
    const updateConnectionStatus = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        
        setStatus({
          online: navigator.onLine,
          effectiveType: conn.effectiveType || 'unknown',
          saveData: conn.saveData || false
        });
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      conn.addEventListener('change', updateConnectionStatus);
      updateConnectionStatus();
    }
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        conn.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);
  
  return status;
}

/**
 * Preload an image to ensure it's in the browser cache
 * @param src Image URL
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload multiple images
 * @param srcs Array of image URLs
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * Detect if the user prefers reduced motion
 * @returns boolean
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return prefersReducedMotion;
} 