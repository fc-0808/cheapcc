"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  text: string;
  rating: number;
  avatar?: string;
  verified: boolean;
  savings: string;
  usageDuration: string;
  companyLogo?: string;
}

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 1,
    name: "Alexandra Chen",
    title: "Senior UX Designer",
    company: "TechFlow Studios",
    location: "San Francisco, CA",
    text: "After switching to CheapCC, our design team saved over $8,400 annually while maintaining full access to Adobe's creative suite. The seamless activation process and 24/7 support have been exceptional. We've been using it for 18 months without a single issue.",
    rating: 5,
    verified: true,
    savings: "$8,400/year",
    usageDuration: "18 months",
    companyLogo: "techflow"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    title: "Creative Director",
    company: "Pixel Perfect Agency",
    location: "Austin, TX",
    text: "As a creative agency managing 12 Adobe licenses, CheapCC has been a game-changer. We've cut our software costs by 75% without compromising on functionality. The fast delivery and genuine Adobe accounts make this the smartest business decision we've made.",
    rating: 5,
    verified: true,
    savings: "$15,600/year",
    usageDuration: "2+ years",
    companyLogo: "pixelperfect"
  },
  {
    id: 3,
    name: "Sarah Kim",
    title: "Freelance Photographer",
    company: "SK Photography",
    location: "Portland, OR",
    text: "I was hesitant about third-party Adobe subscriptions, but CheapCC exceeded all expectations. The subscription is 100% legitimate, includes all Creative Cloud apps, and their customer service responds within hours. I've saved $1,200 this year alone.",
    rating: 5,
    verified: true,
    savings: "$1,200/year",
    usageDuration: "14 months",
    companyLogo: "sk"
  },
  {
    id: 4,
    name: "David Thompson",
    title: "Video Production Manager",
    company: "MediaCraft Productions",
    location: "Los Angeles, CA",
    text: "Our post-production team relies heavily on Premiere Pro, After Effects, and Audition. CheapCC provides the same professional-grade access at a fraction of Adobe's direct pricing. The reliability and support quality rival Adobe's own service.",
    rating: 5,
    verified: true,
    savings: "$6,800/year",
    usageDuration: "2+ years",
    companyLogo: "mediacraft"
  },
  {
    id: 5,
    name: "Emily Watson",
    title: "Brand Designer",
    company: "Watson Design Co.",
    location: "Chicago, IL",
    text: "CheapCC transformed my freelance business economics. Instead of paying Adobe's premium rates, I invest those savings back into my business. The activation was immediate, and I've had zero downtime in 20 months of usage.",
    rating: 5,
    verified: true,
    savings: "$1,800/year",
    usageDuration: "20 months",
    companyLogo: "watson"
  },
  {
    id: 6,
    name: "James Liu",
    title: "Art Director",
    company: "Innovation Labs",
    location: "Seattle, WA",
    text: "Managing creative software costs for our startup was challenging until we discovered CheapCC. We equipped our entire design team with Adobe Creative Cloud for less than what we'd pay for 3 direct subscriptions. Outstanding value and service.",
    rating: 5,
    verified: true,
    savings: "$4,200/year",
    usageDuration: "16 months",
    companyLogo: "innovation"
  }
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
  const [isPaused, setIsPaused] = useState(false);
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
    if (isPaused) return;
    
    if (testimonialTimeoutRef.current) {
      clearTimeout(testimonialTimeoutRef.current);
    }
    testimonialTimeoutRef.current = setTimeout(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 8000); // Rotate every 8 seconds

    return () => {
      if (testimonialTimeoutRef.current) {
        clearTimeout(testimonialTimeoutRef.current);
      }
    };
  }, [activeTestimonial, isPaused]);

  const currentData = TESTIMONIALS_DATA[activeTestimonial];

  const handleTestimonialChange = (index: number) => {
    setActiveTestimonial(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Resume auto-rotation after 10 seconds
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-32" id="testimonials">
      {/* Professional Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,_130,_246,_0.05),_transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(16,_185,_129,_0.03)_0%,_transparent_50%,_rgba(139,_92,_246,_0.03)_100%)]" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={testimonialsRef}>
        {/* Professional Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-300 font-medium text-sm">Trusted by 500+ Professionals</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">Customers Say</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real testimonials from creative professionals, agencies, and businesses who've transformed their workflow with CheapCC
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white font-semibold">4.9/5 Rating</span>
            </div>
            <div className="text-emerald-400 font-semibold">
              <i className="fas fa-shield-check mr-2"></i>100% Verified Reviews
            </div>
            <div className="text-blue-400 font-semibold">
              <i className="fas fa-clock mr-2"></i>24/7 Support
            </div>
          </div>
        </motion.div>

        {/* Main Testimonial Card */}
        <motion.div 
          className="max-w-5xl mx-auto mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            {currentData && (
              <motion.div
                key={currentData.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-2xl" />
                
                {/* Quote Icon */}
                <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L25.864 4z" />
                  </svg>
                </div>

                <div className="relative z-10 pt-16">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.svg 
                        key={i} 
                        className="w-6 h-6 text-yellow-400"
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="mb-8">
                    <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-white font-light">
                      "{currentData.text}"
                    </p>
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {getInitials(currentData.name)}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-lg">{currentData.name}</div>
                        <div className="text-blue-300 font-medium">{currentData.title}</div>
                        <div className="text-gray-400 text-sm">{currentData.company} • {currentData.location}</div>
                      </div>
                    </div>

                    {/* Professional Badges */}
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-300 text-sm font-medium">
                        <i className="fas fa-check-circle mr-2"></i>Verified Customer
                      </div>
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 text-blue-300 text-sm font-medium">
                        <i className="fas fa-piggy-bank mr-2"></i>Saved {currentData.savings}
                      </div>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 text-purple-300 text-sm font-medium">
                        <i className="fas fa-clock mr-2"></i>{currentData.usageDuration}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Dots */}
        <motion.div 
          className="flex justify-center gap-3 mb-12"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {TESTIMONIALS_DATA.map((_, idx) => (
            <button
              key={idx}
              className={`relative h-3 rounded-full transition-all duration-300 ${
                activeTestimonial === idx 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8 shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-600 w-3 hover:bg-gray-500'
              }`}
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => handleTestimonialChange(idx)}
            />
          ))}
        </motion.div>

        {/* Additional Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 mb-2">
              $2.4M+
            </div>
            <div className="text-gray-300 font-medium">Total Customer Savings</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              99.8%
            </div>
            <div className="text-gray-300 font-medium">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 mb-2">
              24/7
            </div>
            <div className="text-gray-300 font-medium">Expert Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}