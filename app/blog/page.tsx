import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/blog';
import { Metadata } from 'next';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Adobe Creative Cloud Blog - Tips, Tutorials & Updates',
  description: 'Learn about Adobe Creative Cloud apps, discover tips and tutorials, and stay updated on discounted subscription offers from CheapCC.',
  keywords: 'adobe cc blog, creative cloud tutorials, photoshop tips, illustrator guides, adobe cc discount blog',
  alternates: {
    canonical: '/blog'
  },
};

export default function Blog() {
  const posts = getSortedPostsData();
  
  return (
    <main className="bg-[#f8f9fa] min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#2c2d5a] mb-4 relative inline-block">
            Adobe Creative Cloud Blog
            
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-4">
            Discover tips, tutorials, and insights about Adobe Creative Cloud apps, along with exclusive discount offers.
          </p>
        </header>
        
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No blog posts yet - check back soon!</h2>
            <p className="text-gray-500 mb-6">We're working on some exciting content for you.</p>
            <Link href="/" className="inline-flex items-center px-5 py-2 text-[#ff3366] border border-[#ff3366] hover:bg-[#ff3366] hover:text-white transition-colors rounded-lg font-medium">
              Return to Home
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <article 
                key={post.slug} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  {post.featuredImage && (
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.6)] opacity-70"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="text-sm text-white font-medium px-3 py-1 rounded-full bg-gradient-to-r from-[#ff3366] to-[#ff6b8b]">
                        {format(new Date(post.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-[#2c2d5a] transition mb-3 line-clamp-2 group-hover:text-[#ff3366]">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-5 line-clamp-3">{post.excerpt}</p>
                    <div className="text-[#ff3366] font-medium flex items-center group-hover:text-[#ff3366] mt-auto">
                      Read more 
                      <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-16 text-center">
            <Link href="/#pricing" className="inline-flex items-center px-6 py-3 bg-[#ff3366] hover:bg-[#ff6b8b] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all">
              Get Adobe CC at a Discount
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
} 