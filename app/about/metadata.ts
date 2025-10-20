import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CheapCC | Adobe Creative Cloud Solutions & Resources',
  description: 'Learn about CheapCC\'s Adobe Creative Cloud solutions, pricing calculator, alternatives, and comparison tools. Your trusted source for affordable Adobe software.',
  keywords: [
    'about cheapcc',
    'adobe creative cloud solutions',
    'adobe pricing calculator',
    'adobe alternatives',
    'adobe comparison tools',
    'cheap adobe software',
    'adobe creative cloud resources',
    'adobe acrobat pro solutions'
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
    canonical: '/about',
  },
  openGraph: {
    title: 'About CheapCC | Adobe Creative Cloud Solutions & Resources',
    description: 'Learn about CheapCC\'s Adobe Creative Cloud solutions, pricing calculator, alternatives, and comparison tools. Your trusted source for affordable Adobe software.',
    url: 'https://cheapcc.net/about',
    siteName: 'CheapCC',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'About CheapCC - Adobe Creative Cloud Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About CheapCC | Adobe Creative Cloud Solutions & Resources',
    description: 'Learn about CheapCC\'s Adobe Creative Cloud solutions, pricing calculator, alternatives, and comparison tools.',
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
};
