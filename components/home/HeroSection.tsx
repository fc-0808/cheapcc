"use client";
import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <div className="savings-badge">
          <i className="fas fa-tags" /> Save up to 86% vs Official Pricing
        </div>
        <h1>
          Unleash Your Creativity with<br />
          <span className="highlight">
            Adobe Creative Cloud
            <span className="highlight-underline" />
          </span>
        </h1>
        <p>
          Get the complete suite with all premium applications at a fraction of the official cost. Same powerful tools, same features, massive savings.
        </p>
        <div className="hero-features">
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
          className="primary-btn"
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