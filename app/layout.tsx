import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { Suspense } from 'react';
import Loading from './loading';
import UnifiedBackground from "@/components/UnifiedBackground";
import { getFontVariables } from './fonts';
import SWRProvider from '@/components/SWRProvider';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: {
    template: '%s | CheapCC - Affordable Adobe CC Subscriptions',
    default: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud',
  },
  description: "CheapCC offers genuine Adobe Creative Cloud subscriptions for up to 75% off. Instant delivery for all Adobe apps.",
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
        
        {/* Microsoft Tile Color */}
        <meta name="msapplication-TileColor" content="#2c2d5a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#2c2d5a" />
        
        <meta name="keywords" content="cheapcc, cheapcc review, cheapcc adobe, adobe cc discount, cheapcc login" />
        
        {/* Performance Optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#2c2d5a" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Resource Hints - Preconnect to critical domains */}
        <link rel="preconnect" href="https://www.paypal.com" />
        <link rel="preconnect" href="https://www.sandbox.paypal.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
        
        {/* Font Awesome - with optimized loading */}
        <link 
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          as="style"
          crossOrigin="anonymous"
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
        <UnifiedBackground />
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
              "description": "CheapCC - Provider of affordable Adobe Creative Cloud subscriptions",
              "slogan": "Affordable Adobe Creative Cloud for Everyone",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@cheapcc.online",
                "contactType": "customer support"
              },
              "sameAs": [
                "https://twitter.com/cheapccofficial",
                "https://facebook.com/cheapccofficial",
                "https://instagram.com/cheapccofficial"
              ]
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
        
        {/* Critical content rendered first */}
        <Header />
        <Suspense fallback={<Loading />}>
          <SWRProvider>
          {/* Main Content */}
          <main className="cheapcc-main-content">
            {children}
          </main>
          </SWRProvider>
        </Suspense>
        {/* Footer rendered after main content */}
        <Footer />
        
        {/* Vercel Analytics */}
        <Analytics />
        
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
