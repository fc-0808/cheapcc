import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { Suspense } from 'react';
import Loading from './loading';
import UnifiedBackground from "@/components/UnifiedBackground";
import VisitorTracker from '@/components/VisitorTracker';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="keywords" content="cheapcc, cheapcc review, cheapcc adobe, adobe cc discount, cheapcc login" />
        
        {/* Performance Optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0f111a" />
        
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
          {/* Main Content */}
          <main className="cheapcc-main-content">
            {children}
          </main>
        </Suspense>
        {/* Footer rendered after main content */}
        <Footer />
        
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
        
        {/* Track visitor data */}
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
      </body>
    </html>
  );
}
