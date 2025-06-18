import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer style={{ pointerEvents: 'auto' }} className="bg-[#2c2d5a] text-white py-10 sm:py-16">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="footer-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
        <div className="footer-section footer-logo-section">
          <h3
            className="text-xl sm:text-2xl font-bold mb-3"
            style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em' }}
          >
            <Link href="/" className="text-white hover:text-gray-200 transition-colors duration-150">
              Cheap <span className="text-[#ff3366]">CC</span>
            </Link>
          </h3>
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            CheapCC provides affordable Adobe Creative Cloud subscriptions for everyone. Access top-tier software without breaking the bank with CheapCC's exclusive pricing.
          </p>
          <div className="footer-social-icons flex gap-4">
            <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff3366] transition-colors duration-150">
              <i className="fab fa-facebook-f text-lg"></i>
            </a>
            <a href="https://x.com/cheapcc137024" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff3366] transition-colors duration-150">
              <i className="fab fa-x-twitter text-lg"></i>
            </a>
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff3366] transition-colors duration-150">
              <i className="fab fa-instagram text-lg"></i>
            </a>
            <a href="https://www.youtube.com/@cheapcc-online" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ff3366] transition-colors duration-150">
              <i className="fab fa-youtube text-lg"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Quick Links
          </h3>
          <ul className="footer-links space-y-2">
            <li>
              <Link href="/" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-home footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-tags footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">Pricing</span>
              </Link>
            </li>
            <li>
              <Link href="/faq" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-question-circle footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">FAQ</span>
              </Link>
            </li>
            <li>
              <a href="mailto:support@cheapcc.online" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-envelope footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">Support</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Legal
          </h3>
          <ul className="footer-links space-y-2">
            <li>
              <Link href="/terms" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-file-contract footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">Terms of Service</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-shield-alt footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">Privacy Policy</span>
              </Link>
            </li>
            <li>
              <Link href="/refund" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-undo-alt footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">Refund Policy</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Contact Us
          </h3>
          <ul className="footer-links space-y-2">
            <li>
              <a href="mailto:support@cheapcc.online" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-at footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm break-all">support@cheapcc.online</span>
              </a>
            </li>
            <li>
              <Link href="/#faq" className="footer-link text-gray-300 hover:text-[#ff3366] transition-colors duration-150 flex items-center">
                <i className="fas fa-comments footer-link-icon mr-2 text-[#ff3366] text-xs"></i>
                <span className="text-sm">Help Center</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div className="copyright text-center text-sm mt-8 pt-6 border-t border-gray-700 text-gray-400">
      &copy; {new Date().getFullYear()} CheapCC.online. All rights reserved. CheapCC - Designed with <i className="fas fa-heart text-red-500"></i>.
    </div>
  </footer>
);

export default Footer; 