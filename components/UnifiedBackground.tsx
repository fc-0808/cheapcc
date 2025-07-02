"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Lazy load framer-motion to reduce initial bundle size
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

// Detect if device is low-powered to reduce animations
const isLowPoweredDevice = () => {
  if (typeof navigator === 'undefined') return true;
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check for battery API support and low battery
  const hasBatteryAPI = 'getBattery' in navigator;
  
  // For older devices, Safari, or when battery API isn't available
  const isOlderDevice = 
    !('requestAnimationFrame' in window) || 
    !('deviceMemory' in navigator) ||
    (navigator as any).deviceMemory < 4;
  
  return isMobile || isOlderDevice;
};

// Calculate star count based on viewport size
const getStarCount = () => {
  if (typeof window === 'undefined') return 50;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const area = width * height;
  
  // Scale stars based on viewport area
  if (area > 1000000) return 100; // Large screens
  if (area > 500000) return 70; // Medium screens
  return 40; // Small screens
};

// Pre-generate star positions for better performance
const generateStarPositions = (count: number) => {
  return Array.from({ length: count }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.7 + 0.3,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${Math.random() * 5 + 5}s`
  }));
};

// Use CSS for static gradients to improve performance
const StaticGradients = ({ isDashboard = false }) => (
  <div>
    {/* Primary background gradient */}
    <div 
      className={`absolute inset-0 bg-gradient-to-b ${
        isDashboard
          ? 'from-[#0c0d14] via-[#111220] to-[#0a0b11]' 
          : 'from-[#0f111a] via-[#131629] to-[#0c0e17]'
      } z-0`}
      aria-hidden="true"
    />
    
    {/* Accent gradient overlays */}
    <div 
      className={`absolute top-0 left-0 right-0 h-[40vh] ${
        isDashboard
          ? 'bg-gradient-to-br from-[#ff3366]/5 via-transparent to-transparent'
          : 'bg-gradient-to-br from-[#ff3366]/10 via-transparent to-transparent'
      } z-0`}
      aria-hidden="true"
    />
    <div 
      className={`absolute bottom-0 right-0 left-0 h-[30vh] ${
        isDashboard
          ? 'bg-gradient-to-t from-[#0a0b11] via-[#111220]/30 to-transparent'
          : 'bg-gradient-to-t from-[#0c0e17] via-[#131629]/50 to-transparent'
      } z-0`}
      aria-hidden="true"
    />
    {!isDashboard && (
      <div 
        className="absolute top-[20vh] right-0 w-[40vw] h-[0vh] bg-gradient-to-l from-[#5d45ff]/5 via-[#5d45ff]/10 to-transparent opacity-50 z-0"
        aria-hidden="true"
      />
    )}
  </div>
);

export default function UnifiedBackground() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile');
  
  const [isClient, setIsClient] = useState(false);
  const [starPositions, setStarPositions] = useState<any[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [mounted, setMounted] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  
  // Initialize on client-side only
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
    
    // Check for reduced motion preference
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for low-powered device
    const isLowPower = isLowPoweredDevice();
    
    setReducedMotion(prefersReducedMotion);
    setLowPower(isLowPower);
    
    // Generate appropriate number of stars - fewer for dashboard
    const starCount = isDashboard 
      ? Math.floor(getStarCount() / 3) 
      : (isLowPower ? Math.floor(getStarCount() / 2) : getStarCount());
      
    setStarPositions(generateStarPositions(starCount));
    
    // Clean up any animations
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDashboard]);

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  // Don't render stars on server, for reduced motion users, or on dashboard
  const shouldRenderStars = isClient && !reducedMotion && !isDashboard;
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]" aria-hidden="true">
      {/* Static background gradients */}
      <StaticGradients isDashboard={isDashboard} />
      
      {/* Stars - only render if appropriate */}
      {shouldRenderStars && (
        <div className="absolute inset-0 z-0">
          {starPositions.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
                animation: lowPower ? 'none' : `pulse ${star.animationDuration} infinite alternate ease-in-out`,
                animationDelay: star.animationDelay,
                willChange: lowPower ? 'auto' : 'opacity, transform',
                contain: 'strict'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}