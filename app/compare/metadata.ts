import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Adobe Solutions | Pre-activated vs Self-activation vs Redemption Codes | CheapCC',
  description: 'Compare all Adobe Creative Cloud and Acrobat Pro solutions from CheapCC. Find the perfect option for your needs with detailed feature comparisons, pros/cons, and recommendations.',
  keywords: [
    'compare adobe solutions',
    'adobe creative cloud comparison',
    'pre-activated vs self-activation',
    'adobe redemption codes vs accounts',
    'adobe cc options comparison',
    'cheap adobe creative cloud',
    'adobe acrobat pro comparison',
    'adobe solutions guide',
    'adobe cc features comparison',
    'best adobe option'
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
    canonical: '/compare',
  },
  openGraph: {
    title: 'Compare Adobe Solutions | Pre-activated vs Self-activation vs Redemption Codes | CheapCC',
    description: 'Compare all Adobe Creative Cloud and Acrobat Pro solutions from CheapCC. Find the perfect option for your needs with detailed feature comparisons.',
    url: 'https://cheapcc.net/compare',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Compare Adobe Solutions - Feature Comparison',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Adobe Solutions | CheapCC',
    description: 'Compare all Adobe Creative Cloud and Acrobat Pro solutions from CheapCC. Find the perfect option for your needs.',
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
  classification: 'Adobe Creative Cloud, Software, Design Tools, Comparison, Solutions',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CheapCC - Compare Adobe Solutions',
    'application-name': 'CheapCC',
    'msapplication-TileColor': '#ff33ff',
    'theme-color': '#ff33ff',
  },
};

export default metadata;
