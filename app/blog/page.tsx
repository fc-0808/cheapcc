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
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#2c2d5a] mb-4">Adobe Creative Cloud Blog</h1>
          <p className="text-gray-600 hidden md:block max-w-2xl mx-auto text-lg">Discover tips, tutorials, and insights about Adobe Creative Cloud apps, along with exclusive discount offers.</p>
          <p className="text-gray-600 md:hidden max-w-2xl mx-auto text-lg">Discover tips, tutorials, and insights about Adobe Creative Cloud apps.</p>
        </header>
        
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-lg text-gray-600">No blog posts yet - check back soon!</h2>
            <Link href="/" className="inline-block mt-4 text-[#ff3366] hover:underline">
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <article 
                key={post.slug} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
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
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-[#ff3366] font-medium mb-2">
                      {format(new Date(post.date), 'MMMM d, yyyy')}
                    </div>
                    <h2 className="text-xl font-bold text-[#2c2d5a] transition mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-5 line-clamp-3">{post.excerpt}</p>
                    <div className="text-[#ff3366] font-medium flex items-center group-hover:text-[#ff3366]">
                      Read more 
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
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
            <Link href="/#pricing" className="inline-flex items-center px-6 py-3 bg-[#ff3366] hover:bg-[#3e3f7d] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all">
              Get Adobe CC at a Discount
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
} 