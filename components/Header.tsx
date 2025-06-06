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
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check if current path is dashboard or profile
  const isDashboardOrProfile = pathname?.includes('/dashboard') || pathname?.includes('/profile');

  // Effect to mark component as mounted and then make it visible
  useEffect(() => {
    setIsMounted(true);
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position to change mobile menu icon color
  useEffect(() => {
    const handleScroll = () => {
      // Estimate hero section height - adjust this value based on your hero section
      const heroHeight = window.innerHeight * 0.8; 
      
      if (window.scrollY > heroHeight) {
        setScrolledPastHero(true);
      } else {
        setScrolledPastHero(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect for auth state: Add pathname as a dependency to re-run when redirected to dashboard
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
      console.log('Auth state change event:', event);
      setUser(session?.user ?? null);
      if (!authChecked && isMounted) {
        setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [pathname]); // Add pathname as dependency to re-run when route changes

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

  // Button classes based on client/server rendering, scroll position, and current path
  // For dashboard/profile pages, always use dark colors regardless of scroll position
  const toggleButtonClasses = isMounted 
    ? `p-2 rounded-md ${isDashboardOrProfile || scrolledPastHero ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white'} transition-colors`
    : "p-2 rounded-md text-gray-500 hover:text-gray-900 transition-colors";

  // Determine if dropdown menu should use light or dark theme
  // For dashboard/profile pages, always use dark theme regardless of scroll position
  const usesDarkTheme = isDashboardOrProfile || scrolledPastHero;

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
              <span className="hidden lg:flex items-center text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">
                <i className="fas fa-user-circle mr-2 text-[#ff3366]"></i>
                {user.email}
              </span>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 py-1.5 px-4 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-[#ff3366] bg-clip-text text-transparent transition-all duration-200 transform hover:-translate-y-0.5"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="md:hidden lg:hidden">
                    <i className="fas fa-user-circle text-[#ff3366]"></i>
                  </span>
                  <span className="hidden md:inline">My Account</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} text-[#ff3366]`}></i>
                </button>

                <div 
                  className={`absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 z-50 transform transition-all duration-300 ${
                    isDropdownOpen 
                      ? 'opacity-100 translate-y-0 visible' 
                      : 'opacity-0 -translate-y-4 invisible'
                  }`}
                >
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                  <div className="pt-2 pb-3 px-4 mb-1 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Menu</p>
                  </div>
                  <Link 
                    href="/dashboard" 
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-pink-50 hover:text-[#ff3366] transition-colors group"
                  >
                    <i className="fas fa-tachometer-alt w-5 h-5 flex items-center justify-center text-indigo-400 group-hover:text-[#ff3366] bg-indigo-50 group-hover:bg-pink-50 p-1 rounded-md transition-colors"></i> 
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-pink-50 hover:text-[#ff3366] transition-colors group"
                  >
                    <i className="fas fa-user-edit w-5 h-5 flex items-center justify-center text-purple-400 group-hover:text-[#ff3366] bg-purple-50 group-hover:bg-pink-50 p-1 rounded-md transition-colors"></i> 
                    <span>Profile</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-500 transition-colors group text-left"
                  >
                    <i className="fas fa-sign-out-alt w-5 h-5 flex items-center justify-center text-pink-400 group-hover:text-red-500 bg-pink-50 group-hover:bg-red-50 p-1 rounded-md transition-colors"></i> 
                    <span>Log Out</span>
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
          <div className={`px-4 pt-2 pb-3 space-y-1 backdrop-blur-[5px] ${usesDarkTheme ? 'bg-white shadow-lg border border-gray-100' : 'bg-white/10 shadow-lg border border-white/10'} rounded-lg`}>
            {!authChecked ? (
              <div className="py-2">
                <div className="animate-pulse bg-white/20 h-8 w-full rounded-md mb-2"></div>
                <div className="animate-pulse bg-white/20 h-8 w-full rounded-md"></div>
              </div>
            ) : user ? (
              <>
                <div className={`py-3 ${usesDarkTheme ? 'border-b border-gray-200 mb-2' : 'border-b border-white/10 mb-2'}`}>
                  <span className={`block text-sm font-medium ${usesDarkTheme ? 'text-gray-700' : 'text-white'} truncate bg-gradient-to-r from-indigo-400 to-pink-400 py-2 px-3 rounded-md`}>
                    <i className="fas fa-user-circle mr-2"></i>
                    {user.email}
                  </span>
                </div>
                <Link 
                  href="/dashboard" 
                  onClick={handleNavLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-700 hover:bg-gray-50' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-indigo-100' : 'bg-indigo-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-tachometer-alt ${usesDarkTheme ? 'text-indigo-600' : 'text-indigo-300'}`}></i>
                  </span>
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  onClick={handleNavLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-700 hover:bg-gray-50' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-purple-100' : 'bg-purple-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-user-edit ${usesDarkTheme ? 'text-purple-600' : 'text-purple-300'}`}></i>
                  </span>
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-700 hover:bg-gray-50' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-pink-100' : 'bg-pink-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-sign-out-alt ${usesDarkTheme ? 'text-pink-600' : 'text-pink-300'}`}></i>
                  </span>
                  Log Out
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
            <div className={`border-t ${usesDarkTheme ? 'border-gray-200' : 'border-white/10'} my-2`}></div>
            <Link 
              href="mailto:support@cheapcc.online" 
              onClick={handleNavLinkClick}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-700 hover:bg-gray-50' : 'text-white/80 hover:bg-white/10'} transition-colors`}
            >
              <i className={`fas fa-envelope mr-2 ${usesDarkTheme ? 'text-gray-500' : 'text-white/60'}`}></i> Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}