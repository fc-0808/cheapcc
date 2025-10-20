import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email-activated Adobe Creative Cloud | Use Your Adobe ID | CheapCC',
  description: 'Activate Adobe Creative Cloud on your existing Adobe ID with email-activation. Maximum savings with full control over your account. Save up to 80% on official Adobe pricing.',
  keywords: [
    'email-activated adobe creative cloud',
    'adobe cc email activation',
    'adobe creative cloud activation',
    'adobe id activation',
    'adobe cc email activation',
    'adobe creative cloud subscription',
    'cheap adobe creative cloud',
    'adobe cc discount',
    'adobe activation service',
    'adobe cc your account'
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
    canonical: '/email-activated-adobe-creative-cloud',
  },
  openGraph: {
    title: 'Email-activated Adobe Creative Cloud | Use Your Adobe ID | CheapCC',
    description: 'Activate Adobe Creative Cloud on your existing Adobe ID with email-activation. Maximum savings with full control over your account.',
    url: 'https://cheapcc.net/email-activated-adobe-creative-cloud',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Email-activated Adobe Creative Cloud - Use Your Adobe ID',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Email-activated Adobe Creative Cloud | Use Your Adobe ID | CheapCC',
    description: 'Activate Adobe Creative Cloud on your existing Adobe ID with email-activation. Maximum savings with full control.',
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
  classification: 'Adobe Creative Cloud, Software, Design Tools, Email-activation',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CheapCC - Email-activated Adobe CC',
    'application-name': 'CheapCC',
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#3b82f6',
  },
};

export default metadata;
