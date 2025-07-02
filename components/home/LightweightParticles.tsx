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

// Create a module-level style element to avoid creating multiple styles
// This improves performance by not adding multiple style tags
const styleId = 'lightweight-particles-animation-style';
const ensureAnimationStyleExists = () => {
  if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes particle-float {
        0% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(5deg); }
        100% { transform: translateY(0) rotate(0deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

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
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const speedsRef = useRef<number[]>([]);
  const positionsRef = useRef<{x: number, y: number}[]>([]);
  const initializedRef = useRef(false);

  // Create and animate particles
  useEffect(() => {
    // Ensure our keyframes exist
    ensureAnimationStyleExists();
    
    if (!containerRef.current || initializedRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Create a document fragment for batch DOM operations
    const fragment = document.createDocumentFragment();
    const newParticles: HTMLDivElement[] = [];
    const newSpeeds: number[] = [];
    const newPositions: {x: number, y: number}[] = [];
    
    // Create all particles at once
    for (let i = 0; i < count; i++) {
      const size = Math.random() * (maxSize - minSize) + minSize;
      const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
      const x = Math.random() * containerWidth;
      const y = Math.random() * containerHeight;
      
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.opacity = (Math.random() * 0.6 + 0.4).toString();
      particle.style.animation = `particle-float ${Math.random() * 5 + 5}s infinite ease-in-out`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.willChange = 'transform';
      
      fragment.appendChild(particle);
      newParticles.push(particle);
      newSpeeds.push(speed);
      newPositions.push({x, y});
    }
    
    // Batch DOM update - add all particles at once
    container.appendChild(fragment);
    
    // Store references
    particlesRef.current = newParticles;
    speedsRef.current = newSpeeds;
    positionsRef.current = newPositions;
    initializedRef.current = true;
    
    // Animation function using requestAnimationFrame
    let lastTime = 0;
    const animate = (time: number) => {
      if (!containerRef.current) return;
      
      const deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Update particle positions
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i];
        const speed = speedsRef.current[i];
        const position = positionsRef.current[i];
        
        // Update position
        position.y -= speed * deltaTime;
        
        // Reset if out of bounds
        if (position.y < -10) {
          position.y = containerHeight + 10;
          position.x = Math.random() * containerWidth;
        }
        
        // Apply position - use transform for better performance
        particle.style.transform = `translate3d(0, ${position.y}px, 0)`;
        particle.style.left = `${position.x}px`;
      }
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clean up particles
      particlesRef.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      
      particlesRef.current = [];
      initializedRef.current = false;
    };
  }, [count, color, minSize, maxSize, minSpeed, maxSpeed]);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
} 