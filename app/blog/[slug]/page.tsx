import { getPostData, getAllPostSlugs } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { format } from 'date-fns';

// Generate metadata for each blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const postData = await getPostData(params.slug);
  
  return {
    title: `${postData.title} - Adobe CC Blog`,
    description: postData.excerpt || `Read about ${postData.title} on the CheapCC blog`,
    keywords: `adobe creative cloud, ${postData.title.toLowerCase()}, adobe cc tutorials`,
    alternates: {
      canonical: `/blog/${params.slug}`
    }
  };
}

// This function generates all the possible blog post paths at build time
export async function generateStaticParams() {
  const posts = getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.params.slug,
  }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);
  const formattedDate = format(new Date(postData.date), 'MMMM d, yyyy');
  
  return (
    <main className="bg-[#f8f9fa] min-h-screen py-16">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link href="/blog" className="text-[#ff3366] hover:text-[#2c2d5a] transition mb-8 inline-flex items-center font-medium">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Blog
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {postData.featuredImage && (
            <div className="relative w-full h-80 sm:h-[400px]">
              <Image 
                src={postData.featuredImage} 
                alt={postData.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          <div className="p-6 sm:p-10">
            <div className="mb-6">
              <time dateTime={postData.date} className="text-[#ff3366] text-sm font-medium">
                {formattedDate}
              </time>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2c2d5a] mb-8">
              {postData.title}
            </h1>
            
            {/* Blog content with improved styling */}
            <div 
              className="prose prose-lg max-w-none 
                prose-headings:text-[#2c2d5a] prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                prose-h3:text-xl
                prose-p:text-gray-700 prose-p:my-4 prose-p:leading-relaxed
                prose-a:text-[#ff3366] prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-[#ff3366] prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:pr-2 prose-blockquote:rounded-r prose-blockquote:italic prose-blockquote:not-italic
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                prose-li:my-2
                prose-table:border-collapse prose-table:w-full
                prose-thead:bg-gray-50 prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-gray-300
                prose-td:p-2 prose-td:border prose-td:border-gray-300
                prose-img:rounded-md prose-img:mx-auto
                prose-code:text-[#ff3366] prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
                prose-strong:font-semibold prose-strong:text-[#2c2d5a]
                prose-hr:my-8 prose-hr:border-gray-200"
              dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
            />
            
            {/* Blog footer sharing links */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <Link href="/blog" className="text-[#ff3366] hover:text-[#2c2d5a] transition font-medium">
                    ← Back to all posts
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm">Share:</span>
                  {/* Share buttons */}
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(postData.title)}&url=${encodeURIComponent(`https://cheapcc.online/blog/${params.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-[#1da1f2] transition"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-12 bg-[#2c2d5a] text-white rounded-xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to get Adobe Creative Cloud at a discount?</h2>
          <p className="mb-6 text-gray-200">Get up to 86% off official Adobe Creative Cloud prices today.</p>
          <Link 
            href="/#pricing"
            className="inline-block bg-[#ff3366] hover:bg-[#ff6b8b] transition text-white font-semibold py-3 px-8 rounded-full shadow-lg"
          >
            View Pricing Plans
          </Link>
        </div>
      </article>
    </main>
  );
} 