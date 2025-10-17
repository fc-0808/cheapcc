import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adobe Creative Cloud Redemption Codes | Official Codes | CheapCC',
  description: 'Get official Adobe Creative Cloud redemption codes to activate on your existing Adobe account. Redeem at redeem.adobe.com with complete Creative Cloud suite access. Save up to 80% on Adobe pricing.',
  keywords: [
    'adobe creative cloud redemption codes',
    'adobe cc redemption codes',
    'adobe creative cloud codes',
    'adobe redemption codes',
    'redeem adobe creative cloud',
    'adobe cc gift codes',
    'adobe creative cloud subscription codes',
    'cheap adobe creative cloud',
    'adobe cc discount codes',
    'adobe official codes'
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
    canonical: '/adobe-creative-cloud-redemption-codes',
  },
  openGraph: {
    title: 'Adobe Creative Cloud Redemption Codes | Official Codes | CheapCC',
    description: 'Get official Adobe Creative Cloud redemption codes to activate on your existing Adobe account. Redeem at redeem.adobe.com with complete Creative Cloud suite access.',
    url: 'https://cheapcc.net/adobe-creative-cloud-redemption-codes',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Adobe Creative Cloud Redemption Codes - Official Codes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe Creative Cloud Redemption Codes | Official Codes | CheapCC',
    description: 'Get official Adobe Creative Cloud redemption codes to activate on your existing Adobe account. Redeem at redeem.adobe.com.',
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
  classification: 'Adobe Creative Cloud, Software, Design Tools, Redemption Codes',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CheapCC - Adobe CC Redemption Codes',
    'application-name': 'CheapCC',
    'msapplication-TileColor': '#10b981',
    'theme-color': '#10b981',
  },
};

export default metadata;
