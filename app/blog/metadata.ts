import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adobe Creative Cloud Blog - Tips & Tutorials',
  description: 'Learn about Adobe Creative Cloud apps, discover tips and tutorials, and stay updated on discounted subscription offers from CheapCC.',
  keywords: 'adobe cc blog, creative cloud tutorials, photoshop tips, illustrator guides, adobe cc discount blog',
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: 'Adobe Creative Cloud Blog - Tips & Tutorials',
    description: 'Learn about Adobe Creative Cloud apps, discover tips and tutorials, and stay updated on discounted subscription offers.',
    url: 'https://cheapcc.online/blog',
    type: 'website',
    images: [
      {
        url: 'https://cheapcc.online/blog-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CheapCC Adobe Creative Cloud Blog'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adobe Creative Cloud Blog - Tips & Tutorials',
    description: 'Learn about Adobe Creative Cloud apps, discover tips and tutorials, and stay updated on discounted subscription offers.',
    images: ['https://cheapcc.online/blog-image.jpg']
  }
}; 