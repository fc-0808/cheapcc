"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Star component with enhanced shimmering animation
const Star = ({ size, left, top, duration, delay }: { size: number, left: string, top: string, duration: number, delay: number }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      left,
      top,
      // Add a subtle glow effect using box-shadow
      boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.5)`,
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      // Create a shimmering effect by fluctuating opacity
      opacity: [0, 1, 0.5, 1, 0.2, 1, 0],
      // Add a subtle pulsing effect by changing the scale
      scale: [0.5, 1.1, 0.8, 1, 0.9, 1, 0.5],
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "loop", // Loop the animation
      delay,
      ease: "easeInOut", // Smoother easing for a more natural feel
    }}
    aria-hidden="true"
    role="presentation"
  />
);


export default function UnifiedBackground() {
  const [stars, setStars] = useState<Array<{id: number, size: number, left: string, top: string, duration: number, delay: number}>>([]);
  
  useEffect(() => {
    setStars(
      Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        size: Math.random() * 1.5 + 0.5,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 8 + 5,
        delay: Math.random() * 4,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* REFINED: The background gradient now uses a darker, more sophisticated palette. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#1e1b4b]" aria-hidden="true" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(120,_80,_255,_0.15),_transparent_70%)]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,_51,_102,_0.1),_transparent_70%)]"
          animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
        />
        {stars.map(star => <Star key={star.id} {...star} />)}
      </div>
    </div>
  );
}