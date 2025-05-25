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
  const lastScrollY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

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
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/dashboard' || pathname === '/profile') {
      e.preventDefault();
      window.location.href = '/';
    }
  };

  return (
    <header className={!showHeader ? 'hidden' : ''}>
      <div className="container">
        <Link href="/" onClick={handleLogoClick} className="logo-link">
          <span className="logo-text">
            Cheap <span className="accent-text">CC</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
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
    </header>
  );
} 