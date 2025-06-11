"use client";
import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script'; // Import the Script component
import { PRICING_OPTIONS } from '@/utils/products';

interface PricingSectionProps {
  selectedPrice: string;
  setSelectedPrice: (priceId: string) => void;
  selectedPriceRef: { current: string };
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

    const currentRef = pricingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handlePlanSelect = (optionId: string) => {
    if (selectedPrice !== optionId) {
        setSelectedPrice(optionId);
        selectedPriceRef.current = optionId;
      }
      setTimeout(() => {
        const el = document.getElementById('checkout');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 10);
  };

  const sortedPricingOptions = [...PRICING_OPTIONS].sort((a, b) => {
    const durationOrder: Record<string, number> = { 
      "14 days": 1, 
      "1 month": 2, 
      "3 months": 3, 
      "6 months": 4, 
      "12 months": 5 
    };
    return (durationOrder[a.duration] || 99) - (durationOrder[b.duration] || 99);
  });

  // NEW: Define the JSON-LD schema for the product and its offers
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Adobe Creative Cloud All Apps Subscription",
    "description": "Get genuine Adobe Creative Cloud subscriptions for up to 86% off. Includes all Adobe apps like Photoshop, Illustrator, and Premiere Pro with full functionality and updates.",
    "brand": {
      "@type": "Brand",
      "name": "Adobe"
    },
    "image": "https://cheapcc.online/og-image.jpg", // Make sure this is a valid, accessible URL
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": Math.min(...PRICING_OPTIONS.map(p => p.price)),
      "highPrice": Math.max(...PRICING_OPTIONS.map(p => p.price)),
      "offerCount": PRICING_OPTIONS.length,
      "offers": PRICING_OPTIONS.map(option => ({
        "@type": "Offer",
        "name": `Adobe Creative Cloud - ${option.duration}`,
        "price": option.price.toFixed(2),
        "priceCurrency": "USD",
        "description": option.description,
        "url": "https://cheapcc.online/#pricing",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "CheapCC"
        }
      }))
    }
  };

  return (
    <>
      {/* NEW: Add the Script component to inject the JSON-LD schema */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <section className="pricing" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={pricingRef}>
          <div className={`section-heading text-center mb-10 stagger-item ${isVisible ? 'visible' : ''}`}>
            <h2>Choose Your Plan</h2>
            <p>Select the best Adobe Creative Cloud subscription for your needs</p>
          </div>
          
          <div className="md:hidden text-center text-sm text-gray-500 mb-4">
            <i className="fas fa-arrows-alt-h mr-1.5"></i> Swipe to see all options
          </div>
          
          <div className="pricing-scroll-container">
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
                      style={{ width: '200px' }}
                    >
                      {option.id === '14d' && (
                        <div className="ribbon-container">
                          <div className="one-time-purchase-ribbon">One-time purchase</div>
                        </div>
                      )}
                      {option.id === '6m' && (
                        <div className="ribbon-container best-value-container">
                          <div className="best-value-ribbon">Best Value</div>
                        </div>
                      )}
                      <div className="plan-duration">{option.duration}</div>
                      <div className="plan-price">{option.price}</div>
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
        </div>
      </section>
    </>
  );
}