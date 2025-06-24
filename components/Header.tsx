"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/supabase-client";
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
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
          setUserName('');
        } else {
          setUser(session?.user ?? null);
          
          // Always get user name from profile table
          if (session?.user) {
            // Get name from the profile table
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', session.user.id)
              .maybeSingle();
              
            let name = profileData?.name || '';
            
            // If no name in profile, use the first part of the email as fallback
            if (!name && session.user.email) {
              name = session.user.email.split('@')[0];
            }
            
            setUserName(name);
          }
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('Exception in getInitialSession:', e);
        setUser(null);
        setUserName('');
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
      
      // Update user name when auth state changes
      if (session?.user) {
        const updateUserName = async () => {
            // Always get name from the profile table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .maybeSingle();
            
          let name = profileData?.name || '';
          
          // If no name in profile, use the first part of the email as fallback
          if (!name && session.user.email) {
            name = session.user.email.split('@')[0];
          }
          
          setUserName(name);
        };
        
        updateUserName();
      } else {
        setUserName('');
      }
      
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
  
  // Check if current path is login or register
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Button classes based on client/server rendering, scroll position, and current path
  // For dashboard/profile pages, always use dark colors regardless of scroll position
  // For login/register pages, always use dark color for better visibility on white background
  const toggleButtonClasses = isMounted 
    ? `p-2 rounded-md ${isDashboardOrProfile || isAuthPage || scrolledPastHero ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white'} transition-colors`
    : "p-2 rounded-md text-gray-500 hover:text-gray-900 transition-colors";

  // Determine if dropdown menu should use light or dark theme
  // For dashboard/profile/auth pages, always use dark theme
  // For ANY page that's not the homepage, always use dark theme
  // For homepage, use dark theme only when scrolled past hero
  const usesDarkTheme = isDashboardOrProfile || isAuthPage || pathname !== '/' || (pathname === '/' && scrolledPastHero);

  // Check if current path is blog
  const isBlogPage = pathname?.includes('/blog');
  const navLinkClasses = `text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:text-[#ff3366]' : 'text-white/80 hover:text-white'} transition-colors`;

  return (
    <header className={`${headerClasses} ${visibilityClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" prefetch={false} onClick={handleLogoClick} className="flex items-center">
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
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg ${usesDarkTheme ? 'text-gray-800' : ''}`}></i>
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {/* Blog link for desktop */}
          <Link 
            href="/blog" 
            prefetch={false}
            className={`${navLinkClasses} ${isBlogPage ? 'font-bold' : ''}`}
            onClick={handleNavLinkClick}
          >
            Blog
          </Link>

          {!authChecked ? (
            <div className="bg-gray-100 h-9 w-32 animate-pulse rounded-md"></div>
          ) : user ? (
            <div className="flex items-center space-x-5">
              <span className="hidden lg:flex items-center text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">
                <i className="fas fa-user-circle mr-2 text-[#ff3366]"></i>
                {userName || (user?.email ? user.email.split('@')[0] : 'User')}
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
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Menu</p>
                  </div>
                  <Link 
                    href="/dashboard" 
                    prefetch={false}
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <i className="fas fa-tachometer-alt text-indigo-700"></i>
                    </span>
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    prefetch={false}
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <i className="fas fa-user-circle text-purple-700"></i>
                    </span>
                    Profile
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                      <i className="fas fa-sign-out-alt text-pink-700"></i>
                    </span>
                    Log Out
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
                  <span className={`block text-sm font-medium ${usesDarkTheme ? 'text-gray-800' : 'text-white'} truncate bg-gradient-to-r from-indigo-400 to-pink-400 py-2 px-3 rounded-md`}>
                    <i className="fas fa-user-circle mr-2"></i>
                    {userName || (user?.email ? user.email.split('@')[0] : 'User')}
                  </span>
                </div>
                <Link 
                  href="/dashboard" 
                  onClick={handleNavLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-indigo-100' : 'bg-indigo-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-tachometer-alt ${usesDarkTheme ? 'text-indigo-700' : 'text-indigo-300'}`}></i>
                  </span>
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  prefetch={false}
                  onClick={handleNavLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-purple-100' : 'bg-purple-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-user-circle ${usesDarkTheme ? 'text-purple-700' : 'text-purple-300'}`}></i>
                  </span>
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-pink-100' : 'bg-pink-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-sign-out-alt ${usesDarkTheme ? 'text-pink-700' : 'text-pink-300'}`}></i>
                  </span>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  prefetch={false}
                  onClick={handleNavLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-indigo-100' : 'bg-indigo-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-sign-in-alt ${usesDarkTheme ? 'text-indigo-700' : 'text-indigo-300'}`}></i>
                  </span>
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  prefetch={false}
                  onClick={handleNavLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'} transition-colors`}
                >
                  <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-pink-100' : 'bg-pink-500/20'} flex items-center justify-center`}>
                    <i className={`fas fa-user-plus ${usesDarkTheme ? 'text-pink-700' : 'text-pink-300'}`}></i>
                  </span>
                  Register
                </Link>
              </>
            )}
            {/* Blog link for mobile */}
            <Link 
              href="/blog" 
              prefetch={false}
              onClick={handleNavLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'} transition-colors ${isBlogPage ? 'font-bold' : ''}`}
            >
              <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-blue-100' : 'bg-blue-500/20'} flex items-center justify-center`}>
                <i className={`fas fa-book-open ${usesDarkTheme ? 'text-blue-700' : 'text-blue-300'}`}></i>
              </span>
              Blog
            </Link>
            <div className={`border-t ${usesDarkTheme ? 'border-gray-200' : 'border-white/10'} my-1`}></div>
            {/* Support link for mobile */}
            <Link 
              href="mailto:support@cheapcc.online" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${usesDarkTheme ? 'text-gray-800 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'} transition-colors`}
            >
              <span className={`w-8 h-8 rounded-full ${usesDarkTheme ? 'bg-gray-100' : 'bg-gray-500/20'} flex items-center justify-center`}>
                <i className={`fas fa-envelope ${usesDarkTheme ? 'text-gray-700' : 'text-white/60'}`}></i>
              </span>
              Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}