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

    const currentRef = counterRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && !animated) {
      setAnimated(true);
      const durations = [1500, 1500, 1500, 1500];
      counters.forEach((counter, idx) => {
        let start = 0;
        const end = counter.target;
        const duration = durations[idx];
        const startTime = performance.now();

        function animate(now: number) {
          const elapsed = now - startTime;
          const progress = elapsed / duration;
          const easedProgress = progress < 1
            ? 1 - Math.pow(2, -10 * progress)
            : 1;
          const current = Math.round(easedProgress * end);
          
          setCounters(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: current };
            return updated;
          });
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCounters(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], value: end };
              return updated.slice(); // Ensure re-render
            });
          }
        }
        requestAnimationFrame(animate);
      });
    }
  }, [isVisible, animated, counters]);

  return (
    <section className="bg-[#1a1a3a] lg:py-20 md:py-16 py-10 relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a3a] to-[#232355] z-0"></div>
      <div className="absolute inset-0 z-0">
        <div className="spotlight-mini spotlight-mini-1"></div>
        <div className="spotlight-mini spotlight-mini-2"></div>
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2Utb3BhY2l0eT0iLjAyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiLz48cGF0aCBkPSJNMCAzMGgzMHYzMEgweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9Ii41Ii8+PHBhdGggZD0iTTMwIDBIMHYzMGgzMHoiIHN0cm9rZS1vcGFjaXR5PSIuMDIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIvPjxwYXRoIGQ9Ik0zMCAwaDMwdjMwSDMweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9Ii41Ii8+PC9nPjwvc3ZnPg==')] opacity-5 z-0"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div
          className="max-w-5xl mx-auto"
          ref={counterRef}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {counters.map((counter, index) => (
              <div
                key={counter.id}
                className={`flex flex-col items-center text-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}