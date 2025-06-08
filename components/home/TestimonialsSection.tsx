"use client";
import React, { useState, useEffect, useRef } from 'react';

const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: "Alex J.",
    title: "Designer, Freelancer",
    text: "CheapCC saved me hundreds! The process was smooth and I got my Adobe account instantly. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    name: "Maria S.",
    title: "Marketing Lead",
    text: "I was skeptical at first, but the subscription is 100% genuine. Support was super responsive too.",
    rating: 5,
  },
  {
    id: 3,
    name: "David P.",
    title: "Student",
    text: "As a student, this is a game changer. All apps, no issues, and a fraction of the price.",
    rating: 5,
  },
  {
    id: 4,
    name: "Priya K.",
    title: "Photographer",
    text: "The best deal for Adobe CC online. Fast delivery and great customer service!",
    rating: 5,
  },
];

// Helper to generate initials for avatars
const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function TestimonialsSection() {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const currentRef = testimonialsRef.current;
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
    if (testimonialTimeoutRef.current) {
      clearTimeout(testimonialTimeoutRef.current);
    }
    testimonialTimeoutRef.current = setTimeout(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 6000); // Rotate every 6 seconds

    return () => {
      if (testimonialTimeoutRef.current) {
        clearTimeout(testimonialTimeoutRef.current);
      }
    };
  }, [activeTestimonial]);

  const currentData = TESTIMONIALS_DATA[activeTestimonial];

  return (
    <section className="testimonials py-16 sm:py-20 bg-gray-50" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={testimonialsRef}>
        <div className={`section-heading text-center mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real feedback from designers, photographers, and students who saved with us.
          </p>
        </div>
        
        <div className={`relative max-w-2xl mx-auto min-h-[300px] flex items-center justify-center stagger-item ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
          {currentData && (
            <div key={currentData.id} className="testimonial-card animate-testimonial-in w-full">
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 relative overflow-hidden">
                <svg className="absolute top-8 left-8 w-24 h-24 text-gray-50" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L25.864 4z" />
                </svg>
                <div className="relative z-10">
                  <div className="flex mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < currentData.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {/* FIX: Reverted to the site's default sans-serif font and made it italic for a clean, modern style */}
                  <blockquote className="relative">
                    <p className="font-serif italic text-xl md:text-2xl leading-relaxed text-gray-800 mb-6">
                      {currentData.text}
                    </p>
                  </blockquote>
                  <div className="flex items-center">
                    <div className="author-avatar w-12 h-12 bg-gradient-to-br from-[#ffdde1] to-[#ee9ca7] rounded-full flex items-center justify-center text-[#ff3366] font-bold text-lg shadow-inner">
                      {getInitials(currentData.name)}
                    </div>
                    <div className="author-details ml-4">
                      <div className="author-name text-gray-900 font-semibold">{currentData.name}</div>
                      <div className="author-title text-gray-500 text-sm">{currentData.title}</div>
                    </div>
                    <div className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Verified Buyer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-8 justify-center">
          {TESTIMONIALS_DATA.map((_, idx) => (
            <button
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeTestimonial === idx 
                  ? 'bg-[#ff3366] w-6' 
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => setActiveTestimonial(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}