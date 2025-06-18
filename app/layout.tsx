import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';

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
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="keywords" content="cheapcc, cheapcc review, cheapcc adobe, adobe cc discount, cheapcc login" />
        {/* Preconnect to PayPal domains to improve loading performance */}
        <link rel="preconnect" href="https://www.paypal.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.sandbox.paypal.com" crossOrigin="anonymous" />
        {/* Font Awesome for icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <Script
          id="gtm-head-script"
          strategy="afterInteractive"
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
      <body className="font-sans antialiased bg-white text-[#171717]">
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-M6P65BTX"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* Schema.org structured data for organization */}
        <Script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
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
        `}} />
        {/* Schema.org structured data for website */}
        <Script id="website-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
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
        `}} />
        {/* Header */}
        <Header />
        <Suspense fallback={<Loading />}>
          {/* Main Content */}
          <main className="cheapcc-main-content">
            {children}
          </main>
        </Suspense>
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
