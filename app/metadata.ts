import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CheapCC - Affordable Adobe Creative Cloud Subscriptions',
  description: 'Get genuine Adobe Creative Cloud subscriptions up to 86% off. Includes all Adobe apps like Photoshop, Illustrator, Premiere Pro with full functionality and updates.',
  keywords: 'cheap adobe creative cloud, adobe cc discount, adobe subscription cheap, affordable creative cloud, buy adobe cc, creative cloud all apps, adobe cc sale',
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
    title: 'CheapCC - Affordable Adobe Creative Cloud Subscriptions',
    description: 'Get genuine Adobe Creative Cloud subscriptions up to 86% off. All apps included with full functionality.',
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
    title: 'CheapCC - Affordable Adobe Creative Cloud Subscriptions',
    description: 'Get genuine Adobe Creative Cloud subscriptions up to 86% off. All apps included with full functionality.',
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