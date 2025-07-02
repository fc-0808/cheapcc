import { getPostData } from '@/lib/blog';
import { Metadata } from 'next';
import ClientPost from './client-post';

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
  const paths = await import('@/lib/blog').then(mod => mod.getAllPostSlugs());
  
  // The .map() function below is the crucial fix. 
  // It transforms the data into the simple format Next.js needs: [{ slug: '...' }]
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);
  return <ClientPost postData={postData} />;
}