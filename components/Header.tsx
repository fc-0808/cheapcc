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
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
      }
      ticking = true;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const checkAuth = async () => {
      setAuthChecked(false);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
        } else if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
         setAuthChecked(false);
         checkAuth();
      }
      if (!authChecked) setAuthChecked(true);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      
      // Handle clicks outside mobile menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle && !mobileToggle.contains(event.target as Node)) {
            setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pathname, isMobileMenuOpen, authChecked]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/dashboard' || pathname === '/profile') {
      e.preventDefault();
      window.location.href = '/';
    }
    setIsMobileMenuOpen(false);
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
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Toggle mobile menu"
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
                  <span className="md:hidden">
                    <i className="fas fa-user-cog icon"></i>
                  </span>
                  <span className="hidden md:inline">My Account</span>
                  <i className={`fas fa-chevron-down chevron-icon`}></i>
                </button>

                <div className={`dropdown-menu${isDropdownOpen ? ' open' : ''}`}>
                  <Link href="/dashboard">
                    <i className="fas fa-tachometer-alt icon"></i> Dashboard
                  </Link>
                  <Link href="/profile">
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
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
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
                <Link href="/dashboard" className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
                </Link>
                <Link href="/profile" className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-user-edit mr-2"></i> Profile
                </Link>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-sign-out-alt mr-2"></i> Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
                  Log In
                </Link>
                <Link href="/register" className="block px-3 py-2 rounded text-base font-medium bg-pink-50 text-[#ff3366] hover:bg-pink-100">
                  Register
                </Link>
              </>
            )}
            <div className="my-2 h-px bg-gray-200"></div>
            <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
              Pricing
            </Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:bg-gray-50">
              FAQ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 