import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adobe Creative Cloud Blog - Tips, Tutorials & Updates',
  description: 'Learn about Adobe Creative Cloud apps, discover tips and tutorials, and stay updated on discounted subscription offers from CheapCC.',
  keywords: 'adobe cc blog, creative cloud tutorials, photoshop tips, illustrator guides, adobe cc discount blog',
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: 'Adobe Creative Cloud Blog - Tips, Tutorials & Updates',
    description: 'Learn about Adobe Creative Cloud apps, discover tips and tutorials, and stay updated on discounted subscription offers from CheapCC.',
    url: '/blog',
    siteName: 'CheapCC',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Adobe Creative Cloud Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe Creative Cloud Blog - Tips, Tutorials & Updates',
    description: 'Learn about Adobe Creative Cloud apps, discover tips and tutorials, and stay updated on discounted subscription offers from CheapCC.',
    images: ['https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80'],
  }
}; 