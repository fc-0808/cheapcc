"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function HowItWorksSection() {
  const howItWorksRef = useRef<HTMLDivElement>(null);
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

    if (howItWorksRef.current) {
      observer.observe(howItWorksRef.current);
    }
    return () => {
      if (howItWorksRef.current) {
        observer.unobserve(howItWorksRef.current);
      }
    };
  }, []);

  return (
    <section className="how-it-works py-20 bg-white">
      <div className="container">
        <div className={`section-heading text-center mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-4xl font-extrabold text-[#2c2d5a] mb-2">How It Works</h2>
          <p className="text-lg text-gray-500">Getting your Adobe Creative Cloud subscription is simple and fast</p>
        </div>
        <div className="steps-container" ref={howItWorksRef}>
          <div className={`step stagger-item ${isVisible ? 'visible' : ''}`}>
            <div className="step-number">1</div>
            <h3>Choose a Plan</h3>
            <p>Select the subscription duration that best fits your needs.</p>
          </div>
          <div className={`step stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
            <div className="step-number">2</div>
            <h3>Complete Purchase</h3>
            <p>Enter your email and pay securely with PayPal.</p>
          </div>
          <div className={`step stagger-item delay-200 ${isVisible ? 'visible' : ''}`}>
            <div className="step-number">3</div>
            <h3>Receive Details</h3>
            <p>Get your Adobe account information delivered via email.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 