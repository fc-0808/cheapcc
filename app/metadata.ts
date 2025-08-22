import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'CheapCC - #1 Source for Affordable Adobe Creative Cloud',
  description: '🚀 Save 75% on Adobe Creative Cloud! Get instant access to Photoshop, Illustrator, Premiere Pro & all CC apps. Genuine subscriptions, immediate delivery. Join 10,000+ satisfied customers!',
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
    title: 'CheapCC - Save 75% on Adobe Creative Cloud Subscriptions',
    description: '🎨 Get genuine Adobe Creative Cloud for 75% less! Instant access to all CC apps. Trusted by 10,000+ creatives worldwide.',
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
    title: 'CheapCC - Save 75% on Adobe Creative Cloud',
    description: '💡 Genuine Adobe CC subscriptions at 75% off! Instant delivery, all apps included. Join thousands of satisfied creatives!',
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