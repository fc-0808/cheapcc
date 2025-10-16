import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'CheapCC - Adobe Creative Cloud Discount | 83% Off Official Pricing',
  description: '🎯 CheapCC: Get genuine Adobe Creative Cloud for 83% less than official pricing! All CC apps included: Photoshop, Illustrator, Premiere Pro, After Effects. Instant delivery, 500+ satisfied customers worldwide.',
  keywords: 'cheapcc, cheapcc adobe, adobe creative cloud discount, cheap adobe cc, adobe cc alternative, adobe subscription discount, photoshop discount, illustrator discount, premiere pro discount, adobe cc pricing, adobe creative cloud cost, how much is adobe creative cloud, cancel adobe subscription, adobe student discount',
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
    title: 'CheapCC - Adobe Creative Cloud Discount | 83% Off Official Pricing',
    description: '🎯 CheapCC: Why pay $79.99/month for Adobe CC when you can get it for $14.99? Same apps, same features, 83% less cost. Join 500+ creatives who switched to CheapCC.',
    url: 'https://cheapcc.online',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://cheapcc.online/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'CheapCC - Adobe CC Discount',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CheapCC - Adobe Creative Cloud Discount | 83% Off',
    description: '🎯 CheapCC: Adobe CC Official $79.99/mo vs CheapCC $14.99/mo. Same Photoshop, Illustrator, Premiere Pro. Why pay more?',
    creator: '@cheapccofficial',
    images: ['https://cheapcc.online/twitter-image.svg'],
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