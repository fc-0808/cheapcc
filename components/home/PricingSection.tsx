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
    <section className="pricing min-h-screen flex items-center py-16 bg-gradient-to-b from-white to-gray-50" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl" ref={pricingRef}>
        <div className={`section-heading text-center mb-10 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-3">Choose Your Plan</h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">Select the best Adobe Creative Cloud subscription for your needs</p>
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="md:hidden text-center text-sm text-gray-500 mb-4">
          <i className="fas fa-arrows-alt-h mr-1"></i> Swipe to see all options
        </div>
        
        {/* All plans in a single row */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          <div className={`flex flex-nowrap gap-3 sm:gap-4 lg:gap-6 justify-center min-w-max stagger-item delay-100 ${isVisible ? 'visible' : ''}`}>
            {sortedPricingOptions.map((option) => (
              <div
                key={option.id}
                className={`plan-card flex-shrink-0 w-[230px] xs:w-[240px] sm:w-[210px] md:w-[190px] lg:w-[220px] ${selectedPrice === option.id ? 'selected' : ''} shadow-lg hover:shadow-xl transition-all`}
                onClick={() => handlePlanSelect(option.id)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedPrice === option.id}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePlanSelect(option.id)}
              >
                {option.id === '14d' && (
                  <div
                    className="absolute right-0 top-0 z-10 px-3 py-1 text-xs font-bold text-white rounded-bl-lg"
                    style={{
                      background: 'linear-gradient(90deg, #ff3366 0%, #a855f7 100%)',
                      transform: 'translateY(-40%) translateX(35%) rotate(18deg)',
                      boxShadow: '0 6px 24px rgba(255,51,102,0.25), 0 1.5px 6px rgba(168,85,247,0.18)',
                      letterSpacing: '0.03em',
                      fontSize: '13px',
                    }}
                  >
                    One-time purchase
                  </div>
                )}
                <div className="plan-duration text-gray-600 font-medium">{option.duration}</div>
                <div className="plan-price text-[2.5rem] font-bold text-primary-dark mb-1">${option.price}</div>
                <div className="plan-features">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <i className="fas fa-check text-accent mr-2 text-sm"></i>
                      <span>All Adobe Apps</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check text-accent mr-2 text-sm"></i>
                      <span>All AI features</span>
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-check text-accent mr-2 text-sm"></i>
                      <span>100GB Cloud</span>
                    </li>
                  </ul>
                </div>
                <button
                  className="select-btn mt-4 hover:bg-primary-light transition-colors"
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
    </section>
  );
} 