import { getSortedPostsData } from '@/lib/blog';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const posts = getSortedPostsData();
    
    const rssItems = posts.map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const imageTag = post.featuredImage 
        ? `<enclosure url="${post.featuredImage}" type="image/jpeg"/>`
        : '';
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>https://cheapcc.online/blog/${post.slug}</link>
      <guid isPermaLink="true">https://cheapcc.online/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      ${imageTag}
      <category>Adobe Creative Cloud</category>
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CheapCC Blog - Adobe Creative Cloud Tips &amp; Savings</title>
    <description>Latest updates on Adobe CC alternatives, productivity tips, pricing guides, and creative professional insights</description>
    <link>https://cheapcc.online</link>
    <atom:link href="https://cheapcc.online/api/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>https://cheapcc.online/og-image.svg</url>
      <title>CheapCC - Save on Adobe Creative Cloud</title>
      <link>https://cheapcc.online</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}

