"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/supabase-client";
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  // Effect to mark component as mounted and then make it visible
  useEffect(() => {
    setIsMounted(true);
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // Effect for auth state: runs once on mount
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('Exception in getInitialSession:', e);
        setUser(null);
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (!authChecked && isMounted) {
        setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Handle clicks outside dropdown/mobile menu
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle && !mobileToggle.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Effect to close menus on pathname change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/dashboard' || pathname === '/profile' || pathname === '/login' || pathname === '/register') {
      e.preventDefault();
      window.location.href = '/';
    }
    setIsMobileMenuOpen(false);
  };
  
  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Basic header styling for both server and client rendering
  const headerClasses = "fixed top-0 z-50 py-3 mx-3 my-4 backdrop-blur-[2px] shadow-[0_4px_32px_0_rgba(31,38,135,0.37)] rounded-[20px] border-b-pink/50 border-t-transparent border-l-transparent border-r-transparent transition-all duration-300 ease-in-out left-0 right-0 md:left-20 md:right-20 lg:left-80 lg:right-80";
  
  // Add opacity transition for smooth appearance
  const visibilityClasses = isVisible ? "opacity-100" : "opacity-0";

  // Button classes based on client/server rendering
  const toggleButtonClasses = isMounted 
    ? "p-2 rounded-md text-white/70 hover:text-white transition-colors"
    : "p-2 rounded-md text-gray-500 hover:text-gray-900 transition-colors";

  return (
    <header className={`${headerClasses} ${visibilityClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" onClick={handleLogoClick} className="flex items-center">
          <span className="font-extrabold text-xl tracking-tight text-gradient bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Cheap <span className="text-[#ff3366] font-bold">CC</span>
          </span>
        </Link>

        {/* Mobile menu toggle button */}
        <div className="md:hidden">
          <button
            id="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            className={toggleButtonClasses}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex md:items-center space-x-8">
          {!authChecked ? (
            <div className="bg-gray-100 h-9 w-32 animate-pulse rounded-md"></div>
          ) : user ? (
            <div className="flex items-center space-x-5">
              <span className="hidden lg:flex items-center text-sm text-gray-600">
                <i className="fas fa-user-circle mr-2 text-gray-400"></i>
                {user.email}
              </span>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100/70 transition-colors"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="md:hidden lg:hidden">
                    <i className="fas fa-user-circle text-gray-600"></i>
                  </span>
                  <span className="hidden md:inline">My Account</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} text-gray-400`}></i>
                </button>

                <div 
                  className={`absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50 transform transition-all duration-150 ${
                    isDropdownOpen 
                      ? 'opacity-100 translate-y-0 visible' 
                      : 'opacity-0 -translate-y-2 invisible'
                  }`}
                >
                  <Link 
                    href="/dashboard" 
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition-colors"
                  >
                    <i className="fas fa-tachometer-alt w-5 text-center text-gray-400"></i> Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition-colors"
                  >
                    <i className="fas fa-user-edit w-5 text-center text-gray-400"></i> Profile
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition-colors text-left"
                  >
                    <i className="fas fa-sign-out-alt w-5 text-center text-gray-400"></i> Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 py-1.5 px-4 rounded-md transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/register"
                className="text-sm font-medium bg-gradient-to-r from-pink-500 to-[#ff3366] text-white hover:opacity-90 py-1.5 px-4 rounded-md transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && isMounted && (
        <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden mt-2">
          <div className="px-4 pt-2 pb-3 space-y-1 backdrop-blur-[5px] bg-white/10 shadow-lg border border-white/10 rounded-lg">
            {!authChecked ? (
              <div className="py-2">
                <div className="animate-pulse bg-white/20 h-8 w-full rounded-md mb-2"></div>
                <div className="animate-pulse bg-white/20 h-8 w-full rounded-md"></div>
              </div>
            ) : user ? (
              <>
                <div className="py-2 border-b border-white/10">
                  <span className="block text-sm font-medium text-white/90 truncate">{user.email}</span>
                </div>
                <Link 
                  href="/dashboard" 
                  onClick={handleNavLinkClick}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                >
                  <i className="fas fa-tachometer-alt mr-2 text-white/60"></i> Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  onClick={handleNavLinkClick}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                >
                  <i className="fas fa-user-edit mr-2 text-white/60"></i> Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-2 text-white/60"></i> Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={handleNavLinkClick}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  onClick={handleNavLinkClick}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-[#ff3366] hover:opacity-90 transition-colors mt-2"
                >
                  Register
                </Link>
              </>
            )}
            <div className="border-t border-white/10 my-2"></div>
            <Link 
              href="mailto:support@cheapcc.online" 
              onClick={handleNavLinkClick}
              className="block px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
            >
              <i className="fas fa-envelope mr-2 text-white/60"></i> Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}