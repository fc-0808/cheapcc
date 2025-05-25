import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer style={{ pointerEvents: 'auto' }}>
    <div className="footer-container">
      <div className="footer-section footer-logo-section">
        <h3
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em' }}
        >
          <Link href="/" className="text-white hover:text-gray-200 transition-colors duration-150">
            Cheap <span className="text-[#ff3366]">CC</span>
          </Link>
        </h3>
        <p>
          Affordable Adobe Creative Cloud subscriptions for everyone. Access top-tier software without breaking the bank.
        </p>
        <div className="footer-social-icons">
          <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
        </div>
      </div>

      <div className="footer-section">
        <h3 className="text-lg font-semibold mb-4">
          Quick Links
        </h3>
        <ul className="footer-links">
          <li>
            <Link href="/" className="footer-link">
              <i className="fas fa-home footer-link-icon"></i>Home
            </Link>
          </li>
          <li>
            <Link href="/#pricing" className="footer-link">
              <i className="fas fa-tags footer-link-icon"></i>Pricing
            </Link>
          </li>
          <li>
            <Link href="/faq" className="footer-link">
              <i className="fas fa-question-circle footer-link-icon"></i>FAQ
            </Link>
          </li>
          <li>
            <a href="mailto:support@cheapcc.online">
              <i className="fas fa-envelope footer-link-icon"></i>Support
            </a>
          </li>
        </ul>
      </div>

      <div className="footer-section">
        <h3 className="text-lg font-semibold mb-4">
          Legal
        </h3>
        <ul className="footer-links">
          <li>
            <Link href="/terms" className="footer-link">
              <i className="fas fa-file-contract footer-link-icon"></i>Terms of Service
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="footer-link">
              <i className="fas fa-shield-alt footer-link-icon"></i>Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/refund" className="footer-link">
              <i className="fas fa-undo-alt footer-link-icon"></i>Refund Policy
            </Link>
          </li>
        </ul>
      </div>

      <div className="footer-section">
        <h3 className="text-lg font-semibold mb-4">
          Contact Us
        </h3>
        <ul className="footer-links">
          <li>
            <a href="mailto:support@cheapcc.online">
              <i className="fas fa-at footer-link-icon"></i>support@cheapcc.online
            </a>
          </li>
          <li>
            <Link href="/#faq" className="footer-link">
              <i className="fas fa-comments footer-link-icon"></i>Help Center
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="copyright">
      &copy; {new Date().getFullYear()} CheapCC. All rights reserved. Designed with <i className="fas fa-heart text-red-500"></i>.
    </div>
  </footer>
);

export default Footer; 