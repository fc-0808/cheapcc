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
    <section className="testimonials" id="testimonials">
      <div className="container" ref={testimonialsRef}>
        <div className={`section-heading text-center mb-12 stagger-item ${isVisible ? 'visible' : ''}`}>
          <h2 className="mb-2">What Our Customers Say</h2>
          <p className="text-lg text-gray-500" style={{ color: '#4b5563', fontWeight: 'normal', position: 'relative', zIndex: '2' }}>
            Real feedback from real users
          </p>
        </div>
        <div className={`testimonials-container stagger-item ${isVisible ? 'visible' : ''}`}>
          {currentTestimonial && (
            <div className="testimonial-card" key={currentTestimonial.id}>
              <div className="testimonial-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < currentTestimonial.rating ? '' : 'inactive'}`}></i>
                ))}
              </div>
              <div className="testimonial-text">{currentTestimonial.text}</div>
              <div className="testimonial-author">
                <div className="author-details">
                  <div className="author-name">{currentTestimonial.name}</div>
                  <div className="author-title">{currentTestimonial.title}</div>
                  <span className="verified-badge"><i className="fas fa-check-circle" /> Verified Buyer</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6 justify-center">
          {TESTIMONIALS_DATA.map((_, idx) => (
            <button
              key={idx}
              className={`btn btn-outline ${testimonialIdx === idx ? 'active' : ''}`}
              style={{ width: 12, height: 12, borderRadius: '50%', padding: 0, minWidth: 0, minHeight: 0, borderWidth: 2, borderColor: testimonialIdx === idx ? '#ff3366' : '#b9a7d1', background: testimonialIdx === idx ? '#ff3366' : 'transparent' }}
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => setTestimonialIdx(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 