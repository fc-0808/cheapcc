"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const HOME_FAQS = [
  {
    q: "How does cheapcc.online offer such low prices?",
    a: "As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 75% off compared to Adobe's official pricing while providing the same authentic product.",
  },
  {
    q: "Are these genuine Adobe Creative Cloud subscriptions?",
    a: "Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price.",
  },
  {
    q: "How quickly will I receive my Adobe account details?",
    a: "In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept payments through PayPal, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card. This ensures your payment information is secure and protected.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 7-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.",
  },
];


export default function HomeFAQSection() {
  const faqRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    if (faqRef.current) {
      observer.observe(faqRef.current);
    }
    return () => {
      if (faqRef.current) {
        observer.unobserve(faqRef.current);
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#171746] via-[#131347] to-[#151533] py-20 md:py-32" id="faq">
      {/* Animated Nebula and Stars - matching Hero section */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(120,_80,_255,_0.15),_transparent_70%)]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,_51,_102,_0.1),_transparent_70%)]"
        animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={faqRef}>
        <div className={`section-heading text-center mb-8 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 hero-3d-text">Frequently Asked Questions</h2>
          <p className="text-base sm:text-lg text-gray-300">Quick answers to common questions about our Adobe Creative Cloud subscriptions</p>
        </div>
        <div className={`faq-accordion max-w-3xl mx-auto stagger-item ${isVisible ? 'visible' : ''}`}>
          {HOME_FAQS.map((item, idx) => (
            <div
              key={idx}
              className={`faq-item border border-gray-200 rounded-lg mb-4 shadow-sm overflow-hidden ${openFaq === idx ? 'active bg-white' : 'bg-gray-50/90'}`} // Slightly transparent background
            >
              <div
                className="faq-question p-4 sm:p-5 flex justify-between items-center cursor-pointer"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                tabIndex={0}
                role="button"
                aria-expanded={openFaq === idx}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenFaq(openFaq === idx ? null : idx)}
              >
                <h3 className="text-base sm:text-lg font-medium text-[#2c2d5a] pr-8">{item.q}</h3>
                <span className={`faq-icon flex-shrink-0 text-[#ff3366] transition-transform duration-300 ease-in-out ${openFaq === idx ? 'transform rotate-180' : ''}`}>
                  <i className="fas fa-chevron-down" />
                </span>
              </div>
              {/* Updated faq-answer div */}
              <div
                className={`faq-answer overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === idx 
                    ? 'max-h-96 opacity-100 pt-0 pb-4 sm:pb-5 px-4 sm:px-5' // Added pt-0, padding applied when open
                    : 'max-h-0 opacity-0 px-4 sm:px-5' // Keep horizontal padding for smoother height transition
                }`}
              >
                {/* Inner p tag for the text content, no specific padding here */}
                <p className={`text-xs sm:text-sm md:text-base text-gray-600 ${openFaq === idx ? 'pt-2 border-t border-gray-100' : ''}`}>
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-faqs text-center mt-8 sm:mt-10">
          <a href="/faq" className="btn btn-outline inline-flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full border border-[#b9a7d1] text-[#2c2d5a] text-sm sm:text-base font-semibold hover:bg-[#f3f4f6] transition">
            <span>View All FAQs</span> <i className="fas fa-arrow-right" />
          </a>
        </div>
      </div>
    </section>
  );
}