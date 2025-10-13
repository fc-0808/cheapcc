import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cheapcc.online';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/success/',
          '/api/',
          '/auth/',
          '/private/',
          '/admin/',
          '/profile/',
          '/_next/',
          '/logout',
          '/update-password'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/success/',
          '/api/',
          '/auth/',
          '/private/',
          '/admin/',
          '/profile/',
          '/logout',
          '/update-password'
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/success/',
          '/api/',
          '/auth/',
          '/private/',
          '/admin/',
          '/profile/',
          '/logout',
          '/update-password'
        ],
        crawlDelay: 2,
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
} 