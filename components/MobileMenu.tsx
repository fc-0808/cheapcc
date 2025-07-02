'use client';
import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  user: any;
  userName: string;
  handleNavLinkClick: () => void;
  handleLogout: () => Promise<void>;
  isBlogPage: boolean;
}

// This component is loaded dynamically to reduce the initial load size
const MobileMenu = memo(({
  user,
  userName,
  handleNavLinkClick,
  handleLogout,
  isBlogPage
}: MobileMenuProps) => {
  const pathname = usePathname();
  const isDashboardOrProfile = pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile');
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  return (
    <div className={`px-4 pt-2 pb-3 space-y-1 shadow-lg border-t animate-fadeIn ${
      isDashboardOrProfile ? 'bg-gray-900 border-gray-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
    }`}>
      <Link 
        href="/blog"
        onClick={handleNavLinkClick}
        className={`block px-3 py-2 rounded-md text-base font-medium ${
          isDashboardOrProfile ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        } transition-colors duration-150`}
      >
        <i className="fas fa-book-open mr-2 text-[#ff3366]"></i>Blog
      </Link>
      <Link 
        href="/#pricing"
        onClick={handleNavLinkClick}
        className={`block px-3 py-2 rounded-md text-base font-medium ${
          isDashboardOrProfile ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        } transition-colors duration-150`}
      >
        <i className="fas fa-tag mr-2 text-[#ff3366]"></i>Pricing
      </Link>
      
      {user ? (
        <>
          <div className={`border-t my-2 ${isDashboardOrProfile ? 'border-gray-800' : 'border-gray-200 dark:border-gray-800'}`}></div>
          <div className={`px-3 py-1.5 text-xs font-semibold uppercase ${isDashboardOrProfile ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Account
          </div>
          <Link
            href="/dashboard"
            onClick={handleNavLinkClick}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname?.startsWith('/dashboard')
                ? 'bg-gray-800/50 text-white'
                : (isDashboardOrProfile ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800')
            } transition-colors duration-150`}
          >
            <i className="fas fa-chart-line mr-2 text-[#ff3366]"></i>Dashboard
          </Link>
          <Link
            href="/profile"
            onClick={handleNavLinkClick}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname?.startsWith('/profile')
                ? 'bg-gray-800/50 text-white'
                : (isDashboardOrProfile ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800')
            } transition-colors duration-150`}
          >
            <i className="fas fa-user mr-2 text-[#ff3366]"></i>Profile
          </Link>
          <button
            onClick={handleLogout}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              isDashboardOrProfile ? 'text-red-400 hover:bg-gray-800' : 'text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors duration-150`}
          >
            <i className="fas fa-sign-out-alt mr-2"></i>Sign out
          </button>
        </>
      ) : (
        <>
          <div className={`border-t my-2 ${isDashboardOrProfile ? 'border-gray-800' : 'border-gray-200 dark:border-gray-800'}`}></div>
          <Link
            href="/login"
            onClick={handleNavLinkClick}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isDashboardOrProfile ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors duration-150`}
          >
            <i className="fas fa-sign-in-alt mr-2 text-[#ff3366]"></i>Sign in
          </Link>
          <Link
            href="/register"
            onClick={handleNavLinkClick}
            className="block px-3 py-2 mt-2 rounded-md text-base font-medium text-white border border-[#ff3366] bg-transparent hover:border-[#ff4778] transition text-center py-3 relative 
            before:absolute before:inset-0 before:-z-10 before:rounded-md before:opacity-50 before:blur-sm before:bg-[#ff3366] before:transition-all
            hover:before:opacity-70 hover:before:blur-md"
          >
            <i className="fas fa-user-plus mr-2"></i>Register
          </Link>
        </>
      )}
    </div>
  );
});

// Add display name for React DevTools
MobileMenu.displayName = 'MobileMenu';

export default MobileMenu; 