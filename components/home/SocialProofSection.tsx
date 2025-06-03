"use client";
import React, { useState, useEffect, useRef } from 'react';

const INITIAL_COUNTERS = [
  { id: 'customers', value: 0, target: 500, label: 'Happy Customers', icon: 'fas fa-users', suffix: '+' },
  { id: 'activations', value: 0, target: 1500, label: 'Successful Activations', icon: 'fas fa-check-circle', suffix: '+' },
  { id: 'satisfaction', value: 0, target: 99, label: 'Customer Satisfaction', icon: 'fas fa-star', suffix: '%' },
  { id: 'support', value: 0, target: 24, label: 'Support Availability', icon: 'fas fa-headset', suffix: '/7' },
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
      const durations = [1200, 1200, 1200, 1200]; // Durations for each counter animation
      counters.forEach((counter, idx) => {
        let start = 0;
        const end = counter.target;
        const duration = durations[idx];
        const startTime = performance.now();

        function animate(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(progress * (end - start) + start);
          setCounters(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: current };
            return updated;
          });
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
             // Ensure target is set at the end
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
  }, [isVisible, animated]); // Removed counters from dependency array

  return (
    <section className="social-proof bg-gradient-to-br from-[#2c2d5a] to-[#1e0029] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="counter-container grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          ref={counterRef}
        >
          {counters.map((counter) => (
            <div 
              key={counter.id} 
              className={`counter-item flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg bg-white/10 backdrop-blur-sm stagger-item ${isVisible ? 'visible' : ''}`}
            >
              <i className={`${counter.icon} text-xl sm:text-2xl text-pink-300 mb-2`} />
              <div className={`counter-value text-2xl sm:text-3xl md:text-4xl font-bold text-white ${animated ? 'animated' : ''}`}>
                {counter.value}
                <span className="counter-suffix">{counter.suffix}</span>
              </div>
              <div className="counter-label text-sm sm:text-base text-pink-100 mt-1 text-center">{counter.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 