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
              <Link href="/blog" prefetch={false} className="inline-flex items-center text-[#ff3366] hover:text-[#2c2d5a] mb-6 transition-colors">
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
              
              {/* Pricing CTA Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-br from-white via-[#f9f9fb] to-[#f0f2f5] rounded-xl p-8 shadow-sm relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ff336610] rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#2c2d5a10] rounded-full blur-3xl"></div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                      <span className="inline-block px-3 py-1 bg-[#ff336615] text-[#ff3366] text-xs font-semibold rounded-full mb-3">EXCLUSIVE OFFER</span>
                      <h3 className="text-2xl font-bold text-[#2c2d5a] mb-3">Ready to save on Adobe Creative Cloud?</h3>
                      <p className="text-gray-600 mb-4 sm:mb-0 max-w-md">Get the complete Adobe suite with all premium features for up to <span className="font-semibold text-[#2c2d5a]">75% off</span> official prices</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Link 
                        href="/#pricing" 
                        prefetch={false}
                        className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-[#ff3366] to-[#ff6b8b] text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 border border-[#ff336620] relative overflow-hidden group"
                      >
                        <span className="relative z-10">View Pricing Plans</span>
                        <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                        <span className="absolute inset-0 bg-gradient-to-r from-[#ff4f7b] to-[#ff3366] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </Link>
                      <div className="mt-3 text-center text-xs text-gray-500">No credit card required to view plans</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}