"use client";
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer 
      className="relative py-20 sm:py-28 -mt-20 sm:-mt-28"
    >
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div 
          className="footer-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10"
        >
          {/* Logo Section */}
          <div className="footer-section footer-logo-section">
            <h3
              className="text-xl sm:text-2xl font-bold mb-6"
              style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em' }}
            >
              <Link href="/" prefetch={false} className="text-white hover:text-gray-200 transition-colors duration-150">
                <span>
                  Cheap <span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
                    style={{ backgroundSize: "200% 100%" }}
                  >CC</span>
                </span>
              </Link>
            </h3>
            
            <p 
              className="text-sm text-gray-300 mb-7 font-light leading-relaxed"
            >
              Providing affordable Adobe Creative Cloud subscriptions with premium support and instant delivery.
            </p>
            
            <div 
              className="footer-social-icons flex gap-5"
            >
              <a 
                href="https://www.instagram.com/cheapcc_online/" 
                aria-label="Instagram" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:border-pink-500/30 transition-colors duration-150 group"
              >
                <i className="fab fa-instagram text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-500 group-hover:via-pink-500 group-hover:to-red-500 transition-colors duration-300"></i>
              </a>
              
              <a 
                href="https://x.com/cheapcc137024" 
                aria-label="X (Twitter)" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:border-pink-500/30 transition-colors duration-150 group"
              >
                <i className="fab fa-x-twitter text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-500 group-hover:via-pink-500 group-hover:to-red-500 transition-colors duration-300"></i>
              </a>
              
              <a 
                href="https://www.youtube.com/@cheapcc-online" 
                aria-label="YouTube" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:border-pink-500/30 transition-colors duration-150 group"
              >
                <i className="fab fa-youtube text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuchsia-500 group-hover:via-pink-500 group-hover:to-red-500 transition-colors duration-300"></i>
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section relative">
            <div className="absolute left-0 top-0 h-12 w-px bg-gradient-to-b from-transparent via-pink-500/30 to-transparent hidden lg:block"></div>
            <h3 
              className="text-base sm:text-lg font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
            >
              Quick Links
            </h3>
            
            <ul className="footer-links space-y-4">
              <li>
                <Link href="/" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-home text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">Home</span>
                </Link>
              </li>
              
              <li>
                <Link href="/#pricing" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-tags text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">Pricing</span>
                </Link>
              </li>
              
              <li>
                <Link href="/faq" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-question-circle text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">FAQ</span>
                </Link>
              </li>
              
              <li>
                <a href="mailto:support@cheapcc.online" className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-envelope text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">Support</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="footer-section relative">
            <div className="absolute left-0 top-0 h-12 w-px bg-gradient-to-b from-transparent via-pink-500/30 to-transparent hidden lg:block"></div>
            <h3 
              className="text-base sm:text-lg font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
            >
            Legal
            </h3>
            
            <ul className="footer-links space-y-4">
              <li>
                <Link href="/terms" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-file-contract text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">Terms of Service</span>
                </Link>
              </li>
              
              <li>
                <Link href="/privacy" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-shield-alt text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">Privacy Policy</span>
                </Link>
              </li>
              
              <li>
                <Link href="/refund" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-undo-alt text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">Refund Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="footer-section relative">
            <div className="absolute left-0 top-0 h-12 w-px bg-gradient-to-b from-transparent via-pink-500/30 to-transparent hidden lg:block"></div>
            <h3 
              className="text-base sm:text-lg font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500"
            >
            Contact Us
            </h3>
            
            <ul className="footer-links space-y-4">
              <li>
                <a href="mailto:support@cheapcc.online" className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-at text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light break-all">support@cheapcc.online</span>
                </a>
              </li>
              
              <li>
                <Link href="/#faq" prefetch={false} className="footer-link text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-fuchsia-500 hover:via-pink-500 hover:to-red-500 transition-colors duration-300 flex items-center group">
                  <div 
                    className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-pink-500/30 group-hover:bg-white/10 transition-all duration-300"
                  >
                    <i className="fas fa-comments text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-xs"></i>
                  </div>
                  <span className="text-sm font-light">Help Center</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright Section - styled as a floating pill */}
      <div 
        className="copyright text-center text-sm mt-16 text-gray-400/80 relative z-10 container mx-auto px-4 sm:px-6"
      >
        <div 
          className="backdrop-blur-sm py-3 px-6 rounded-full inline-flex items-center gap-2 bg-white/5 border border-white/10 shadow-lg hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300"
        >
          <span className="font-light">&copy; {new Date().getFullYear()} CheapCC.online</span>
          <span className="mx-1 h-1 w-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 opacity-70"></span>
          <span className="font-light">All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 