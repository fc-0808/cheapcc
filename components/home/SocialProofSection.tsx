"use client";
import React, { useState, useEffect, useRef } from 'react';

const INITIAL_COUNTERS = [
  { id: 'customers', value: 0, target: 150, label: 'Happy Customers', icon: 'fas fa-users', suffix: '+' },
  { id: 'activations', value: 0, target: 250, label: 'Successful Activations', icon: 'fas fa-check-circle', suffix: '+' },
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
    <section className="social-proof bg-gradient-to-br from-[#2c2d5a] to-[#1e0029] py-12">
      <div className="container">
        <div
          className="counter-container flex flex-wrap justify-center gap-6"
          ref={counterRef}
        >
          {counters.map((counter) => (
            <div key={counter.id} className={`counter-item stagger-item ${isVisible ? 'visible' : ''}`}>
              <i className={`${counter.icon} text-2xl`} />
              <div className={`counter-value ${animated ? 'animated' : ''}`}>
                {counter.value}
                {counter.suffix}
              </div>
              <div className="counter-label">{counter.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 