"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/supabase-client";
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false); // Initialize to false

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
          setAuthChecked(true); // Mark initial check as complete
        }
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      // If onAuthStateChange fires before getInitialSession completes its finally block
      if (!authChecked && isMounted) {
        setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Empty dependency array: runs once on mount for auth setup

  // Effect for scroll handling and click outside dropdown/mobile menu
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setShowHeader(currentY <= 60 || currentY < lastScrollY.current);
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        // Ensure the click is not on the toggle button itself, which would re-open it
        if (mobileToggle && !mobileToggle.contains(event.target as Node)) {
            setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]); // Re-add listener if mobile menu state affects its behavior

  // Effect to close menus on pathname change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // setUser(null); // Handled by onAuthStateChange
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
    router.refresh(); // Ensure layout reflects logout
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If on dashboard or profile, force a full page navigation to home
    // to ensure correct state reset if needed.
    if (pathname === '/dashboard' || pathname === '/profile' || pathname === '/login' || pathname === '/register') {
      e.preventDefault();
      window.location.href = '/'; // Or router.push('/') and ensure state resets
    }
    setIsMobileMenuOpen(false); // Always close mobile menu on logo click
  };
  
  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu when a nav link is clicked
  };


  return (
    <header className={!showHeader ? 'hidden' : ''}>
      <div className="container">
        <Link href="/" onClick={handleLogoClick} className="logo-link">
          <span className="logo-text">
            Cheap <span className="accent-text">CC</span>
          </span>
        </Link>

        {/* Mobile menu toggle button - visible on small screens */}
        <div className="md:hidden">
          <button
            id="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
        
        {/* Desktop navigation - hidden on small screens */}
        <div className="hidden md:flex items-center gap-4">
          {!authChecked ? (
            <div className="auth-skeleton"></div>
          ) : user ? (
            <div className="user-info">
              <span className="user-email-display hidden md:inline-flex items-center">
                <i className="fas fa-user-circle icon"></i>
                {user.email}
              </span>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className={`dropdown-button${isDropdownOpen ? ' open' : ''}`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="md:hidden"> {/* Icon for mobile-sized desktop view if needed */}
                    <i className="fas fa-user-cog icon"></i>
                  </span>
                  <span className="hidden md:inline">My Account</span>
                  <i className={`fas fa-chevron-down chevron-icon`}></i>
                </button>

                <div className={`dropdown-menu${isDropdownOpen ? ' open' : ''}`}>
                  <Link href="/dashboard" onClick={handleNavLinkClick}>
                    <i className="fas fa-tachometer-alt icon"></i> Dashboard
                  </Link>
                  <Link href="/profile" onClick={handleNavLinkClick}>
                    <i className="fas fa-user-edit icon"></i> Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt icon"></i> Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="nav-links flex items-center gap-2">
              <Link href="/login">
                Log In
              </Link>
              <Link href="/register" className="register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile dropdown menu - shown when hamburger is clicked */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu" ref={mobileMenuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg absolute top-full left-0 right-0 z-40 border-t border-gray-100">
            {!authChecked ? (
              <div className="px-3 py-2">
                <div className="animate-pulse bg-gray-200 h-8 w-full rounded mb-2"></div>
                <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
              </div>
            ) : user ? (
              <>
                <div className="px-3 py-2">
                  <span className="block text-sm font-medium text-gray-600 truncate">{user.email}</span>
                </div>
                <Link href="/dashboard" onClick={handleNavLinkClick} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
                </Link>
                <Link href="/profile" onClick={handleNavLinkClick} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-user-edit mr-2"></i> Profile
                </Link>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-sign-out-alt mr-2"></i> Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={handleNavLinkClick} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  Log In
                </Link>
                <Link href="/register" onClick={handleNavLinkClick} className="block px-3 py-2 rounded text-base font-medium bg-pink-50 text-[#ff3366] hover:bg-pink-100">
                  Register
                </Link>
              </>
            )}
            <div className="my-2 h-px bg-gray-200"></div>
            <Link href="/#pricing" onClick={handleNavLinkClick} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
              Pricing
            </Link>
            <Link href="/faq" onClick={handleNavLinkClick} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
              FAQ
            </Link>
             <Link href="mailto:support@cheapcc.online" onClick={handleNavLinkClick} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
              Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}