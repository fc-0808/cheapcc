import { getPostData } from '@/lib/blog';
import { Metadata } from 'next';
import ClientPost from './client-post';
import Script from 'next/script';

// Generate metadata for each blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Await params before using it
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const postData = await getPostData(slug);
  
  return {
    title: `${postData.title} - Adobe CC Blog`,
    description: postData.excerpt,
    keywords: `adobe creative cloud, ${postData.title.toLowerCase()}, adobe cc tutorials`,
    alternates: {
      canonical: `/blog/${slug}`
    },
    openGraph: {
      title: postData.title,
      description: postData.excerpt,
      url: `/blog/${slug}`,
      siteName: 'CheapCC',
      locale: 'en_US',
      type: 'article',
      publishedTime: postData.date,
      images: [
        {
          url: postData.featuredImage || '/og-image.svg',
          width: 1200,
          height: 630,
          alt: postData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title,
      description: postData.excerpt,
      images: [postData.featuredImage || '/twitter-image.svg'],
    }
  };
}

// This function now correctly handles the nested params from getAllPostSlugs()
// and transforms the data into the simple structure Next.js requires.
export async function generateStaticParams() {
  const paths = await import('@/lib/blog').then(mod => mod.getAllPostSlugs());
  
  // The .map() function below is the crucial fix. 
  // It transforms the data into the simple format Next.js needs: [{ slug: '...' }]
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.slug);
  
  // Generate Article schema for the blog post
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": postData.title,
    "description": postData.excerpt,
    "image": postData.featuredImage || "https://cheapcc.online/og-image.svg",
    "author": {
      "@type": "Organization",
      "name": "CheapCC",
      "url": "https://cheapcc.online"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CheapCC",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cheapcc.online/favicon.svg"
      }
    },
    "datePublished": postData.date,
    "dateModified": postData.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cheapcc.online/blog/${resolvedParams.slug}`
    },
    "wordCount": postData.wordCount,
    "timeRequired": `PT${postData.readingTime}M`,
    "articleSection": "Adobe Creative Cloud",
    "keywords": `adobe creative cloud, ${postData.title.toLowerCase()}, adobe cc tutorials, cheapcc`
  };

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://cheapcc.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://cheapcc.online/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": postData.title,
        "item": `https://cheapcc.online/blog/${resolvedParams.slug}`
      }
    ]
  };

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ClientPost postData={postData} />
    </>
  );
}