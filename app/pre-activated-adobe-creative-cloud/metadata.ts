import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pre-activated Adobe Creative Cloud Accounts | Quick Access | CheapCC',
  description: 'Get quick access to Adobe Creative Cloud with pre-activated accounts. No setup required - start creating immediately with the complete Adobe CC suite. Save up to 80% on official Adobe pricing.',
  keywords: [
    'pre-activated adobe creative cloud',
    'immediate adobe cc access',
    'adobe creative cloud accounts',
    'ready to use adobe cc',
    'adobe cc fast delivery',
    'pre-configured adobe accounts',
    'adobe creative cloud subscription',
    'cheap adobe creative cloud',
    'adobe cc discount',
    'immediate adobe access'
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
    canonical: '/pre-activated-adobe-creative-cloud',
  },
  openGraph: {
    title: 'Pre-activated Adobe Creative Cloud Accounts | Quick Access | CheapCC',
    description: 'Get quick access to Adobe Creative Cloud with pre-activated accounts. No setup required - start creating immediately with the complete Adobe CC suite.',
    url: 'https://cheapcc.net/pre-activated-adobe-creative-cloud',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Pre-activated Adobe Creative Cloud Accounts - Quick Access',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pre-activated Adobe Creative Cloud Accounts | Quick Access | CheapCC',
    description: 'Get quick access to Adobe Creative Cloud with pre-activated accounts. No setup required - start creating immediately.',
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
  classification: 'Adobe Creative Cloud, Software, Design Tools',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CheapCC - Pre-activated Adobe CC',
    'application-name': 'CheapCC',
    'msapplication-TileColor': '#ff33ff',
    'theme-color': '#ff33ff',
  },
};

export default metadata;
