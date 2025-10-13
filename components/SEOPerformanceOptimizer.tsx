'use client';
import { useEffect } from 'react';
import Script from 'next/script';

interface SEOPerformanceOptimizerProps {
  enableCriticalResourceHints?: boolean;
  enableImageOptimization?: boolean;
  enableFontOptimization?: boolean;
  enableServiceWorker?: boolean;
}

export default function SEOPerformanceOptimizer({
  enableCriticalResourceHints = true,
  enableImageOptimization = true,
  enableFontOptimization = true,
  enableServiceWorker = false
}: SEOPerformanceOptimizerProps) {
  
  useEffect(() => {
    // Critical Resource Hints
    if (enableCriticalResourceHints) {
      // Preload critical images that are likely to be needed
      const criticalImages = [
        '/favicon.svg',
        '/og-image.svg',
        '/twitter-image.svg'
      ];
      
      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    }
    
    // Image Optimization
    if (enableImageOptimization) {
      // Implement lazy loading for images below the fold
      const images = document.querySelectorAll('img[data-lazy]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.lazy) {
              img.src = img.dataset.lazy;
              img.removeAttribute('data-lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
    
    // Font Optimization
    if (enableFontOptimization) {
      // Preload critical fonts
      const criticalFonts = [
        'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
      ];
      
      criticalFonts.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = href;
        document.head.appendChild(link);
      });
    }
    
    // Performance monitoring
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Send to analytics if LCP is poor (>2.5s)
        if (lastEntry.startTime > 2500) {
          console.warn('Poor LCP detected:', lastEntry.startTime);
          // You could send this to your analytics service
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported in this browser
      }
      
      // Monitor Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        // Send to analytics if CLS is poor (>0.1)
        if (clsValue > 0.1) {
          console.warn('Poor CLS detected:', clsValue);
          // You could send this to your analytics service
        }
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported in this browser
      }
    }
    
    // Service Worker registration
    if (enableServiceWorker && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }, [enableCriticalResourceHints, enableImageOptimization, enableFontOptimization, enableServiceWorker]);
  
  return (
    <>
      {/* Critical CSS inlining script */}
      <Script
        id="critical-css-optimizer"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Optimize critical CSS loading
            (function() {
              // Add critical CSS classes immediately
              document.documentElement.classList.add('js-enabled');
              
              // Optimize font loading
              if ('fonts' in document) {
                // Prevent FOIT (Flash of Invisible Text)
                document.documentElement.classList.add('fonts-loading');
                
                document.fonts.ready.then(function() {
                  document.documentElement.classList.remove('fonts-loading');
                  document.documentElement.classList.add('fonts-loaded');
                });
              }
              
              // Optimize image loading
              if ('loading' in HTMLImageElement.prototype) {
                // Native lazy loading supported
                document.documentElement.classList.add('native-lazy-loading');
              }
            })();
          `
        }}
      />
      
      {/* Resource hints for critical third-party domains */}
      <Script
        id="resource-hints-optimizer"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Add resource hints for critical domains
            const criticalDomains = [
              'https://fonts.googleapis.com',
              'https://fonts.gstatic.com',
              'https://www.googletagmanager.com',
              'https://va.vercel-scripts.com'
            ];
            
            criticalDomains.forEach(domain => {
              const link = document.createElement('link');
              link.rel = 'dns-prefetch';
              link.href = domain;
              document.head.appendChild(link);
            });
          `
        }}
      />
      
      {/* Performance monitoring script */}
      <Script
        id="performance-monitor"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Monitor Core Web Vitals
            (function() {
              if ('PerformanceObserver' in window) {
                // First Input Delay (FID)
                new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    const fid = entry.processingStart - entry.startTime;
                    if (fid > 100) {
                      console.warn('Poor FID detected:', fid);
                    }
                  }
                }).observe({ entryTypes: ['first-input'] });
                
                // Time to First Byte (TTFB)
                new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.responseStart > 600) {
                      console.warn('Poor TTFB detected:', entry.responseStart);
                    }
                  }
                }).observe({ entryTypes: ['navigation'] });
              }
            })();
          `
        }}
      />
    </>
  );
}
