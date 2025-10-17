import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adobe Creative Cloud Solutions | Pre-activated, Self-activation & Redemption Codes | CheapCC',
  description: 'Explore all Adobe Creative Cloud offerings from CheapCC: pre-activated accounts, self-activated subscriptions, and official redemption codes. Compare options and get genuine Adobe CC for less.',
  keywords: [
    'adobe creative cloud solutions',
    'adobe cc products',
    'cheap adobe creative cloud',
    'adobe creative cloud discount',
    'pre-activated adobe cc',
    'self-activated adobe cc',
    'adobe creative cloud redemption codes',
    'adobe creative suite deals',
    'adobe cc comparison',
    'adobe creative cloud options'
  ],
  authors: [{ name: 'CheapCC Team' }],
  creator: 'CheapCC',
  publisher: 'CheapCC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cheapcc.net'),
  alternates: {
    canonical: '/adobe-creative-cloud',
  },
  openGraph: {
    title: 'Adobe Creative Cloud Solutions | Pre-activated, Self-activation & Redemption Codes | CheapCC',
    description: 'Explore all Adobe Creative Cloud offerings from CheapCC: pre-activated accounts, self-activated subscriptions, and official redemption codes. Compare options and get genuine Adobe CC for less.',
    url: 'https://cheapcc.net/adobe-creative-cloud',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Adobe Creative Cloud Solutions - All Options',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe Creative Cloud Solutions | CheapCC',
    description: 'Explore all Adobe Creative Cloud offerings from CheapCC: pre-activated accounts, self-activated subscriptions, and official redemption codes.',
    images: ['/twitter-image.svg'],
    creator: '@cheapcc',
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'technology',
  classification: 'Adobe Creative Cloud, Software, Design Tools, Solutions',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CheapCC - Adobe Creative Cloud Solutions',
    'application-name': 'CheapCC',
    'msapplication-TileColor': '#ff33ff',
    'theme-color': '#ff33ff',
  },
};

export default metadata;
