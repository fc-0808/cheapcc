"use client";
import React, { useState, useEffect, useRef } from 'react';
import { PRICING_OPTIONS } from '@/utils/products'; // Assuming PRICING_OPTIONS is exported

interface PricingSectionProps {
  selectedPrice: string;
  setSelectedPrice: (priceId: string) => void;
  selectedPriceRef: React.MutableRefObject<string>;
}

export default function PricingSection({ selectedPrice, setSelectedPrice, selectedPriceRef }: PricingSectionProps) {
  const pricingRef = useRef<HTMLDivElement>(null);
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

    if (pricingRef.current) {
      observer.observe(pricingRef.current);
    }
    return () => {
      if (pricingRef.current) {
        observer.unobserve(pricingRef.current);
      }
    };
  }, []);

  const handlePlanSelect = (optionId: string) => {
    if (selectedPrice !== optionId) {
        setSelectedPrice(optionId);
        selectedPriceRef.current = optionId;
      }
      // Smooth scroll to checkout section
      setTimeout(() => {
        const el = document.getElementById('checkout');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 10); // Small delay to ensure state update if needed
  };

  // Sort pricing options by duration or logical order
  const sortedPricingOptions = [...PRICING_OPTIONS].sort((a, b) => {
    // Custom sorting logic to ensure proper order (14d, 1m, 3m, 6m, 12m)
    const durationOrder: Record<string, number> = { 
      "14 days": 1, 
      "1 month": 2, 
      "3 months": 3, 
      "6 months": 4, 
      "12 months": 5 
    };
    return (durationOrder[a.duration] || 99) - (durationOrder[b.duration] || 99);
  });

  return (
    <section className="pricing" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={pricingRef}>
        <div className={`section-heading text-center mb-10 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2>Choose Your Plan</h2>
          <p>Select the best Adobe Creative Cloud subscription for your needs</p>
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="md:hidden text-center text-sm text-gray-500 mb-4">
          <i className="fas fa-arrows-alt-h mr-1.5"></i> Swipe to see all options
        </div>
        
        {/* === MODIFICATION START === */}
        {/* This new wrapper enables the fade-out gradient effect */}
        <div className="pricing-scroll-container">
            {/* Plans container with horizontal scrolling on mobile */}
            <div className="overflow-x-auto pb-4" style={{ overflowY: 'visible' }}>
              <div className="flex justify-center" style={{ minWidth: 'max-content' }}>
                {sortedPricingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`plan-card mx-2 ${selectedPrice === option.id ? 'selected' : ''}`}
                    onClick={() => handlePlanSelect(option.id)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedPrice === option.id}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
                    style={{ width: '200px' }} // Fixed width for consistent sizing
                  >
                    {option.id === '14d' && (
                      <div className="ribbon-container">
                        <div className="one-time-purchase-ribbon">One-time purchase</div>
                      </div>
                    )}
                    <div className="plan-duration">{option.duration}</div>
                    <div className="plan-price">${option.price}</div>
                    <div className="plan-features">
                      <ul>
                        <li>All Adobe Apps</li>
                        <li>All AI features</li>
                        <li>100GB Cloud</li>
                      </ul>
                    </div>
                    <button
                      className="select-btn"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handlePlanSelect(option.id);
                      }}
                    >
                      {selectedPrice === option.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </div>
        {/* === MODIFICATION END === */}

      </div>
    </section>
  );
}