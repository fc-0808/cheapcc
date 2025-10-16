'use client';
import React, { memo, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  user: any;
  userName: string;
  handleNavLinkClick: () => void;
  handleLogout: () => Promise<void>;
  isBlogPage: boolean;
  isAdmin?: boolean;
}

// This component is loaded dynamically to reduce the initial load size
const MobileMenu = memo(({
  user,
  userName,
  handleNavLinkClick,
  handleLogout,
  isBlogPage,
  isAdmin = false
}: MobileMenuProps) => {
  const pathname = usePathname();
  const isDashboardOrProfile = pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile');
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle touch swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    
    // If swiping down, apply transformation
    if (diff > 10) {
      if (menuRef.current) {
        // Apply transform based on touch position
        const translateY = Math.min(diff * 0.3, 100);
        menuRef.current.style.transform = `translateY(${translateY}px)`;
        menuRef.current.style.opacity = `${1 - (translateY / 200)}`;
      }
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;
    touchEndY.current = e.changedTouches[0].clientY;
    
    // Calculate swipe distance
    const swipeDistance = touchEndY.current - touchStartY.current;
    
    // Reset menu styles
    if (menuRef.current) {
      menuRef.current.style.transform = '';
      menuRef.current.style.opacity = '';
    }
    
    // If swiped down enough, close menu
    if (swipeDistance > 100) {
      // Try to trigger haptic feedback
      if (window.navigator && 'vibrate' in window.navigator) {
        window.navigator.vibrate(10);
      }
      handleNavLinkClick();
    }
    
    // Reset touch points
    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Track menu scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 10);
  };

  // Handle link click with haptic feedback
  const handleLinkClickWithFeedback = () => {
    if (window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(5);
    }
    handleNavLinkClick();
  };
  
  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Focus management - trap focus within mobile menu when open
    if (menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
    
    // Handle escape key to close menu
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleNavLinkClick();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleNavLinkClick]);

  if (!mounted) {
    return null;
  }
  
  return (
    <div 
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      className="pt-2 pb-safe max-h-[85vh] overflow-y-auto overscroll-contain relative"
      style={{
        background: "rgba(15, 17, 26, 0.85)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "1.5rem 1.5rem 0 0",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))"
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onScroll={handleScroll}
    >
      {/* Pull indicator for better UX - shows users they can pull down to dismiss */}
      <div className="w-12 h-1 bg-white/25 rounded-full mx-auto mb-4 mt-1" aria-hidden="true"></div>
      
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-pink-500/10 pointer-events-none"
        style={{
          animation: "pulse 8s ease-in-out infinite alternate"
        }}
        aria-hidden="true"
      ></div>
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
        aria-hidden="true"
      ></div>
      
      {/* Header shadow shows when scrolled */}
      <div 
        className={`sticky top-0 left-0 right-0 h-2 z-20 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: "linear-gradient(to bottom, rgba(15, 17, 26, 0.8) 0%, transparent 100%)",
          backdropFilter: "blur(8px)"
        }}
        aria-hidden="true"
      ></div>
      
      <div className="px-4 py-2 relative z-10">
        <nav aria-label="Mobile navigation">
        image.png          {/* Common links for all users */}
          <div className="py-1">
            <Link 
              href="/blog"
              onClick={handleLinkClickWithFeedback}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300 ${
                isBlogPage ? 'bg-white/10' : ''
              }`}
              aria-current={isBlogPage ? 'page' : undefined}
            >
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-lg shadow-blue-500/10">
                <i className="fas fa-book-open text-blue-400" aria-hidden="true"></i>
              </span>
              <span>Blog</span>
            </Link>
            
            {/* CheapCC Brand Pages Section */}
            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="px-4 py-2 text-sm font-semibold text-white/60 uppercase tracking-wider">
                CheapCC Pages
              </div>
              
              <Link 
                href="/adobe-pricing-calculator"
                onClick={handleLinkClickWithFeedback}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 shadow-lg shadow-indigo-500/10">
                  <i className="fas fa-calculator text-indigo-400" aria-hidden="true"></i>
                </span>
                <div>
                  <div className="font-medium">Pricing Calculator</div>
                  <div className="text-xs text-white/60">Calculate your savings</div>
                </div>
              </Link>
              
              <Link 
                href="/adobe-alternatives"
                onClick={handleLinkClickWithFeedback}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/20 shadow-lg shadow-orange-500/10">
                  <i className="fas fa-th-large text-orange-400" aria-hidden="true"></i>
                </span>
                <div>
                  <div className="font-medium">Adobe Alternatives</div>
                  <div className="text-xs text-white/60">Compare options</div>
                </div>
              </Link>
              
              <div className="border-t border-white/10 my-2 mx-4"></div>
              
              <Link 
                href="/cheapcc-review"
                onClick={handleLinkClickWithFeedback}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 shadow-lg shadow-yellow-500/10">
                  <i className="fas fa-star text-yellow-400" aria-hidden="true"></i>
                </span>
                <div>
                  <div className="font-medium">Reviews</div>
                  <div className="text-xs text-white/60">Customer testimonials</div>
                </div>
              </Link>
              
              <Link 
                href="/what-is-cheapcc"
                onClick={handleLinkClickWithFeedback}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-lg shadow-blue-500/10">
                  <i className="fas fa-question-circle text-blue-400" aria-hidden="true"></i>
                </span>
                <div>
                  <div className="font-medium">What is CheapCC?</div>
                  <div className="text-xs text-white/60">Service explained</div>
                </div>
              </Link>
              
              <Link 
                href="/cheapcc-vs-adobe-official"
                onClick={handleLinkClickWithFeedback}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500/20 to-green-600/20 shadow-lg shadow-green-500/10">
                  <i className="fas fa-balance-scale text-green-400" aria-hidden="true"></i>
                </span>
                <div>
                  <div className="font-medium">vs Adobe Official</div>
                  <div className="text-xs text-white/60">Price comparison</div>
                </div>
              </Link>
              
              <Link 
                href="/cheapcc-testimonials"
                onClick={handleLinkClickWithFeedback}
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 shadow-lg shadow-purple-500/10">
                  <i className="fas fa-users text-purple-400" aria-hidden="true"></i>
                </span>
                <div>
                  <div className="font-medium">Customer Stories</div>
                  <div className="text-xs text-white/60">500+ testimonials</div>
                </div>
              </Link>
            </div>

            <Link 
              href="/swipeable-cards-demo"
              onClick={handleLinkClickWithFeedback}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
            >
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-600/20 shadow-lg shadow-pink-500/10">
                <i className="fas fa-mobile-alt text-pink-400" aria-hidden="true"></i>
              </span>
              <span>Swipeable Cards</span>
              <span className="ml-auto px-2 py-1 text-xs font-semibold rounded-full bg-pink-500/20 text-pink-300">New</span>
            </Link>

            <Link 
              href="/#pricing"
              onClick={handleLinkClickWithFeedback}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
            >
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 shadow-lg shadow-emerald-500/10">
                <i className="fas fa-tag text-emerald-400" aria-hidden="true"></i>
              </span>
              <span>Pricing</span>
            </Link>
          </div>
          
          {/* Divider with glow */}
          <div className="relative my-3" role="separator" aria-orientation="horizontal">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent opacity-50"></div>
            <div className="border-t border-white/10"></div>
          </div>
          
          {user ? (
            <>
              {/* User profile card with improved styling */}
              <div className="py-3 border-b border-white/10 mb-3">
                <div
                  className="block text-sm font-medium truncate py-3 px-4 rounded-xl relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(192, 38, 211, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)",
                    boxShadow: "0 8px 16px rgba(192, 38, 211, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
                  }}
                >
                  {/* Background glow effect */}
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full bg-fuchsia-500/20 blur-2xl opacity-30 transform -translate-y-1/2 translate-x-1/3"
                    style={{
                      animation: "pulse 4s ease-in-out infinite alternate"
                    }}
                    aria-hidden="true"
                  ></div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mr-3" aria-hidden="true">
                      <i className="fas fa-user-circle"></i>
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {userName || (user?.email ? user.email.split('@')[0] : 'User')}
                      </div>
                      <div className="text-white/60 text-xs truncate mt-0.5">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link
                href="/dashboard"
                onClick={handleLinkClickWithFeedback}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300 ${
                  pathname?.startsWith('/dashboard') ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-700/10 border border-indigo-500/20' : ''
                }`}
                aria-current={pathname?.startsWith('/dashboard') ? 'page' : undefined}
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 shadow-lg shadow-indigo-500/10">
                  <i className="fas fa-chart-line text-indigo-400" aria-hidden="true"></i>
                </span>
                <span>Dashboard</span>
              </Link>
              
              <Link
                href="/profile"
                onClick={handleLinkClickWithFeedback}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300 ${
                  pathname?.startsWith('/profile') ? 'bg-gradient-to-r from-purple-500/20 to-purple-700/10 border border-purple-500/20' : ''
                }`}
                aria-current={pathname?.startsWith('/profile') ? 'page' : undefined}
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 shadow-lg shadow-purple-500/10">
                  <i className="fas fa-user text-purple-400" aria-hidden="true"></i>
                </span>
                <span>Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  if (window.navigator && 'vibrate' in window.navigator) {
                    window.navigator.vibrate(10);
                  }
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
                aria-label="Sign out"
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-pink-600/20 shadow-lg shadow-pink-500/10">
                  <i className="fas fa-sign-out-alt text-pink-400" aria-hidden="true"></i>
                </span>
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <div className="py-3 mb-2">
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href="/login"
                    onClick={handleLinkClickWithFeedback}
                    className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-base font-medium text-white/90 border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300 backdrop-blur-sm shadow-lg shadow-fuchsia-500/5"
                  >
                    <i className="fas fa-sign-in-alt text-fuchsia-400" aria-hidden="true"></i>
                    <span>Sign in</span>
                  </Link>
                  
                  <Link
                    href="/register"
                    onClick={handleLinkClickWithFeedback}
                    className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-base font-medium text-white relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, rgba(192, 38, 211, 0.9), rgba(219, 39, 119, 0.9), rgba(239, 68, 68, 0.9))",
                      boxShadow: "0 8px 20px rgba(219, 39, 119, 0.3)"
                    }}
                  >
                    {/* Animated shine effect */}
                    <span 
                      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-30 group-active:opacity-50"
                      style={{
                        background: "linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.4) 50%, transparent 75%)",
                        backgroundSize: "250% 250%",
                        animation: "shine 3s ease-in-out infinite",
                        transform: "translateX(-100%)",
                        transition: "opacity 0.3s ease"
                      }}
                      aria-hidden="true"
                    ></span>
                    <i className="fas fa-user-plus text-white" aria-hidden="true"></i>
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            </>
          )}
          
          {/* Support link with improved styling */}
          <div className="relative my-3" role="separator" aria-orientation="horizontal">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent opacity-50"></div>
            <div className="border-t border-white/10"></div>
          </div>
          
          <div>
            <Link 
              href="mailto:support@cheapcc.online"
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
              onClick={() => {
                if (window.navigator && 'vibrate' in window.navigator) {
                  window.navigator.vibrate(5);
                }
              }}
            >
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-500/20 to-gray-600/20 shadow-lg shadow-gray-500/10">
                <i className="fas fa-envelope text-gray-400" aria-hidden="true"></i>
              </span>
              <span>Support</span>
            </Link>
            
            <Link 
              href="/faq"
              onClick={handleLinkClickWithFeedback}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-white/90 hover:bg-white/10 active:bg-white/15 active:scale-[0.98] transition-all duration-300"
            >
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-600/20 shadow-lg shadow-amber-500/10">
                <i className="fas fa-question-circle text-amber-400" aria-hidden="true"></i>
              </span>
              <span>FAQ</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
});

// Add display name for React DevTools
MobileMenu.displayName = 'MobileMenu';

export default MobileMenu; 