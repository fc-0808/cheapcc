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
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return { elementRef, isIntersecting };
}

/**
 * Efficiently memoize expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
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
  return debounce(func, wait);
}

/**
 * For reusable effects with cleanup
 */
export function useEffectWithCleanup(effect: () => (() => void) | undefined, deps: any[]) {
  useEffect(() => {
    const cleanup = effect();
    return cleanup;
  }, deps);
}

/**
 * Prevents unnecessary re-renders with useCallback and referential equality
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T, deps: any[] = []): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return mounted;
}

/**
 * Get browser idle callback with fallback for unsupported browsers
 */
export function getIdleCallback(
  callback: IdleRequestCallback, 
  options?: IdleRequestOptions
): number {
  return isClient() && 'requestIdleCallback' in window
    ? window.requestIdleCallback(callback, options)
    : setTimeout(callback, options?.timeout || 50);
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if (isClient() && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
} 