'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  trackBrandPageView, 
  trackDropdownInteraction, 
  initializeEnhancedTracking,
  detectSearchIntent 
} from '@/utils/analytics';

// Enhanced Analytics Component for Professional Tracking
export default function EnhancedAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize enhanced tracking on mount
    initializeEnhancedTracking();

    // Track brand page views
    const brandPages = [
      '/cheapcc-review',
      '/what-is-cheapcc', 
      '/cheapcc-vs-adobe-official',
      '/cheapcc-testimonials',
      '/cheapcc-net',
      '/voice-search-faq'
    ];

    if (brandPages.some(page => pathname.startsWith(page))) {
      const pageName = pathname.split('/')[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      trackBrandPageView(pageName, pathname);
    }

    // Track dropdown interactions
    const handleDropdownOpen = () => trackDropdownInteraction('open');
    const handleDropdownClose = () => trackDropdownInteraction('close');
    const handleDropdownClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const linkText = target.textContent || target.getAttribute('aria-label') || 'Unknown';
      trackDropdownInteraction('click', linkText);
    };

    // Add event listeners for dropdown tracking
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');
    const dropdownLinks = document.querySelectorAll('[data-dropdown-link]');

    dropdownTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', handleDropdownOpen);
      trigger.addEventListener('mouseleave', handleDropdownClose);
    });

    dropdownLinks.forEach(link => {
      link.addEventListener('click', handleDropdownClick);
    });

    // Core Web Vitals tracking
    if ('web-vitals' in window) {
      // This would integrate with web-vitals library
      console.log('Core Web Vitals tracking active for:', pathname);
    }

    // Cleanup event listeners
    return () => {
      dropdownTriggers.forEach(trigger => {
        trigger.removeEventListener('mouseenter', handleDropdownOpen);
        trigger.removeEventListener('mouseleave', handleDropdownClose);
      });

      dropdownLinks.forEach(link => {
        link.removeEventListener('click', handleDropdownClick);
      });
    };
  }, [pathname]);

  // Track scroll depth for engagement
  useEffect(() => {
    let maxScroll = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'scroll_depth', {
            event_category: 'Engagement',
            event_action: 'scroll',
            event_label: `${scrollPercent}%`,
            value: scrollPercent,
            page_path: pathname
          });
        }
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    return () => window.removeEventListener('scroll', trackScrollDepth);
  }, [pathname]);

  // Track time on page for brand pages
  useEffect(() => {
    const brandPages = [
      '/cheapcc-review',
      '/what-is-cheapcc', 
      '/cheapcc-vs-adobe-official',
      '/cheapcc-testimonials'
    ];

    if (!brandPages.some(page => pathname.startsWith(page))) return;

    const startTime = Date.now();

    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'time_on_page', {
          event_category: 'Brand Engagement',
          event_action: 'time_spent',
          event_label: pathname,
          value: timeSpent,
          page_type: 'brand_page'
        });
      }
    };

    // Track time on page when user leaves
    const handleBeforeUnload = () => trackTimeOnPage();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackTimeOnPage();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackTimeOnPage(); // Track when component unmounts
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}

