"use client";
import React, { useState, useEffect, useRef } from 'react';

const INITIAL_COUNTERS = [
  { id: 'customers', value: 0, target: 500, label: 'HAPPY CUSTOMERS', icon: 'fas fa-users', suffix: '+' },
  { id: 'activations', value: 0, target: 1500, label: 'SUCCESSFUL ACTIVATIONS', icon: 'fas fa-check-circle', suffix: '+' },
  { id: 'satisfaction', value: 0, target: 99, label: 'CUSTOMER SATISFACTION', icon: 'fas fa-star', suffix: '%' },
  { id: 'support', value: 0, target: 24, label: 'SUPPORT AVAILABILITY', icon: 'fas fa-headset', suffix: '/7' },
];

export default function SocialProofSection() {
  const [counters, setCounters] = useState(INITIAL_COUNTERS);
  const [animated, setAnimated] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && !animated) {
      setAnimated(true);
      const durations = [1500, 1500, 1500, 1500]; // Slightly longer, smoother animations
      counters.forEach((counter, idx) => {
        let start = 0;
        const end = counter.target;
        const duration = durations[idx];
        const startTime = performance.now();

        function animate(now: number) {
          const elapsed = now - startTime;
          // Use easeOutExpo for a more natural, professional animation feel
          const progress = elapsed / duration;
          const easedProgress = progress < 1 
            ? 1 - Math.pow(2, -10 * progress) 
            : 1;
          
          // Use Math.round to make sure we can reach the exact target value
          const current = Math.round(easedProgress * end);
          
          setCounters(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: current };
            return updated;
          });
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Explicitly set the final value to ensure it's exactly the target
            setCounters(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], value: end };
              return updated;
            });
          }
        }
        requestAnimationFrame(animate);
      });
    }
  }, [isVisible, animated]); 

  return (
    <section className="bg-[#1a1a3a] py-20 relative overflow-hidden">
      {/* Premium background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a3a] to-[#232355] z-0"></div>
      
      {/* Subtle spotlight animations */}
      <div className="absolute inset-0 z-0">
        <div className="spotlight-mini spotlight-mini-1"></div>
        <div className="spotlight-mini spotlight-mini-2"></div>
      </div>
      
      {/* Very subtle grid pattern for depth */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2Utb3BhY2l0eT0iLjAyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiLz48cGF0aCBkPSJNMCAzMGgzMHYzMEgweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9Ii41Ii8+PHBhdGggZD0iTTMwIDBIMHYzMGgzMHoiIHN0cm9rZS1vcGFjaXR5PSIuMDIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIvPjxwYXRoIGQ9Ik0zMCAwaDMwdjMwSDMweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9Ii41Ii8+PC9nPjwvc3ZnPg==')] opacity-5 z-0"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div 
          className="flex flex-col md:flex-row justify-center items-center md:justify-between max-w-5xl mx-auto"
          ref={counterRef}
        >
          {counters.map((counter, index) => (
            <React.Fragment key={counter.id}>
              <div 
                className={`flex flex-col items-center text-center my-6 md:my-0 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <i className={`${counter.icon} text-[#ff3366] text-3xl mb-4`}></i>
                <div className="text-white text-4xl font-bold mb-1">
                  {counter.value}{counter.suffix}
                </div>
                <div className="text-[#a0a0c0] text-xs tracking-wider font-medium uppercase">
                  {counter.label}
                </div>
              </div>
              
              {index < counters.length - 1 && (
                <div className="hidden md:block h-14 w-px bg-[#ffffff1a] mx-4"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
} 