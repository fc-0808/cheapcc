import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adobe Acrobat Pro Solutions | Professional PDF Tools | CheapCC',
  description: 'Explore Adobe Acrobat Pro offerings from CheapCC: official redemption codes for professional PDF editing and document management. Get genuine Acrobat Pro for less.',
  keywords: [
    'adobe acrobat pro solutions',
    'adobe acrobat pro products',
    'cheap adobe acrobat pro',
    'adobe acrobat pro discount',
    'adobe acrobat pro redemption codes',
    'adobe pdf tools deals',
    'professional pdf editing',
    'document management tools',
    'adobe acrobat pro features',
    'pdf workflow tools'
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
    canonical: '/adobe-acrobat-pro',
  },
  openGraph: {
    title: 'Adobe Acrobat Pro Solutions | Professional PDF Tools | CheapCC',
    description: 'Explore Adobe Acrobat Pro offerings from CheapCC: official redemption codes for professional PDF editing and document management. Get genuine Acrobat Pro for less.',
    url: 'https://cheapcc.net/adobe-acrobat-pro',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Adobe Acrobat Pro Solutions - Professional PDF Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe Acrobat Pro Solutions | Professional PDF Tools | CheapCC',
    description: 'Explore Adobe Acrobat Pro offerings from CheapCC: official redemption codes for professional PDF editing and document management.',
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
  classification: 'Adobe Acrobat Pro, Software, PDF Tools, Document Management, Solutions',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CheapCC - Adobe Acrobat Pro Solutions',
    'application-name': 'CheapCC',
    'msapplication-TileColor': '#ef4444',
    'theme-color': '#ef4444',
  },
};

export default metadata;
