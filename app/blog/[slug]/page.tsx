import { getPostData, getAllPostSlugs } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { format } from 'date-fns';
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
          url: postData.featuredImage || '/og-image.jpg',
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
      images: [postData.featuredImage || '/twitter-image.jpg'],
    }
  };
}

// This function now correctly handles the nested params from getAllPostSlugs()
// and transforms the data into the simple structure Next.js requires.
export async function generateStaticParams() {
  const paths = getAllPostSlugs(); // This gets data in the format: [{ params: { slug: '...' } }]
  
  // The .map() function below is the crucial fix. 
  // It transforms the data into the simple format Next.js needs: [{ slug: '...' }]
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  // Await params before using it
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const postData = await getPostData(slug);
  const formattedDate = format(new Date(postData.date), 'MMMM d, yyyy');
  
  // Create ArticleLD JSON schema for the blog post
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postData.title,
    "description": postData.excerpt,
    "image": postData.featuredImage || "https://cheapcc.online/og-image.jpg",
    "author": { "@type": "Organization", "name": "CheapCC" },
    "publisher": {
      "@type": "Organization", "name": "CheapCC",
      "logo": { "@type": "ImageObject", "url": "https://cheapcc.online/favicon.svg" }
    },
    "datePublished": postData.date,
    "dateModified": postData.date,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://cheapcc.online/blog/${slug}` }
  };
  
  // Create BreadcrumbList schema
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
        "item": `https://cheapcc.online/blog/${slug}`
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
      <main className="bg-[#f8f9fa] min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            {postData.featuredImage && (
              <div className="relative h-64 sm:h-96 w-full">
                <Image
                  src={postData.featuredImage}
                  alt={postData.title}
                  priority
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <Link href="/blog" className="inline-flex items-center text-[#ff3366] hover:text-[#2c2d5a] mb-6 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Blog
              </Link>
              <div className="mb-2 text-gray-500 text-sm font-medium">
                <time dateTime={postData.date}>{formattedDate}</time>
                {postData.readingTime && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{postData.readingTime} min read</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#2c2d5a] mb-4">
                {postData.title}
              </h1>
              <div 
                className="prose prose-lg max-w-none prose-headings:text-[#2c2d5a] prose-a:text-[#ff3366] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-hr:border-gray-200"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
              />
            </div>
          </article>
        </div>
      </main>
    </>
  );
}