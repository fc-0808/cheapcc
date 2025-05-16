import React from 'react';

const gradientText =
  'bg-gradient-to-r from-[#ff3366] via-[#ff6b8b] to-[#2c2d5a] bg-clip-text text-transparent';
const gradientUnderline =
  'after:absolute after:left-0 after:-bottom-1 after:w-10 after:h-0.5 after:bg-gradient-to-r after:from-[#ff3366] after:via-[#ff6b8b] after:to-[#ff3366] after:rounded-full after:content-["\""]';

const Footer: React.FC = () => (
  <footer
    className="bg-[#181028] text-white py-16 mt-20 relative z-10"
    style={{ pointerEvents: 'auto' }}
  >
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 footer-container">
      <div>
        <h3
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em' }}
        >
          <span className="text-white">Cheap </span><span className="text-[#ff3366]">CC</span>
        </h3>
        <p className="text-sm text-white/80 max-w-xs">
          Affordable Adobe Creative Cloud subscriptions for everyone.
        </p>
      </div>
      <div>
        <h3
          className="text-lg font-semibold mb-3 relative text-[#ff3366]"
        >
          Quick Links
        </h3>
        <ul className="footer-links space-y-2 mt-2">
          <li>
            <a href="/" className="hover:underline transition-colors duration-150">
              Home
            </a>
          </li>
          <li>
            <a href="/#pricing" className="hover:underline transition-colors duration-150">
              Pricing
            </a>
          </li>
          <li>
            <a href="mailto:support@cheapcc.online" className="hover:underline transition-colors duration-150">
              Support
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3
          className="text-lg font-semibold mb-3 relative text-[#ff3366]"
        >
          Legal
        </h3>
        <ul className="footer-links space-y-2 mt-2">
          <li>
            <a href="/terms" className="hover:underline transition-colors duration-150">
              Terms of Service
            </a>
          </li>
          <li>
            <a href="/privacy" className="hover:underline transition-colors duration-150">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/refund" className="hover:underline transition-colors duration-150">
              Refund Policy
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3
          className="text-lg font-semibold mb-3 relative text-[#ff3366]"
        >
          Contact
        </h3>
        <ul className="footer-links space-y-2 mt-2">
          <li>
            <a href="mailto:support@cheapcc.online" className="hover:underline transition-colors duration-150">
              support@cheapcc.online
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="copyright border-t border-white/10 mt-12 pt-8 text-center text-xs text-white/60">
      &copy; {new Date().getFullYear()} CheapCC. All rights reserved.
    </div>
  </footer>
);

export default Footer; 