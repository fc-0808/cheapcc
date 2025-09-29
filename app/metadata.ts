import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'CheapCC - Save 75% on Adobe Creative Cloud | Genuine CC Subscriptions',
  description: '💰 Get genuine Adobe Creative Cloud for 75% LESS than official pricing! All CC apps included: Photoshop, Illustrator, Premiere Pro, After Effects. Instant delivery, 10,000+ satisfied customers.',
  keywords: 'adobe cc pricing, adobe creative cloud cost, adobe subscription, cheapcc, adobe cc discount, adobe alternatives, how much is adobe creative cloud, adobe student discount, cancel adobe subscription',
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
    title: 'Save 75% on Adobe Creative Cloud - CheapCC Alternative',
    description: '💰 Why pay $79.99/month for Adobe CC when you can get it for $14.99? Same apps, same features, 75% less cost. Join 10,000+ creatives who switched to CheapCC.',
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
    title: 'Adobe Creative Cloud for 75% Less - CheapCC',
    description: '💰 Adobe CC: Official $79.99/mo vs CheapCC $14.99/mo. Same Photoshop, Illustrator, Premiere Pro. Why pay more?',
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
    google: 'cheapcc-adobe-alternative-verification-2025', // Add your actual GSC verification code here
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  category: 'Software Subscriptions',
}; 