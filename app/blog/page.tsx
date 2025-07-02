import { getSortedPostsData } from '@/lib/blog';
import ClientBlog from './client-blog';

export default function Blog() {
  const posts = getSortedPostsData();
  
  return <ClientBlog posts={posts} />;
} 