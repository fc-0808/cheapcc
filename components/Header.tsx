"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient, clearClientCache } from "@/utils/supabase/supabase-client";
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import CountrySelector from './CountrySelector';
// import { logout as serverLogout } from '@/app/(auth)/logout/actions';

// Dynamically import MobileMenu to reduce initial load size
const MobileMenu = dynamic(() => import('./MobileMenu'), {
  ssr: false,
  loading: () => (
    <div className="p-6 backdrop-blur-lg rounded-t-2xl animate-pulse">
      <div className="h-1 w-12 bg-white/25 rounded-full mx-auto mb-8"></div>
      <div className="space-y-4">
        <div className="h-12 bg-white/10 rounded-xl"></div>
        <div className="h-12 bg-white/10 rounded-xl"></div>
        <div className="h-12 bg-white/10 rounded-xl"></div>
      </div>
    </div>
  )
});

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const prevScrollPosRef = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchThreshold = 50;
  
  // Check if current path is dashboard or profile
  const isDashboardOrProfile = pathname?.includes('/dashboard') || pathname?.includes('/profile');
  
  // Check if current path is login or register
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  // Determine if dropdown menu should use light or dark theme
  const usesDarkTheme = isDashboardOrProfile || isAuthPage || pathname !== '/' || (pathname === '/' && scrolledPastHero);
  
  // Button classes based on client/server rendering, scroll position, and current path
  const toggleButtonClasses = isMounted 
    ? `p-2 rounded-md ${usesDarkTheme ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white'} transition-colors`
    : "p-2 rounded-md text-gray-500 hover:text-gray-900 transition-colors";

  // Check if current path is blog
  const isBlogPage = pathname?.includes('/blog');
  const navLinkClasses = `text-sm font-medium text-white hover:text-white transition-colors`;
  
  // Effect to mark component as mounted and then make it visible
  useEffect(() => {
    setIsMounted(true);
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  // Memoized scroll handler to prevent infinite re-renders
  const handleScroll = useCallback(() => {
    // For mobile menu icon color
    const heroHeight = window.innerHeight * 0.8; 
    setScrolledPastHero(window.scrollY > heroHeight);
    
    // For hiding/showing header on scroll
    const currentScrollPos = window.scrollY;
    const scrollingDown = currentScrollPos > prevScrollPosRef.current;
    const scrollDelta = Math.abs(currentScrollPos - prevScrollPosRef.current);
    
    // Only apply header hiding effect on mobile screens
    if (window.innerWidth < 768) {
      if (scrollingDown && currentScrollPos > 60 && scrollDelta > 5) {
        setHeaderVisible(false);
      } else if (!scrollingDown && scrollDelta > 5) {
        setHeaderVisible(true);
      }
    } else {
      // Always show header on desktop
      setHeaderVisible(true);
    }
    
    prevScrollPosRef.current = currentScrollPos;
  }, []);

  // Track scroll position to change mobile menu icon color and hide/show header
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

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
          
          // Check if user is admin
          const ADMIN_EMAIL = 'w088studio@gmail.com';
          setIsAdmin(session?.user?.email === ADMIN_EMAIL);
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
      // Close dropdowns when clicking outside
      setIsBrandDropdownOpen(false);
      setIsProductsDropdownOpen(false);
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
    setIsBrandDropdownOpen(false);
    setIsProductsDropdownOpen(false);
  }, [pathname]);
  
  // Add touch event handlers for the mobile menu
  useEffect(() => {
    // Add body class when mobile menu is open to prevent scrolling
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);
  
  // Handle touch events for gesture navigation on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Calculate horizontal swipe distance
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Only detect horizontal swipes (not vertical)
    if (Math.abs(deltaX) > touchThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      // Right to left swipe - open menu if not already open
      if (deltaX < 0 && !isMobileMenuOpen) {
        toggleMobileMenu();
      }
      // Left to right swipe - close menu if open
      else if (deltaX > 0 && isMobileMenuOpen) {
        toggleMobileMenu();
      }
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        // If client-side logout fails, try server-side logout via API
        try {
          const response = await fetch('/logout', { method: 'POST' });
          if (!response.ok) {
            throw new Error('API logout failed');
          }
        } catch (apiError) {
          console.error('API logout failed:', apiError);
          // Last resort: just redirect
          window.location.href = '/';
        }
        return;
      }
      
      // Update local state immediately
      setUser(null);
      setUserName('');
      setAuthChecked(true);
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      
      // Clear any local storage items that might contain auth data
      if (typeof window !== 'undefined') {
        // Clear all Supabase-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage as well
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // Clear the Supabase client cache to ensure fresh state
      clearClientCache();
      
      // Force a hard navigation to refresh the auth state completely
      // This ensures the server-side middleware picks up the cleared session
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // If all else fails, just redirect
      window.location.href = '/';
    }
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

  // Add opacity transition for smooth appearance
  const visibilityClasses = isVisible ? "opacity-100" : "opacity-0";

  return (
    <header 
      ref={headerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed top-0 z-50 py-3 mx-3 my-4 rounded-[20px] transition-all duration-300 ease-in-out left-0 right-0 md:left-20 md:right-20 lg:left-80 lg:right-80 ${visibilityClasses}`}
      style={{
        background: 'transparent',
        backdropFilter: "blur(3px)",
        boxShadow: "none",
        borderBottom: "none",
        transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between relative z-10">
        <div>
          <Link href="/" prefetch={false} onClick={handleLogoClick} className="flex items-center group">
            <div className="flex items-center">
              <span className="font-medium text-lg tracking-tight relative">
                <span className="relative z-10 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block">
                  Cheap
                </span>
                <span className="text-white font-medium relative ml-1">
                  CC
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile menu toggle button - enhanced for mobile touch experience */}
        <div className="md:hidden">
          <button
            id="mobile-menu-toggle"
            onClick={() => {
              // Add haptic feedback for better mobile UX
              if (window.navigator && 'vibrate' in window.navigator) {
                window.navigator.vibrate(5);
              }
              toggleMobileMenu();
            }}
            className="p-3 rounded-xl bg-white/5 text-white/90 border border-white/10 backdrop-blur-sm shadow-lg hover:bg-white/10 active:bg-white/15 active:scale-95 transition-all duration-200"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
              WebkitTapHighlightColor: "transparent" // Remove tap highlight on mobile
            }}
          >
            <div className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-base`}></i>
            </div>
          </button>
        </div>
        
        {/* Desktop navigation - more subtle */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/blog" 
              prefetch={false}
              className={`${navLinkClasses} ${isBlogPage ? 'font-medium' : 'font-light'} relative group text-white/90 hover:text-white`}
              onClick={handleNavLinkClick}
            >
              <span className="relative z-10">Blog</span>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-fuchsia-500/70 to-[#ff3366]/70 group-hover:w-full transition-all duration-300" />
              {isBlogPage && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-fuchsia-500/70 to-[#ff3366]/70" />
              )}
            </Link>
            
            {/* Products Dropdown - Hidden for now */}
            {/* <div className="relative group">
              <button 
                className={`${navLinkClasses} relative group text-white/90 hover:text-white flex items-center gap-1`}
                onMouseEnter={() => setIsProductsDropdownOpen(true)}
                onMouseLeave={() => setIsProductsDropdownOpen(false)}
              >
                <span className="relative z-10">Products</span>
                <i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-fuchsia-500/70 to-[#ff3366]/70 group-hover:w-full transition-all duration-300" />
              </button>
              
              <div 
                className={`absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl transition-all duration-300 z-50 ${
                  isProductsDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}
                onMouseEnter={() => setIsProductsDropdownOpen(true)}
                onMouseLeave={() => setIsProductsDropdownOpen(false)}
              >
                <div className="p-2">
                  <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Adobe Creative Cloud</div>
                    <div className="space-y-1">
                      <Link
                        href="/adobe-creative-cloud"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-palette text-purple-400"></i>
                        <div>
                          <div className="font-medium text-sm">All Creative Cloud Options</div>
                          <div className="text-xs text-white/60">Compare all solutions</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/pre-activated-adobe-creative-cloud"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-bolt text-purple-400"></i>
                        <div>
                          <div className="font-medium text-sm">Pre-activated Accounts</div>
                          <div className="text-xs text-white/60">Instant access</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/self-activated-adobe-creative-cloud"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-user-cog text-blue-400"></i>
                        <div>
                          <div className="font-medium text-sm">Self-activation</div>
                          <div className="text-xs text-white/60">Use your Adobe ID</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/adobe-creative-cloud-redemption-codes"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-gift text-emerald-400"></i>
                        <div>
                          <div className="font-medium text-sm">Redemption Codes</div>
                          <div className="text-xs text-white/60">Official Adobe codes</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 my-2"></div>
                  
                  <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Adobe Acrobat Pro</div>
                    <div className="space-y-1">
                      <Link
                        href="/adobe-acrobat-pro"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-file-pdf text-red-400"></i>
                        <div>
                          <div className="font-medium text-sm">All Acrobat Pro Options</div>
                          <div className="text-xs text-white/60">Professional PDF tools</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/adobe-acrobat-pro-redemption-codes"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-gift text-red-400"></i>
                        <div>
                          <div className="font-medium text-sm">Redemption Codes</div>
                          <div className="text-xs text-white/60">Official Adobe codes</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 my-2"></div>
                  
                  <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tools & Resources</div>
                    <div className="space-y-1">
                      <Link
                        href="/compare"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-balance-scale text-yellow-400"></i>
                        <div>
                          <div className="font-medium text-sm">Compare Options</div>
                          <div className="text-xs text-white/60">Feature comparison</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/adobe-pricing-calculator"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={handleNavLinkClick}
                      >
                        <i className="fas fa-calculator text-indigo-400"></i>
                        <div>
                          <div className="font-medium text-sm">Pricing Calculator</div>
                          <div className="text-xs text-white/60">Calculate your savings</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            
            {/* CheapCC Brand Pages Dropdown */}
            <div className="relative group">
              <button 
                className={`${navLinkClasses} relative group text-white/90 hover:text-white flex items-center gap-1`}
                onMouseEnter={() => setIsBrandDropdownOpen(true)}
                onMouseLeave={() => setIsBrandDropdownOpen(false)}
              >
                <span className="relative z-10">CheapCC</span>
                <i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-fuchsia-500/70 to-[#ff3366]/70 group-hover:w-full transition-all duration-300" />
              </button>
              
              {/* CheapCC Dropdown Menu */}
              <div 
                className={`absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl transition-all duration-300 z-50 ${
                  isBrandDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}
                onMouseEnter={() => setIsBrandDropdownOpen(true)}
                onMouseLeave={() => setIsBrandDropdownOpen(false)}
              >
                <div className="p-2">
                  <Link
                    href="/adobe-pricing-calculator"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={handleNavLinkClick}
                  >
                    <i className="fas fa-calculator text-indigo-400"></i>
                    <div>
                      <div className="font-medium">Pricing Calculator</div>
                      <div className="text-xs text-white/60">Calculate your savings</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/adobe-alternatives"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={handleNavLinkClick}
                  >
                    <i className="fas fa-th-large text-orange-400"></i>
                    <div>
                      <div className="font-medium">Adobe Alternatives</div>
                      <div className="text-xs text-white/60">Compare options</div>
                    </div>
                  </Link>
                  
                  <div className="border-t border-white/10 my-2"></div>
                  
                  <Link
                    href="/cheapcc-review"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={handleNavLinkClick}
                  >
                    <i className="fas fa-star text-yellow-400"></i>
                    <div>
                      <div className="font-medium">Reviews</div>
                      <div className="text-xs text-white/60">Customer testimonials</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/what-is-cheapcc"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={handleNavLinkClick}
                  >
                    <i className="fas fa-question-circle text-blue-400"></i>
                    <div>
                      <div className="font-medium">What is CheapCC?</div>
                      <div className="text-xs text-white/60">Service explained</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/cheapcc-vs-adobe-official"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={handleNavLinkClick}
                  >
                    <i className="fas fa-balance-scale text-green-400"></i>
                    <div>
                      <div className="font-medium">vs Adobe Official</div>
                      <div className="text-xs text-white/60">Price comparison</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/cheapcc-testimonials"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={handleNavLinkClick}
                  >
                    <i className="fas fa-users text-purple-400"></i>
                    <div>
                      <div className="font-medium">Customer Stories</div>
                      <div className="text-xs text-white/60">500+ testimonials</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Admin link for desktop */}
          {isAdmin && (
            <div>
              <Link 
                href="/admin" 
                prefetch={false}
                className={`${navLinkClasses} relative group text-[#ff3366] hover:text-[#ff6b8b]`}
                onClick={handleNavLinkClick}
              >
                <span className="relative z-10">Admin</span>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3366]/70 group-hover:w-full transition-all duration-300" />
              </Link>
            </div>
          )}

          {!authChecked ? (
            <div className="bg-white/5 h-8 w-28 rounded-md backdrop-blur-sm" />
          ) : user ? (
            <div className="flex items-center space-x-5">
              {/* Country Selector */}
              <CountrySelector className="hidden lg:block" showPricing={false} />
              <span className="hidden lg:flex items-center text-sm font-light">
                <div className="flex items-center">
                  <i className="fas fa-user-circle mr-2 text-[#ff3366]/80" />
                  <span className="bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 bg-clip-text text-transparent">
                    {userName || (user?.email ? user.email.split('@')[0] : 'User')}
                  </span>
                </div>
              </span>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 py-1.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 transform"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <span className="md:hidden lg:hidden">
                    <i className="fas fa-user-circle text-[#ff3366] text-lg"></i>
                  </span>
                  <span className="hidden md:inline text-white/90">My Account</span>
                  <i className={`fas fa-chevron-down text-xs text-white/70 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-64 rounded-xl bg-white shadow-2xl py-2 z-50 overflow-hidden"
                    style={{
                      border: "1px solid rgba(229, 231, 235, 0.5)",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2), 0 2px 10px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)"
                    }}
                  >
                    <div 
                      className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-t border-l"
                      style={{ borderColor: "rgba(229, 231, 235, 0.5)" }}
                    />
                    
                    <div className="pt-4 pb-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                          <i className="fas fa-user-circle text-xl"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {userName || (user?.email ? user.email.split('@')[0] : 'User')}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 my-1" />
                    
                    <div>
                      <Link 
                        href="/dashboard" 
                        prefetch={false}
                        onClick={handleNavLinkClick}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors relative group"
                      >
                        <span className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                          <i className="fas fa-tachometer-alt text-indigo-600"></i>
                        </span>
                        <span>Dashboard</span>
                        <span className="absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fas fa-angle-right text-gray-400"></i>
                        </span>
                      </Link>
                    </div>
                    
                    <div>
                      <Link 
                        href="/profile" 
                        prefetch={false}
                        onClick={handleNavLinkClick}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors relative group"
                      >
                        <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shadow-sm">
                          <i className="fas fa-user-edit text-purple-600"></i>
                        </span>
                        <span>Profile Settings</span>
                        <span className="absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fas fa-angle-right text-gray-400"></i>
                        </span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 my-1" />
                    
                    <div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 transition-colors cursor-pointer relative group"
                      >
                        <span className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                          <i className="fas fa-sign-out-alt text-red-600"></i>
                        </span>
                        <span>Log Out</span>
                        <span className="absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fas fa-angle-right text-gray-400"></i>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Country Selector */}
              <CountrySelector className="hidden lg:block" showPricing={false} />
              <div>
                <div>
                  <Link 
                    href="/login"
                    className="relative text-sm font-light py-1.5 px-3 rounded-full flex items-center gap-1 transition-all duration-300 text-white/90 hover:text-white bg-white/5 border border-white/10"
                    style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.1)" }}
                  >
                    <span className="relative z-10">Log In</span>
                    <i className="fas fa-arrow-right text-white/70 text-xs ml-1 relative z-10" />
                  </Link>
                </div>
              </div>
              
              <div>
                <div>
                  <Link 
                    href="/register"
                    className="relative overflow-hidden text-sm font-medium py-1.5 px-5 rounded-full flex items-center gap-1.5 transition-all duration-300 text-white"
                    style={{
                      background: "linear-gradient(135deg, rgba(192, 38, 211, 0.9), rgba(219, 39, 119, 0.9), rgba(239, 68, 68, 0.9))",
                      boxShadow: "0 4px 10px rgba(219, 39, 119, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
                      border: "none",
                    }}
                  >
                    <span className="relative z-10 tracking-wide">Register</span>
                    <i className="fas fa-user-plus text-white text-xs ml-1 relative z-10" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile dropdown menu - enhanced for mobile UX */}
      {isMobileMenuOpen && isMounted && (
        <div 
          id="mobile-menu" 
          ref={mobileMenuRef} 
          className="md:hidden fixed inset-x-0 top-20 z-50 px-4 transition-all duration-300 animate-fadeInDropdown"
          style={{
            marginTop: 0,
            maxHeight: 'calc(100vh - 5rem)',
            height: 'auto',
            overflowY: 'auto',
          }}
        >
          <div 
            className="pt-2 pb-3 space-y-1 backdrop-blur-md rounded-xl overflow-hidden relative"
            style={{
              background: "rgba(17, 17, 40, 0.9)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15) inset",
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>
            
            <div className="px-4 py-2 relative z-10">
              {!authChecked ? (
                <div className="py-4">
                  <div 
                    className="h-8 w-full rounded-md mb-2"
                    style={{ background: "rgba(255, 255, 255, 0.06)" }}
                  />
                  <div 
                    className="h-8 w-full rounded-md"
                    style={{ background: "rgba(255, 255, 255, 0.06)" }}
                  />
                </div>
              ) : user ? (
                <>
                  {/* User profile card with improved styling */}
                  <div className="py-3 border-b border-white/10 mb-3">
                    <div
                      className="block text-sm font-medium truncate py-3 px-4 rounded-lg relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(192, 38, 211, 0.25) 0%, rgba(219, 39, 119, 0.25) 100%)",
                        boxShadow: "0 8px 16px rgba(192, 38, 211, 0.15)"
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
                          <div className="text-white/70 text-xs truncate mt-0.5">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {[
                    { title: 'Dashboard', icon: 'fa-tachometer-alt', color: 'indigo', path: '/dashboard' },
                    { title: 'Profile', icon: 'fa-user-circle', color: 'purple', path: '/profile' },
                    { title: 'Log Out', icon: 'fa-sign-out-alt', color: 'pink', path: '' }
                  ].map((item, idx) => {
                    const action = item.title === 'Log Out' ? handleLogout : undefined;
                    
                    return (
                      <div key={item.title}>
                        {item.title === 'Log Out' ? (
                          <button
                            onClick={action}
                            className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all duration-300"
                          >
                            <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                              background: "rgba(236, 72, 153, 0.15)",
                              boxShadow: "0 2px 5px rgba(236, 72, 153, 0.1)"
                            }}>
                              <i className={`fas ${item.icon} text-pink-400`}></i>
                            </span>
                            {item.title}
                          </button>
                        ) : (
                          <Link 
                            href={item.path}
                            prefetch={false}
                            onClick={handleNavLinkClick}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all duration-300 ${
                              pathname?.startsWith(item.path) ? 'bg-white/10' : ''
                            }`}
                          >
                            <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                              background: item.color === 'indigo' 
                                ? "rgba(99, 102, 241, 0.15)" 
                                : "rgba(168, 85, 247, 0.15)",
                              boxShadow: item.color === 'indigo'
                                ? "0 2px 5px rgba(99, 102, 241, 0.1)"
                                : "0 2px 5px rgba(168, 85, 247, 0.1)"
                            }}>
                              <i className={`fas ${item.icon} ${
                                item.color === 'indigo' ? 'text-indigo-400' : 'text-purple-400'
                              }`}></i>
                            </span>
                            {item.title}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="py-3 mb-2">
                    <div className="grid grid-cols-1 gap-3">
                      <Link 
                        href="/login"
                        prefetch={false}
                        onClick={handleNavLinkClick}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
                      >
                        <i className="fas fa-sign-in-alt text-fuchsia-400"></i>
                        <span>Log In</span>
                      </Link>
                      
                      <Link 
                        href="/register"
                        prefetch={false}
                        onClick={handleNavLinkClick}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, rgba(192, 38, 211, 0.9), rgba(219, 39, 119, 0.9), rgba(239, 68, 68, 0.9))",
                          boxShadow: "0 4px 12px rgba(219, 39, 119, 0.3)"
                        }}
                      >
                        <i className="fas fa-user-plus text-white"></i>
                        <span>Register</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
              
              {/* Divider */}
              <div className="border-t my-3 border-white/10"></div>
              
              {/* Common links for both logged in and non-logged in users */}
              <div className="py-1">
                {/* Products Section */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 px-3">Products</div>
                  <div className="space-y-1">
                    <Link 
                      href="/adobe-creative-cloud"
                      prefetch={false}
                      onClick={handleNavLinkClick}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-all duration-300"
                    >
                      <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                        background: "rgba(168, 85, 247, 0.15)",
                        boxShadow: "0 2px 5px rgba(168, 85, 247, 0.1)"
                      }}>
                        <i className="fas fa-palette text-purple-400"></i>
                      </span>
                      Creative Cloud
                    </Link>
                    
                    <Link 
                      href="/adobe-acrobat-pro"
                      prefetch={false}
                      onClick={handleNavLinkClick}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-all duration-300"
                    >
                      <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        boxShadow: "0 2px 5px rgba(239, 68, 68, 0.1)"
                      }}>
                        <i className="fas fa-file-pdf text-red-400"></i>
                      </span>
                      Acrobat Pro
                    </Link>
                    
                    <Link 
                      href="/compare"
                      prefetch={false}
                      onClick={handleNavLinkClick}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-all duration-300"
                    >
                      <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                        background: "rgba(234, 179, 8, 0.15)",
                        boxShadow: "0 2px 5px rgba(234, 179, 8, 0.1)"
                      }}>
                        <i className="fas fa-balance-scale text-yellow-400"></i>
                      </span>
                      Compare Options
                    </Link>
                  </div>
                </div>
                
                <div className="border-t border-white/10 my-3"></div>
                
                <Link 
                  href="/blog"
                  prefetch={false}
                  onClick={handleNavLinkClick}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-all duration-300 ${
                    isBlogPage ? 'bg-white/10' : ''
                  }`}
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    boxShadow: "0 2px 5px rgba(59, 130, 246, 0.1)"
                  }}>
                    <i className="fas fa-book-open text-blue-400"></i>
                  </span>
                  Blog
                </Link>
                
                <Link 
                  href="/#pricing"
                  prefetch={false}
                  onClick={handleNavLinkClick}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    boxShadow: "0 2px 5px rgba(16, 185, 129, 0.1)"
                  }}>
                    <i className="fas fa-tag text-emerald-400"></i>
                  </span>
                  Pricing
                </Link>
                
                <Link 
                  href="mailto:support@cheapcc.online"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all duration-300"
                  onClick={() => {
                    if (window.navigator && 'vibrate' in window.navigator) {
                      window.navigator.vibrate(5);
                    }
                  }}
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                    background: "rgba(156, 163, 175, 0.15)",
                    boxShadow: "0 2px 5px rgba(156, 163, 175, 0.1)"
                  }}>
                    <i className="fas fa-envelope text-gray-400" aria-hidden="true"></i>
                  </span>
                  <span>Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}