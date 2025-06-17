import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud',
  description: 'CheapCC offers genuine Adobe Creative Cloud subscriptions for up to 75% off. Get instant delivery for all Adobe apps, including Photoshop, Illustrator, and Premiere Pro.',
  keywords: 'cheapcc, cheapcc adobe, adobe cc discount, buy adobe creative cloud, adobe photoshop cheap, adobe cc cheap',
  metadataBase: new URL('https://cheapcc.online'),
  authors: [
    {
      name: 'CheapCC',
      url: 'https://cheapcc.online',
    }
  ],
  alternates: {
    canonical: 'https://cheapcc.online'
  },
  openGraph: {
    title: 'CheapCC - Affordable Adobe Creative Cloud Subscriptions',
    description: 'CheapCC offers genuine Adobe Creative Cloud subscriptions up to 75% off. All apps included with full functionality.',
    url: 'https://cheapcc.online',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://cheapcc.online/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CheapCC - Adobe CC Discount',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CheapCC - Affordable Adobe Creative Cloud',
    description: 'CheapCC offers genuine Adobe Creative Cloud subscriptions up to 75% off. All apps included with full functionality.',
    creator: '@cheapccofficial',
    images: ['https://cheapcc.online/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with your verification code when ready
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  category: 'Software Subscriptions',
}; 