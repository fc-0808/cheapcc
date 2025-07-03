import { getSortedPostsData } from '@/lib/blog';
import ClientBlog from './client-blog';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Blog() {
  // Add a timestamp to ensure we're getting fresh data
  console.log('Server: Rendering blog page at:', new Date().toISOString());
  
  try {
    const posts = getSortedPostsData();
    console.log(`Server: Rendering blog with ${posts.length} posts`);
    console.log('Server: Post titles:', posts.map(p => p.title));
    
    return <ClientBlog posts={posts} />;
  } catch (error) {
    console.error('Server: Error loading blog posts:', error);
    return <ClientBlog posts={[]} />;
  }
} 