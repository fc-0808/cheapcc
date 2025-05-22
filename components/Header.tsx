"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/supabase-client";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const lastScrollY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Close dropdown when navigating between pages
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > lastScrollY.current && currentY > 60) {
            setShowHeader(false); // scrolling down
          } else {
            setShowHeader(true); // scrolling up
          }
          lastScrollY.current = currentY;
          ticking = false;
        });
      }
      ticking = true;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Create a fresh Supabase client for each auth check
        const supabase = createClient();
        
        // Try to get session first - if this fails, we won't try to get user
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (isMounted) {
            setAuthError(true);
            setUser(null);
            setAuthChecked(true);
          }
          return;
        }
        
        // Only try to get user if we have a session
        if (sessionData?.session) {
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('Auth error in header:', error);
            if (isMounted) {
              setUser(null);
              setAuthChecked(true);
            }
          } else if (data?.user) {
            console.log('User authenticated in header:', data.user.email);
            if (isMounted) {
              setUser(data.user);
              setAuthChecked(true);
            }
          } else {
            console.log('No authenticated user found in header');
            if (isMounted) {
              setUser(null);
              setAuthChecked(true);
            }
          }
        } else {
          console.log('No active session found');
          if (isMounted) {
            setUser(null);
            setAuthChecked(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (isMounted) {
          setUser(null);
          setAuthError(true);
          setAuthChecked(true);
        }
      }
    };
    
    // Reset state on each check
    setAuthChecked(false);
    setAuthError(false);
    
    // Perform the auth check
    checkAuth();
    
    // Set up auth listener
    const supabase = createClient();
    
    // Safer way to handle auth state changes
    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session && isMounted) {
          setUser(session.user);
        } else if (isMounted) {
          setUser(null);
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
    }
    
    // Handle click outside of dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth changes:', error);
        }
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pathname]); // Re-check auth when pathname changes to ensure header updates after login/logout

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      window.location.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={`bg-white shadow-sm fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link 
          href="/" 
          onClick={(e) => {
            // Force a full page reload when navigating from dashboard or profile pages
            // This ensures the PayPal button renders correctly
            if (pathname === '/dashboard' || pathname === '/profile') {
              e.preventDefault();
              window.location.href = '/';
              console.log('Forcing full page reload from:', pathname);
            }
          }}
          className="text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition"
        >
          Cheap <span className="text-[#ff3366]">CC</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {!authChecked ? (
            // Loading state
            <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-md"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-[#2c2d5a] font-medium hidden md:inline-block">
                <i className="fas fa-user-circle mr-2 text-[#ff3366]"></i>
                {user.email}
              </span>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 border border-transparent hover:border-gray-200 font-medium text-[#2c2d5a] hover:text-[#ff3366] hover:shadow-sm"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="md:hidden mr-2">
                    <i className="fas fa-user-circle text-[#ff3366]"></i>
                  </span>
                  <span className="hidden md:inline-block">My Account</span>
                  <i className={`ml-2 fas fa-chevron-down text-[#ff3366] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 transform' : ''}`}></i>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 py-2 bg-white shadow-lg rounded-lg z-20 border border-gray-200 animate-fadeIn">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#ff3366] transition-colors duration-200">
                      <i className="fas fa-tachometer-alt w-5 mr-2 text-gray-500"></i> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#ff3366] transition-colors duration-200">
                      <i className="fas fa-user w-5 mr-2 text-gray-500"></i> Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#ff3366] transition-colors duration-200"
                    >
                      <i className="fas fa-sign-out-alt w-5 mr-2 text-gray-500"></i> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-[#2c2d5a] hover:text-[#ff3366] font-medium">
                Log In
              </Link>
              <Link href="/register" className="px-4 py-2 bg-[#ff3366] text-white rounded-lg hover:bg-[#e62e5c] transition font-medium">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 