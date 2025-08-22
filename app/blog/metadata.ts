import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adobe Creative Cloud Blog - Tips, Tutorials & Updates',
  description: '📚 Master Adobe Creative Cloud with expert tutorials, tips & tricks! Plus get exclusive discount offers up to 75% off Adobe subscriptions. Free guides for Photoshop, Illustrator & more!',
  keywords: 'adobe cc blog, creative cloud tutorials, photoshop tips, illustrator guides, adobe cc discount blog',
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: 'Adobe Creative Cloud Blog - Tips, Tutorials & Updates',
    description: '🎨 Master Adobe CC with expert tutorials & tips! Get exclusive 75% off discount offers. Free Photoshop, Illustrator & Premiere Pro guides!',
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
    description: '💡 Master Adobe Creative Cloud with expert tutorials! Get 75% off discount offers & free guides for all CC apps!',
    images: ['https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80'],
  }
}; 