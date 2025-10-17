import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adobe Acrobat Pro Redemption Codes | Professional PDF Tools | CheapCC',
  description: 'Get official Adobe Acrobat Pro redemption codes for professional PDF editing and document management. Redeem at redeem.adobe.com with complete Acrobat Pro suite access. Save up to 80% on Adobe pricing.',
  keywords: [
    'adobe acrobat pro redemption codes',
    'acrobat pro redemption codes',
    'adobe acrobat pro codes',
    'acrobat pro codes',
    'adobe acrobat redemption codes',
    'redeem adobe acrobat pro',
    'acrobat pro subscription codes',
    'cheap adobe acrobat pro',
    'acrobat pro discount codes',
    'adobe official acrobat codes'
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
    canonical: '/adobe-acrobat-pro-redemption-codes',
  },
  openGraph: {
    title: 'Adobe Acrobat Pro Redemption Codes | Professional PDF Tools | CheapCC',
    description: 'Get official Adobe Acrobat Pro redemption codes for professional PDF editing and document management. Redeem at redeem.adobe.com with complete Acrobat Pro suite access.',
    url: 'https://cheapcc.net/adobe-acrobat-pro-redemption-codes',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Adobe Acrobat Pro Redemption Codes - Professional PDF Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe Acrobat Pro Redemption Codes | Professional PDF Tools | CheapCC',
    description: 'Get official Adobe Acrobat Pro redemption codes for professional PDF editing and document management. Redeem at redeem.adobe.com.',
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
  classification: 'Adobe Acrobat Pro, Software, PDF Tools, Document Management, Redemption Codes',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CheapCC - Adobe Acrobat Pro Codes',
    'application-name': 'CheapCC',
    'msapplication-TileColor': '#ef4444',
    'theme-color': '#ef4444',
  },
};

export default metadata;
