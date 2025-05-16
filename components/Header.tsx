"use client";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
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
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`transition-all duration-500 fixed top-0 left-0 w-full z-30 ${showHeader ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-white shadow`} style={{ willChange: 'opacity, transform' }}>
      <div className="container header-container flex items-center justify-between py-4 px-4 md:px-8">
        <a href="/" className="logo text-2xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2">
          cheap<span className="text-[#ff3366]">CC</span>
        </a>
        <div className="account-nav flex items-center gap-4">
          <a href="/login" className="account-btn login-btn flex items-center gap-2 px-4 py-2 rounded-md bg-[#2c2d5a] text-white font-semibold text-sm hover:bg-[#484a9e] focus:ring-2 focus:ring-[#ff3366] focus:outline-none transition">
            <i className="fas fa-sign-in-alt" aria-hidden="true"></i>Login
          </a>
          <a href="/register" className="account-btn register-btn flex items-center gap-2 px-4 py-2 rounded-md bg-[#ff3366] text-white font-semibold text-sm hover:bg-[#ff6b8b] focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none transition">
            <i className="fas fa-user-plus" aria-hidden="true"></i>Register
          </a>
        </div>
      </div>
    </header>
  );
} 