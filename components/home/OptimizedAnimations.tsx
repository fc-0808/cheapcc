'use client';

import React, { lazy, Suspense } from 'react';

// Basic loading placeholder for motion components
const MotionLoading = () => <div className="opacity-0"></div>;

// Lazy load core motion components
const LazyMotion = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion })));
const LazyAnimatePresence = lazy(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })));

// Optimized motion component
export function OptimizedMotion(props: any) {
  return (
    <Suspense fallback={<MotionLoading />}>
      <LazyMotion {...props} />
    </Suspense>
  );
}

// Optimized AnimatePresence component
export function OptimizedAnimatePresence(props: any) {
  return (
    <Suspense fallback={<MotionLoading />}>
      <LazyAnimatePresence {...props} />
    </Suspense>
  );
}

// Re-export useful types
export type { Variants, PanInfo } from 'framer-motion';

// Re-export hooks directly since they're small
export { useInView } from 'framer-motion';

// Helper function to create simple animations without the full motion library
export const createSimpleAnimation = (
  element: HTMLElement, 
  keyframes: Keyframe[] | PropertyIndexedKeyframes, 
  options?: KeyframeAnimationOptions
) => {
  return element.animate(keyframes, options);
};

// Optimized variants for common animations to avoid recreating them in components
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const staggerChildrenVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}; 