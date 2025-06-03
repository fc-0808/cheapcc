"use client";
import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="savings-badge mx-auto mb-4 sm:mb-6">
          <i className="fas fa-tags" /> Save up to 86% vs Official Pricing
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
          Unleash Your Creativity with<br className="hidden sm:block" />
          <span className="highlight">
            Adobe Creative Cloud
            <span className="highlight-underline" />
          </span>
        </h1>
        <p className="text-sm sm:text-lg md:text-xl max-w-lg md:max-w-2xl mx-auto">
          Access the full Adobe Creative Cloud suite for less. Genuine apps, huge savings.
        </p>
        <div className="hero-features hidden sm:flex sm:flex-col md:flex-row md:flex-wrap justify-center items-center gap-3 sm:gap-4 my-6 sm:my-8">
          <div className="hero-feature">
            <i className="fas fa-check-circle" /> All Creative Cloud Apps
          </div>
          <div className="hero-feature">
            <i className="fas fa-check-circle" /> 100GB Cloud Storage
          </div>
          <div className="hero-feature">
            <i className="fas fa-check-circle" /> Adobe Firefly Included
          </div>
        </div>
        <a
          href="#pricing"
          className="primary-btn inline-block w-full sm:w-auto text-center"
          onClick={e => {
            e.preventDefault();
            const el = document.getElementById('pricing');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <i className="fas fa-bolt" /> View Plans & Pricing
        </a>
      </div>
    </section>
  );
} 