"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/supabase-client";
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, Variants } from 'framer-motion';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [headerParticles, setHeaderParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  
  // For hover animation on links
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Check if current path is dashboard or profile
  const isDashboardOrProfile = pathname?.includes('/dashboard') || pathname?.includes('/profile');
  
  // Check if current path is login or register
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  // Determine if dropdown menu should use light or dark theme
  const usesDarkTheme = isDashboardOrProfile || isAuthPage || pathname !== '/' || (pathname === '/' && scrolledPastHero);
  
  // Header background glow animation - depends on scroll position and theme
  const headerBgOpacity = useSpring(scrolledPastHero ? 0.95 : 0.7, { stiffness: 100, damping: 30 });
  
  // Animation variants
  const logoVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };
  
  const navItemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.1 + custom * 0.1
      }
    })
  };
  
  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };
  
  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };
  
  const dropdownItemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2
      }
    }
  };

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
    
    // Generate particles for header background
    const particles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 2
    }));
    setHeaderParticles(particles);
    
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

  // Add opacity transition for smooth appearance
  const visibilityClasses = isVisible ? "opacity-100" : "opacity-0";

  return (
    <motion.header 
      className={`fixed top-0 z-50 py-3 mx-3 my-4 rounded-[20px] transition-all duration-300 ease-in-out left-0 right-0 md:left-20 md:right-20 lg:left-80 lg:right-80 ${visibilityClasses}`}
      style={{
        background: 'transparent',
        backdropFilter: "blur(3px)",
        boxShadow: "none",
        borderBottom: "none",
      }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: -20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1],
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Background particles - reduced opacity and size */}
      {headerParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: `${particle.size * 0.7}px`,
            height: `${particle.size * 0.7}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + particle.id % 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between relative z-10">
        <motion.div variants={logoVariants}>
          <Link href="/" prefetch={false} onClick={handleLogoClick} className="flex items-center group">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="font-medium text-lg tracking-tight relative">
                <motion.span 
                  className="relative z-10 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent inline-block"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  style={{ 
                    backgroundSize: "200% 100%"
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  Cheap
                </motion.span>
                <motion.span 
                  className="text-white font-medium relative ml-1"
                  animate={{ 
                    textShadow: ["0 0 4px rgba(255, 51, 102, 0)", "0 0 8px rgba(255, 51, 102, 0.5)", "0 0 4px rgba(255, 51, 102, 0)"]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  CC
                </motion.span>
              </span>
              
              {/* Reduced glow behind the logo */}
              <motion.div 
                className="absolute inset-0 -z-10 opacity-40 blur-md"
                animate={{ 
                  background: [
                    "radial-gradient(circle at center, rgba(249, 115, 22, 0.2) 0%, transparent 70%)",
                    "radial-gradient(circle at center, rgba(219, 39, 119, 0.3) 0%, transparent 70%)",
                    "radial-gradient(circle at center, rgba(249, 115, 22, 0.2) 0%, transparent 70%)"
                  ],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* Mobile menu toggle button - more subtle */}
        <motion.div className="md:hidden" variants={logoVariants}>
          <motion.button
            id="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            className={`p-2 rounded-full bg-white/5 text-white/80 border border-white/10`}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <motion.div
              animate={isMobileMenuOpen ? "open" : "closed"}
              variants={{
                open: { rotate: 90 },
                closed: { rotate: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-base`}></i>
            </motion.div>
          </motion.button>
        </motion.div>
        
        {/* Desktop navigation - more subtle */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {/* Blog link for desktop */}
          <motion.div variants={navItemVariants} custom={0}>
            <Link 
              href="/blog" 
              prefetch={false}
              className={`${navLinkClasses} ${isBlogPage ? 'font-medium' : 'font-light'} relative group text-white/90 hover:text-white`}
              onClick={handleNavLinkClick}
            >
              <span className="relative z-10">Blog</span>
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-fuchsia-500/70 to-[#ff3366]/70 group-hover:w-full transition-all duration-300"
                layoutId="blogNavUnderline"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              {isBlogPage && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-fuchsia-500/70 to-[#ff3366]/70"
                  layoutId="activeNavUnderline"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </Link>
          </motion.div>

          {!authChecked ? (
            <motion.div 
              className="bg-white/5 h-8 w-28 rounded-md backdrop-blur-sm"
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [0.98, 1.01, 0.98]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : user ? (
            <div className="flex items-center space-x-5">
              <motion.span 
                variants={navItemVariants}
                custom={1}
                className="hidden lg:flex items-center text-sm font-light"
              >
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.05, x: 3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <motion.i 
                    className="fas fa-user-circle mr-2 text-[#ff3366]/80"
                    animate={{ rotate: [0, 10, 0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 bg-clip-text text-transparent">
                    {userName || (user?.email ? user.email.split('@')[0] : 'User')}
                  </span>
                </motion.div>
              </motion.span>

              <motion.div ref={dropdownRef} className="relative" variants={navItemVariants} custom={2}>
                <motion.button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 py-1 px-3 rounded-full text-sm font-light transition-all duration-200 transform text-white/90"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    y: -1
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                  }}
                >
                  <span className="md:hidden lg:hidden">
                    <i className="fas fa-user-circle text-[#ff3366]/80"></i>
                  </span>
                  <span className="hidden md:inline">Account</span>
                  <motion.i 
                    className={`fas fa-chevron-down text-xs text-[#ff3366]/80`}
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-2xl py-2 z-50 overflow-hidden"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{
                        border: "1px solid rgba(229, 231, 235, 0.5)",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <motion.div 
                        className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-t border-l"
                        style={{ borderColor: "rgba(229, 231, 235, 0.5)" }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      />
                      
                      <motion.div 
                        className="pt-2 pb-3 px-4 mb-1 border-b border-gray-100"
                        variants={dropdownItemVariants}
                      >
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Menu</p>
                      </motion.div>
                      
                      <motion.div variants={dropdownItemVariants}>
                        <Link 
                          href="/dashboard" 
                          prefetch={false}
                          onClick={handleNavLinkClick}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <motion.span 
                            className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <i className="fas fa-tachometer-alt text-indigo-700"></i>
                          </motion.span>
                          Dashboard
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={dropdownItemVariants}>
                        <Link 
                          href="/profile" 
                          prefetch={false}
                          onClick={handleNavLinkClick}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <motion.span 
                            className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <i className="fas fa-user-circle text-purple-700"></i>
                          </motion.span>
                          Profile
                        </Link>
                      </motion.div>
                      
                      <motion.div className="border-t border-gray-100 my-1" variants={dropdownItemVariants} />
                      
                      <motion.div variants={dropdownItemVariants}>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <motion.span 
                            className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <i className="fas fa-sign-out-alt text-pink-700"></i>
                          </motion.span>
                          Log Out
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <motion.div variants={navItemVariants} custom={1}>
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    x: 2
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href="/login"
                    className="relative text-sm font-light py-1.5 px-3 rounded-full flex items-center gap-1 transition-all duration-300 text-white/90 hover:text-white bg-white/5 border border-white/10"
                    style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.1)" }}
                  >
                    <span className="relative z-10">Log In</span>
                    <motion.i 
                      className="fas fa-arrow-right text-white/70 text-xs ml-1 relative z-10"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div variants={navItemVariants} custom={2}>
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -3,
                    boxShadow: "0 10px 25px rgba(236, 72, 153, 0.35)"
                  }}
                  whileTap={{ scale: 0.92, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 8 }}
                >
                  <Link 
                    href="/register"
                    className="relative overflow-hidden text-sm font-medium py-1.5 px-5 rounded-full flex items-center gap-1.5 transition-all duration-300 text-white"
                    style={{
                      background: "linear-gradient(135deg, rgba(192, 38, 211, 0.9), rgba(219, 39, 119, 0.9), rgba(239, 68, 68, 0.9))",
                      boxShadow: "0 4px 10px rgba(219, 39, 119, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
                      border: "none",
                    }}
                  >
                    <motion.span 
                      className="absolute inset-0 opacity-40"
                      animate={{
                        background: [
                          "linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 50%, transparent 75%)",
                          "linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.2) 50%, transparent 80%)",
                          "linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 50%, transparent 75%)"
                        ],
                        backgroundSize: ["200% 200%", "200% 200%", "200% 200%"],
                        backgroundPosition: ["-200% -200%", "200% 200%", "-200% -200%"]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                    <span className="relative z-10 tracking-wide">Register</span>
                    <motion.i 
                      className="fas fa-user-plus text-white text-xs ml-1 relative z-10"
                      animate={{ 
                        rotate: [0, 15, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile dropdown menu with animations */}
      <AnimatePresence>
        {isMobileMenuOpen && isMounted && (
          <motion.div 
            id="mobile-menu" 
            ref={mobileMenuRef} 
            className="md:hidden mt-2 px-4"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className={`pt-2 pb-3 space-y-1 backdrop-blur-sm rounded-2xl overflow-hidden relative`}
              style={{
                background: "rgba(23, 23, 70, 0.4)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              {/* Mobile menu background effect */}
              <motion.div 
                className="absolute inset-0 z-0 pointer-events-none" 
                animate={{ 
                  background: [
                    "radial-gradient(circle at 30% 30%, rgba(219, 39, 119, 0.06), transparent 70%)",
                    "radial-gradient(circle at 70% 70%, rgba(219, 39, 119, 0.06), transparent 70%)",
                    "radial-gradient(circle at 30% 30%, rgba(219, 39, 119, 0.06), transparent 70%)"
                  ]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <div className="px-4 py-2 relative z-10">
                {!authChecked ? (
                  <div className="py-4">
                    <motion.div 
                      className="h-8 w-full rounded-md mb-2"
                      style={{ background: "rgba(255, 255, 255, 0.06)" }}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="h-8 w-full rounded-md"
                      style={{ background: "rgba(255, 255, 255, 0.06)" }}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                  </div>
                ) : user ? (
                  <>
                    <motion.div 
                      className={`py-3 border-b border-white/5 mb-3`}
                      variants={{
                        hidden: { opacity: 0, y: -10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                      }}
                    >
                      <motion.div
                        className={`block text-sm font-light truncate py-2.5 px-4 rounded-lg relative overflow-hidden`}
                        style={{
                          background: "linear-gradient(135deg, rgba(79, 70, 229, 0.6) 0%, rgba(219, 39, 119, 0.6) 100%)",
                          boxShadow: "0 3px 10px rgba(79, 70, 229, 0.15)"
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Animated pattern overlay */}
                        <motion.div 
                          className="absolute inset-0 opacity-5"
                          style={{
                            backgroundImage: "radial-gradient(circle at 10px 10px, rgba(255,255,255,0.1) 2px, transparent 0)",
                            backgroundSize: "20px 20px"
                          }}
                          animate={{ x: [0, 20], y: [0, -20] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                        
                        <div className="flex items-center relative z-10">
                          <motion.i 
                            className="fas fa-user-circle mr-2 text-white/70"
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <span className="text-white/90 font-light">
                            {userName || (user?.email ? user.email.split('@')[0] : 'User')}
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                    
                    {['Dashboard', 'Profile', 'Log Out'].map((item, idx) => {
                      const Icon = idx === 0 
                        ? "fas fa-tachometer-alt" 
                        : idx === 1 
                          ? "fas fa-user-circle" 
                          : "fas fa-sign-out-alt";
                      const color = idx === 0 
                        ? "indigo" 
                        : idx === 1 
                          ? "purple" 
                          : "pink";
                      const path = idx === 0 
                        ? "/dashboard" 
                        : idx === 1 
                          ? "/profile" 
                          : "";
                      const action = idx === 2 ? handleLogout : undefined;
                      
                      return (
                        <motion.div 
                          key={item}
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { 
                              opacity: 1, 
                              x: 0, 
                              transition: { 
                                delay: 0.1 + idx * 0.1,
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                              } 
                            }
                          }}
                        >
                          {idx === 2 ? (
                            <motion.button
                              onClick={action}
                              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light text-white/80 hover:bg-white/5 transition-all duration-300`}
                              whileHover={{ 
                                x: 2, 
                                backgroundColor: 'rgba(255, 255, 255, 0.08)'
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <motion.span 
                                className={`w-7 h-7 rounded-full bg-${color}-500/10 flex items-center justify-center`}
                                whileHover={{ rotate: 10 }}
                              >
                                <i className={`${Icon} text-${color}-300`}></i>
                              </motion.span>
                              {item}
                            </motion.button>
                          ) : (
                            <Link 
                              href={path}
                              prefetch={false}
                              onClick={handleNavLinkClick}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light text-white/80 hover:bg-white/5 transition-all duration-300`}
                            >
                              <motion.span 
                                className={`w-7 h-7 rounded-full bg-${color}-500/10 flex items-center justify-center`}
                                whileHover={{ rotate: 10 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <i className={`${Icon} text-${color}-300`}></i>
                              </motion.span>
                              {item}
                            </Link>
                          )}
                        </motion.div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {[
                      { title: 'Log In', icon: 'fa-sign-in-alt', color: 'indigo', path: '/login' },
                      { title: 'Register', icon: 'fa-user-plus', color: 'pink', path: '/register' }
                    ].map((item, idx) => (
                      <motion.div
                        key={item.title}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { 
                            opacity: 1, 
                            x: 0, 
                            transition: { 
                              delay: 0.1 + idx * 0.1,
                              type: "spring",
                              stiffness: 300,
                              damping: 20
                            } 
                          }
                        }}
                      >
                        <Link 
                          href={item.path}
                          prefetch={false}
                          onClick={handleNavLinkClick}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light text-white/80 hover:bg-white/5 transition-all duration-300`}
                        >
                          <motion.span 
                            className={`w-7 h-7 rounded-full bg-${item.color}-500/10 flex items-center justify-center`}
                            whileHover={{ rotate: 10 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <i className={`fas ${item.icon} text-${item.color}-300`}></i>
                          </motion.span>
                          {item.title}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}
                
                {/* Blog and Support links */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { 
                      opacity: 1, 
                      x: 0, 
                      transition: { 
                        delay: user ? 0.4 : 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      } 
                    }
                  }}
                >
                  <Link 
                    href="/blog"
                    prefetch={false}
                    onClick={handleNavLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light text-white/80 hover:bg-white/5 transition-all duration-300 ${isBlogPage ? 'font-normal' : ''}`}
                  >
                    <motion.span 
                      className={`w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center`}
                      whileHover={{ rotate: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className={`fas fa-book-open text-blue-300`}></i>
                    </motion.span>
                    Blog
                  </Link>
                </motion.div>
                
                <motion.div 
                  className={`border-t my-2 border-white/5`}
                  variants={{
                    hidden: { opacity: 0, width: 0 },
                    visible: { 
                      opacity: 1, 
                      width: "100%", 
                      transition: { 
                        delay: user ? 0.5 : 0.4,
                        duration: 0.3
                      } 
                    }
                  }}
                />
                
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      transition: { 
                        delay: user ? 0.6 : 0.5,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      } 
                    }
                  }}
                >
                  <Link 
                    href="mailto:support@cheapcc.online"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light text-white/80 hover:bg-white/5 transition-all duration-300`}
                  >
                    <motion.span 
                      className={`w-7 h-7 rounded-full bg-gray-500/10 flex items-center justify-center`}
                      whileHover={{ rotate: 10 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(255, 255, 255, 0)",
                          "0 0 5px rgba(255, 255, 255, 0.3)",
                          "0 0 0 rgba(255, 255, 255, 0)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.i 
                        className={`fas fa-envelope text-white/60`}
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.span>
                    Support
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}