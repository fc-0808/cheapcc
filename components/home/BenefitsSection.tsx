"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function BenefitsSection() {
  const benefitsRef = useRef<HTMLDivElement>(null);
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

    if (benefitsRef.current) {
      observer.observe(benefitsRef.current);
    }
    return () => {
      if (benefitsRef.current) {
        observer.unobserve(benefitsRef.current);
      }
    };
  }, []);

  return (
    <section className="benefits py-20 bg-white">
      <div className="container" ref={benefitsRef}>
        <div className={`section-heading text-center mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[#2c2d5a] to-[#484a9e] bg-clip-text text-transparent inline-block mb-2">
            Why Choose CheapCC?
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Authorized Adobe Creative Cloud subscriptions at significantly reduced prices compared to official channels
          </p>
        </div>
        <div className={`benefits-container grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-12 stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
          <div className="benefit-card">
            <i className="fas fa-piggy-bank" />
            <h3>Massive Savings</h3>
            <p>Pay up to 86% less than official Adobe pricing while getting the exact same product and benefits.</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-bolt" />
            <h3>Email Delivery</h3>
            <p>Receive your Adobe account details via email after purchase with all apps ready to download.</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-check-circle" />
            <h3>100% Genuine</h3>
            <p>Full access to all Creative Cloud apps and services with regular updates and cloud storage.</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-exchange-alt" />
            <h3>Alternative to cheapcc.net</h3>
            <p>cheapcc.online is your alternative destination to cheapcc.net for affordable Adobe Creative Cloud subscriptions.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 