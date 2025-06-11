import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud Subscriptions',
  description: 'CheapCC offers genuine Adobe Creative Cloud subscriptions for up to 86% off. Get instant delivery for all Adobe apps, including Photoshop, Illustrator, and Premiere Pro.',
  keywords: 'cheapcc, cheapcc adobe, cheapcc creative cloud, cheap adobe creative cloud, adobe cc discount, adobe subscription cheap, cheapcc review',
  metadataBase: new URL('https://cheapcc.online'),
  authors: [
    {
      name: 'CheapCC',
      url: 'https://cheapcc.online',
    }
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud',
    description: 'CheapCC offers genuine Adobe Creative Cloud subscriptions up to 86% off. All apps included with full functionality.',
    url: 'https://cheapcc.online',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CheapCC - Genuine Adobe Creative Cloud Subscriptions at Discount',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud',
    description: 'CheapCC offers genuine Adobe Creative Cloud subscriptions up to 86% off. All apps included with full functionality.',
    creator: '@cheapccofficial',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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