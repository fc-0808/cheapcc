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

export default function TestimonialsSection() {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonialTimeout = useRef<NodeJS.Timeout | null>(null);

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

    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current);
    }
    return () => {
      if (testimonialsRef.current) {
        observer.unobserve(testimonialsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (testimonialTimeout.current) clearTimeout(testimonialTimeout.current);
    testimonialTimeout.current = setTimeout(() => {
      setTestimonialIdx((idx) => (idx + 1) % TESTIMONIALS_DATA.length);
    }, 6000);
    return () => { if (testimonialTimeout.current) clearTimeout(testimonialTimeout.current); };
  }, [testimonialIdx]);

  const currentTestimonial = TESTIMONIALS_DATA[testimonialIdx];

  return (
    <section className="testimonials py-10 sm:py-16 md:py-20 bg-gradient-to-br from-[#f8f9fa] to-white" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={testimonialsRef}>
        <div className={`section-heading text-center mb-8 sm:mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2c2d5a] mb-2">What Our Customers Say</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500" style={{ fontWeight: 'normal', position: 'relative', zIndex: '2' }}>
            Real feedback from real users
          </p>
        </div>
        
        <div className={`testimonials-container max-w-xl mx-auto stagger-item ${isVisible ? 'visible' : ''}`}>
          {currentTestimonial && (
            <div className="testimonial-card bg-white rounded-xl shadow-md p-6 sm:p-8 relative">
              <div className="testimonial-quote absolute text-6xl text-[#ff3366]/5 top-4 left-4">
              </div>
              
              <div className="testimonial-rating flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < currentTestimonial.rating ? 'text-yellow-400' : 'text-gray-300'} text-lg`}
                  />
                ))}
              </div>
              
              <div className="testimonial-text text-gray-600 text-base sm:text-lg mb-4 relative z-10">
                "{currentTestimonial.text}"
              </div>
              
              <div className="testimonial-author flex items-center">
                <div className="author-avatar w-10 h-10 bg-[#ff3366]/10 rounded-full flex items-center justify-center text-[#ff3366]">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-details ml-3">
                  <div className="author-name text-[#2c2d5a] font-semibold">{currentTestimonial.name}</div>
                  <div className="author-title text-gray-500 text-xs sm:text-sm">{currentTestimonial.title}</div>
                  <span className="verified-badge inline-flex items-center text-xs text-green-600 mt-1">
                    <i className="fas fa-check-circle mr-1" /> Verified Buyer
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6 justify-center">
          {TESTIMONIALS_DATA.map((_, idx) => (
            <button
              key={idx}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                testimonialIdx === idx 
                  ? 'bg-[#ff3366]' 
                  : 'bg-[#b9a7d1] hover:bg-[#ff3366]/50'
              }`}
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => setTestimonialIdx(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 