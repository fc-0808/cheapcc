import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    template: '%s | CheapCC - Affordable Adobe CC Subscriptions',
    default: 'CheapCC - Affordable Adobe Creative Cloud Subscriptions',
  },
  description: "Get genuine Adobe Creative Cloud subscriptions for up to 86% off. Instant delivery for all Adobe apps, including Photoshop, Illustrator, and Premiere Pro.",
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
        {/* Preconnect to PayPal domains to improve loading performance */}
        <link rel="preconnect" href="https://www.paypal.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.sandbox.paypal.com" crossOrigin="anonymous" />
        {/* Font Awesome for icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className={`${inter.variable} antialiased bg-white text-[#171717]`}>
        {/* Schema.org structured data for organization */}
        <Script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CheapCC",
            "url": "https://cheapcc.online",
            "logo": "https://cheapcc.online/favicon.svg",
            "description": "Provider of affordable Adobe Creative Cloud subscriptions",
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "support@cheapcc.online",
              "contactType": "customer support"
            }
          }
        `}} />
        {/* Schema.org structured data for website */}
        <Script id="website-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://cheapcc.online",
            "name": "CheapCC - Affordable Adobe Creative Cloud Subscriptions",
            "description": "Get genuine Adobe Creative Cloud subscriptions for up to 86% off.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://cheapcc.online/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        `}} />
        {/* Header - always logged out state for server component */}
        <Header />
        {/* Main Content */}
        {children}
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
