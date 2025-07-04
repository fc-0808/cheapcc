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
      className="pt-2 pb-3 space-y-1 backdrop-blur-xl rounded-xl overflow-hidden relative"
      style={{
        background: "rgba(15, 17, 26, 0.85)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
        border: "1px solid rgba(255, 255, 255, 0.08)"
      }}
    >
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
      
      <div className="px-4 py-2 relative z-10">
        <nav aria-label="Mobile navigation">
          {/* Common links for all users */}
          <div className="py-1">
            <Link 
              href="/blog"
              onClick={handleNavLinkClick}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 transition-all duration-300 ${
                isBlogPage ? 'bg-white/10' : ''
              }`}
              aria-current={isBlogPage ? 'page' : undefined}
            >
              <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-lg shadow-blue-500/10">
                <i className="fas fa-book-open text-blue-400" aria-hidden="true"></i>
              </span>
              <span>Blog</span>
            </Link>

            <Link 
              href="/#pricing"
              onClick={handleNavLinkClick}
              className="flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 transition-all duration-300"
            >
              <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 shadow-lg shadow-emerald-500/10">
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
                  className="block text-sm font-medium truncate py-3 px-4 rounded-lg relative overflow-hidden"
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mr-3" aria-hidden="true">
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
                onClick={handleNavLinkClick}
                className={`flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 transition-all duration-300 ${
                  pathname?.startsWith('/dashboard') ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-700/10 border border-indigo-500/20' : ''
                }`}
                aria-current={pathname?.startsWith('/dashboard') ? 'page' : undefined}
              >
                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 shadow-lg shadow-indigo-500/10">
                  <i className="fas fa-chart-line text-indigo-400" aria-hidden="true"></i>
                </span>
                <span>Dashboard</span>
              </Link>
              
              <Link
                href="/profile"
                onClick={handleNavLinkClick}
                className={`flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 transition-all duration-300 ${
                  pathname?.startsWith('/profile') ? 'bg-gradient-to-r from-purple-500/20 to-purple-700/10 border border-purple-500/20' : ''
                }`}
                aria-current={pathname?.startsWith('/profile') ? 'page' : undefined}
              >
                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 shadow-lg shadow-purple-500/10">
                  <i className="fas fa-user text-purple-400" aria-hidden="true"></i>
                </span>
                <span>Profile</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 transition-all duration-300"
                aria-label="Sign out"
              >
                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-pink-600/20 shadow-lg shadow-pink-500/10">
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
                    onClick={handleNavLinkClick}
                    className="flex items-center justify-center gap-2 px-4 py-4 rounded-lg text-base font-medium text-white/90 border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-fuchsia-500/5"
                  >
                    <i className="fas fa-sign-in-alt text-fuchsia-400" aria-hidden="true"></i>
                    <span>Sign in</span>
                  </Link>
                  
                  <Link
                    href="/register"
                    onClick={handleNavLinkClick}
                    className="flex items-center justify-center gap-2 px-4 py-4 rounded-lg text-base font-medium text-white relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, rgba(192, 38, 211, 0.9), rgba(219, 39, 119, 0.9), rgba(239, 68, 68, 0.9))",
                      boxShadow: "0 8px 20px rgba(219, 39, 119, 0.3)"
                    }}
                  >
                    {/* Animated shine effect */}
                    <span 
                      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-30"
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
              className="flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 transition-all duration-300"
            >
              <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-500/20 to-gray-600/20 shadow-lg shadow-gray-500/10">
                <i className="fas fa-envelope text-gray-400" aria-hidden="true"></i>
              </span>
              <span>Support</span>
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