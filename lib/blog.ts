import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

/**
 * Defines the structure for a blog post's data.
 */
export interface Post {
  slug: string;
  title: string;
  date: string; // ISO format
  excerpt: string;
  featuredImage?: string;
  contentHtml: string;
  wordCount: number;
  readingTime: number; // in minutes
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

/**
 * Fetches and sorts data for blog post listings.
 * @returns An array of sorted post data (without full content).
 */
export function getSortedPostsData(): Omit<Post, 'contentHtml' | 'wordCount' | 'readingTime'>[] {
  if (!fs.existsSync(postsDirectory)) {
    console.log('Blog posts directory does not exist:', postsDirectory);
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  console.log('Server: Found blog post files:', fileNames);
  
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      try {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        console.log('Server: Reading blog post file:', fullPath);
        
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        try {
          const { data, content } = matter(fileContents);
          
          console.log('Server: Blog post data:', { 
            slug, 
            title: data.title, 
            date: data.date,
            hasExcerpt: !!data.excerpt,
            hasFeaturedImage: !!data.featuredImage
          });
          
          if (!data.title) {
            console.error(`Server: Missing title in ${fileName}`);
          }

          return {
            slug,
            title: data.title || 'Untitled Post',
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            excerpt: data.excerpt || content.slice(0, 155).trim() + '...',
            featuredImage: data.featuredImage || null,
          };
        } catch (matterError) {
          console.error(`Server: Error parsing frontmatter in ${fileName}:`, matterError);
          return {
            slug,
            title: `Error in ${fileName}`,
            date: new Date().toISOString(),
            excerpt: `There was an error processing this blog post.`,
            featuredImage: null,
          };
        }
      } catch (fileError) {
        console.error(`Server: Error reading file ${fileName}:`, fileError);
        return null;
      }
    })
    .filter(Boolean); // Remove any null entries from errors
  
  const sortedPosts = allPostsData.sort((a, b) => b.date.localeCompare(a.date));
  console.log('Server: Total sorted blog posts:', sortedPosts.length);
  console.log('Server: First 3 posts:', sortedPosts.slice(0, 3).map(p => ({ slug: p.slug, title: p.title, date: p.date })));
  
  return sortedPosts;
}

/**
 * Fetches all data for a single blog post, including rendered HTML content.
 * @param slug The slug of the post to fetch.
 * @returns A promise that resolves to the full post data.
 */
export async function getPostData(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Blog post not found for slug: ${slug}`);
  }

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark().use(remarkGfm).use(html, { sanitize: false }).process(content);
    const contentHtml = processedContent.toString();
    const wordCount = content.trim().split(/\s+/).length;

    return {
      slug,
      contentHtml,
      wordCount,
      readingTime: Math.ceil(wordCount / 200),
      title: data.title || 'Untitled Post',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      excerpt: data.excerpt || content.slice(0, 155).trim() + '...',
      featuredImage: data.featuredImage || null,
    };
  } catch (error) {
    console.error(`Server: Error processing blog post ${slug}:`, error);
    throw error;
  }
}

/**
 * This is the DEFINITIVE version.
 * It returns the nested structure: Array<{ params: { slug: string } }>
 */
export function getAllPostSlugs(): Array<{ params: { slug: string } }> {
  if (!fs.existsSync(postsDirectory)) return [];
  
  const fileNames = fs.readdirSync(postsDirectory);
  
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => ({
      params: {
        slug: fileName.replace(/\.md$/, '')
      }
    }));
}