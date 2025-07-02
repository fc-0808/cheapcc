'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  className?: string;
}

/**
 * LightweightParticles - A CSS-only particle animation component
 * Uses CSS animations instead of JS-driven animations for better performance
 */
export default function LightweightParticles({
  count = 15,
  color = 'rgba(255, 255, 255, 0.4)',
  minSize = 1,
  maxSize = 3,
  minSpeed = 20,
  maxSpeed = 50,
  className = ''
}: ParticleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];
    
    // Clean up any existing particles first
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create particles using pure DOM operations for better performance
    for (let i = 0; i < count; i++) {
      const size = Math.random() * (maxSize - minSize) + minSize;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = (Math.random() * (maxSpeed - minSpeed) + minSpeed) / 10;
      
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      particle.style.background = color;
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      particle.style.top = `${top}%`;
      particle.style.left = `${left}%`;
      particle.style.opacity = '0';
      particle.style.pointerEvents = 'none';
      
      // Use CSS animations
      particle.style.animation = `
        particleFade ${duration * 3}s infinite ${delay}s alternate,
        particleFloat ${duration * 3}s infinite ${delay}s ease-in-out
      `;
      
      container.appendChild(particle);
      particles.push(particle);
    }
    
    // Create a style element for the animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particleFade {
        0% { opacity: 0.2; }
        50% { opacity: 0.6; }
        100% { opacity: 0.2; }
      }
      @keyframes particleFloat {
        0% { transform: translateY(0) scale(0.8); }
        50% { transform: translateY(-20px) scale(1.2); }
        100% { transform: translateY(0) scale(0.8); }
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      // Remove particles
      particles.forEach(particle => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
      });
      
      // Remove style
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [count, color, minSize, maxSize, minSpeed, maxSpeed]);
  
  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
} 