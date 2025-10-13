import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Suspense } from 'react';
import { getFontVariables } from './fonts';
import ClientSWRProvider from '@/components/ClientSWRProvider';
import { Analytics } from '@vercel/analytics/next';
import ClientHeader from '@/components/ClientHeader';
import ClientFooter from '@/components/ClientFooter';
import ClientUnifiedBackground from '@/components/ClientUnifiedBackground';
import ClientTawkToChat from '@/components/ClientTawkToChat';
import ClientSEOOptimizer from '@/components/ClientSEOOptimizer';
import ClientLoading from '@/components/ClientLoading';
import EnhancedAnalytics from '@/components/EnhancedAnalytics';
import { InternationalizationProvider } from '@/contexts/InternationalizationContext';

export const metadata: Metadata = {
  title: {
    template: '%s | CheapCC - Affordable Adobe CC Subscriptions',
    default: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud',
  },
  description: "CheapCC offers genuine Adobe Creative Cloud subscriptions for up to 83% off. Instant delivery for all Adobe apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={getFontVariables()}>
      <head>
        {/* Primary Favicon - SVG for modern browsers */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        
        {/* Alternative Favicon - ICO for IE and older browsers */}
        <link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Standard Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Safari Pinned Tab Icon */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2c2d5a" />
        
        {/* PayPal Client ID Runtime Injection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.PAYPAL_CLIENT_ID = 'AdnhpzgXSmFsoZv7VDuwS9wJo8czKZy6hBPFMqFuRpgglopk5bT-_tQLsM4hwiHtt_MZOB7Fup4MNTWe';
              console.log('🔧 PayPal Client ID injected at runtime:', window.PAYPAL_CLIENT_ID);
            `,
          }}
        />
        
        {/* Microsoft Tile Color */}
        <meta name="msapplication-TileColor" content="#2c2d5a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#2c2d5a" />
        
        <meta name="keywords" content="cheapcc, cheapcc adobe, adobe creative cloud discount, cheap adobe cc, adobe cc alternative, adobe subscription discount, photoshop discount, illustrator discount, premiere pro discount, cheapcc review, cheapcc login" />
        
        {/* Performance Optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#2c2d5a" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Resource Hints - Preconnect to critical domains */}
        <link rel="preconnect" href="https://www.paypal.com" />
        <link rel="preconnect" href="https://www.sandbox.paypal.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Tawk.to Resource Hints */}
        <link rel="preconnect" href="https://embed.tawk.to" />
        <link rel="dns-prefetch" href="https://tawk.to" />
        <link rel="dns-prefetch" href="https://va.tawk.to" />
        
        {/* Global error handler for Tawk.to */}
        <Script id="tawk-global-error-handler" strategy="beforeInteractive">
          {`
            window.addEventListener('error', function(event) {
              // Check if error is from Tawk.to scripts
              if (event.filename && event.filename.includes('tawk.to')) {
                console.warn('Tawk.to error handled globally:', {
                  message: event.message,
                  filename: event.filename,
                  lineno: event.lineno,
                  colno: event.colno
                });
                // Prevent error from bubbling up and breaking the page
                event.preventDefault();
                return true;
              }
            });
            
            // Handle unhandled promise rejections from Tawk.to
            window.addEventListener('unhandledrejection', function(event) {
              if (event.reason && event.reason.toString().includes('tawk.to')) {
                console.warn('Tawk.to promise rejection handled globally:', event.reason);
                event.preventDefault();
                return true;
              }
            });
          `}
        </Script>
        
        {/* Preload critical assets */}
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
        
        {/* Font Awesome - with optimized loading */}
        <link 
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          as="style"
          crossOrigin="anonymous"
          integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw=="
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" 
          integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" 
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          id="font-awesome-css"
        />
        
        {/* Google Tag Manager - using lazyOnload strategy for non-critical scripts */}
        <Script
          id="gtm-head-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-M6P65BTX');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-[#171717] relative">
        <ClientUnifiedBackground />
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-M6P65BTX"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        {/* Schema.org structured data for organization - deferred loading */}
        <Script 
          id="organization-schema" 
          type="application/ld+json" 
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "CheapCC",
              "url": "https://cheapcc.online",
              "logo": "https://cheapcc.online/favicon.svg",
              "description": "CheapCC - Adobe Creative Cloud discount provider offering genuine CC subscriptions at 83% off official pricing",
              "slogan": "Affordable Adobe Creative Cloud for Everyone",
              "foundingDate": "2023",
              "numberOfEmployees": "10-50",
              "knowsAbout": [
                "Adobe Creative Cloud Discount",
                "Adobe CC Alternative",
                "Photoshop Discount",
                "Illustrator Discount",
                "Premiere Pro Discount",
                "Adobe Subscription Discount",
                "Creative Software Licensing"
              ],
              "serviceArea": {
                "@type": "GeoShape",
                "addressCountry": ["US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL", "SE", "NO", "DK"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US",
                "addressRegion": "Global",
                "addressLocality": "Online"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "40.7128",
                "longitude": "-74.0060"
              },
              "areaServed": [
                {
                  "@type": "Country",
                  "name": "United States"
                },
                {
                  "@type": "Country", 
                  "name": "Canada"
                },
                {
                  "@type": "Country",
                  "name": "United Kingdom"
                },
                {
                  "@type": "Country",
                  "name": "Australia"
                }
              ],
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "email": "support@cheapcc.online",
                  "contactType": "customer support",
                  "availableLanguage": ["English"],
                  "hoursAvailable": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "opens": "09:00",
                    "closes": "17:00",
                    "timeZone": "UTC"
                  }
                },
                {
                  "@type": "ContactPoint",
                  "email": "sales@cheapcc.online",
                  "contactType": "sales",
                  "availableLanguage": ["English"]
                }
              ],
              "sameAs": [
                "https://twitter.com/cheapccofficial",
                "https://facebook.com/cheapccofficial",
                "https://instagram.com/cheapccofficial",
                "https://www.youtube.com/@cheapcc-online"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1247",
                "bestRating": "5",
                "worstRating": "1"
              }
            }
          `}} 
        />
        
        {/* Schema.org structured data for website - deferred loading */}
        <Script 
          id="website-schema" 
          type="application/ld+json"
          strategy="afterInteractive" 
          dangerouslySetInnerHTML={{ __html: `
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://cheapcc.online",
              "name": "CheapCC - Affordable Adobe Creative Cloud",
              "description": "CheapCC offers genuine Adobe Creative Cloud subscriptions for up to 75% off.",
              "keywords": "cheapcc, cheapcc adobe, cheap creative cloud, adobe cc discount",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://cheapcc.online/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}} 
        />
        
        {/* Advanced Product Schema for Adobe CC Subscriptions */}
        <Script 
          id="product-schema" 
          type="application/ld+json"
          strategy="afterInteractive" 
          dangerouslySetInnerHTML={{ __html: `
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Adobe Creative Cloud Discount - CheapCC Alternative",
              "description": "CheapCC: Genuine Adobe Creative Cloud subscriptions at 83% off official pricing. Adobe CC alternative with all apps: Photoshop, Illustrator, Premiere Pro, After Effects.",
              "brand": {
                "@type": "Brand",
                "name": "CheapCC"
              },
              "category": "Software Subscription",
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "14.99",
                "highPrice": "89.99",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2025-12-31",
                "offerCount": "4",
                "offers": [
                  {
                    "@type": "Offer",
                    "name": "1 Month Adobe CC",
                    "price": "19.99",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  },
                  {
                    "@type": "Offer",
                    "name": "3 Months Adobe CC",
                    "price": "39.99",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  },
                  {
                    "@type": "Offer",
                    "name": "6 Months Adobe CC",
                    "price": "69.99",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  },
                  {
                    "@type": "Offer",
                    "name": "12 Months Adobe CC",
                    "price": "89.99",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1247",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Sarah Johnson"
                  },
                  "reviewBody": "CheapCC saved me over $600 in my first year. Same Adobe CC apps I was using before, just way cheaper!"
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Mike Rodriguez"
                  },
                  "reviewBody": "As a freelancer, every dollar counts. CheapCC lets me use professional tools without breaking the bank."
                }
              ],
              "additionalProperty": [
                {
                  "@type": "PropertyValue",
                  "name": "Apps Included",
                  "value": "20+ Adobe Creative Cloud Applications"
                },
                {
                  "@type": "PropertyValue",
                  "name": "Cloud Storage",
                  "value": "100GB"
                },
                {
                  "@type": "PropertyValue",
                  "name": "AI Features",
                  "value": "Adobe Firefly Included"
                }
              ]
            }
          `}} 
        />
        
        {/* Wrap everything in InternationalizationProvider */}
        <InternationalizationProvider>
          {/* Critical content rendered first */}
          <ClientHeader />
          <Suspense fallback={<ClientLoading />}>
            <ClientSWRProvider>
            {/* Main Content */}
            <main className="cheapcc-main-content">
              {children}
            </main>
            </ClientSWRProvider>
          </Suspense>
          {/* Footer rendered after main content */}
          <ClientFooter />
        </InternationalizationProvider>
        
        {/* Vercel Analytics */}
        <Analytics />
        
        {/* Enhanced Analytics - Professional tracking */}
        <EnhancedAnalytics />
        
        {/* SEO Performance Optimizer - Client-side only */}
        <ClientSEOOptimizer />
        
        {/* Tawk.to Chat Widget - Client-side only */}
        <ClientTawkToChat />
        
        {/* Font loading and CSS optimization */}
        <Script id="font-and-css-optimization" strategy="afterInteractive">
          {`
            // Font loading optimization
            if ("fonts" in document) {
              document.fonts.addEventListener('loadingdone', () => {
                document.documentElement.classList.add('fonts-loaded');
              });
              
              // This tells the browser these fonts are important
              Promise.all([
                document.fonts.load("1em Inter"),
                document.fonts.load("1em Segoe UI"),
              ]).then(() => {
                document.documentElement.classList.add('fonts-loaded');
              });
            }
            
            // Optimize Font Awesome loading
            (function() {
              // Force Font Awesome loading class on HTML element
              document.documentElement.classList.add('fa-loading');
              
              const fontAwesomeLink = document.querySelector('#font-awesome-css');
              if (fontAwesomeLink) {
                // Add a load event listener to the link element
                fontAwesomeLink.addEventListener('load', function() {
                  document.documentElement.classList.add('fa-loaded');
                  document.documentElement.classList.remove('fa-loading');
                  console.log('Font Awesome loaded successfully');
                });
                
                // Add error handling
                fontAwesomeLink.addEventListener('error', function(error) {
                  console.error('Error loading Font Awesome:', error);
                  // Try to reload with a different CDN as fallback
                  const fallbackLink = document.createElement('link');
                  fallbackLink.rel = 'stylesheet';
                  fallbackLink.href = 'https://use.fontawesome.com/releases/v6.5.0/css/all.css';
                  fallbackLink.crossOrigin = 'anonymous';
                  fallbackLink.id = 'font-awesome-fallback';
                  
                  fallbackLink.addEventListener('load', function() {
                    document.documentElement.classList.add('fa-loaded');
                    document.documentElement.classList.remove('fa-loading');
                  });
                  
                  document.head.appendChild(fallbackLink);
                });
              }
              
              // Add immediate font awesome check
              setTimeout(function() {
                if (!document.documentElement.classList.contains('fa-loaded')) {
                  document.documentElement.classList.add('fa-loaded');
                }
              }, 1000);
            })();
          `}
        </Script>
        
        {/* Add a fallback script to ensure Font Awesome is loaded */}
        <Script id="font-awesome-fallback" strategy="lazyOnload">
          {`
            // Check if Font Awesome icons are loaded after 2 seconds
            setTimeout(function() {
              const testIcon = document.createElement('i');
              testIcon.className = 'fas fa-users';
              testIcon.style.display = 'none';
              document.body.appendChild(testIcon);
              
              const computedStyle = window.getComputedStyle(testIcon);
              const isIconLoaded = computedStyle.fontFamily.includes('Font Awesome') || 
                                  computedStyle.fontFamily.includes('FontAwesome');
              
              if (!isIconLoaded) {
                console.log('Font Awesome not loaded properly, adding fallback');
                if (!document.getElementById('font-awesome-fallback')) {
                  const fallbackLink = document.createElement('link');
                  fallbackLink.id = 'font-awesome-fallback';
                  fallbackLink.rel = 'stylesheet';
                  fallbackLink.href = 'https://use.fontawesome.com/releases/v6.5.0/css/all.css';
                  fallbackLink.crossOrigin = 'anonymous';
                  document.head.appendChild(fallbackLink);
                  
                  fallbackLink.addEventListener('load', function() {
                    document.documentElement.classList.add('fa-loaded');
                    document.documentElement.classList.remove('fa-loading');
                  });
                }
                
                // Force the fa-loaded class if we still don't have it
                if (!document.documentElement.classList.contains('fa-loaded')) {
                  document.documentElement.classList.add('fa-loaded');
                }
              }
              
              document.body.removeChild(testIcon);
            }, 2000);
          `}
        </Script>
      </body>
    </html>
  );
}
