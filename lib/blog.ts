import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getSortedPostsData() {
  // Make sure the directory exists
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }
  
  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
    // Remove ".md" from file name to get slug
    const slug = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the slug
    return {
      slug,
      ...(matterResult.data as { title: string; date: string; excerpt: string; featuredImage?: string })
    };
  });
  
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Apply custom styles to specific markdown elements
  let markdownContent = matterResult.content;
  
  // Add class for blockquotes
  markdownContent = markdownContent.replace(/^>\s*(.*)/gm, (match, content) => {
    return `> ${content.trim()}`;
  });

  // Use remark with GitHub Flavored Markdown support to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm) // Add GitHub Flavored Markdown support (tables, strikethrough, etc.)
    .use(html, { sanitize: false }) // Don't sanitize to allow custom HTML
    .process(markdownContent);
    
  let contentHtml = processedContent.toString();
  
  // Post-process the HTML to add custom styling
  // Fix tables
  contentHtml = contentHtml.replace(
    /<table>/g, 
    '<table class="w-full my-6 border-collapse">'
  );
  
  // Style table headers
  contentHtml = contentHtml.replace(
    /<thead>/g, 
    '<thead class="bg-gray-50">'
  );
  
  // Style blockquotes (customer testimonials)
  contentHtml = contentHtml.replace(
    /<blockquote>\s*<p>(.*?)<\/p>\s*<\/blockquote>/gs, 
    '<blockquote class="bg-gray-50 border-l-4 border-[#ff3366] pl-4 py-2 my-6 rounded-r italic"><p>$1</p></blockquote>'
  );
  
  // Style code blocks
  contentHtml = contentHtml.replace(
    /<pre><code>/g, 
    '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>'
  );
  
  // Improve lists appearance
  contentHtml = contentHtml.replace(
    /<ul>/g, 
    '<ul class="list-disc pl-6 my-4 space-y-2">'
  );
  
  contentHtml = contentHtml.replace(
    /<ol>/g, 
    '<ol class="list-decimal pl-6 my-4 space-y-2">'
  );

  // Combine the data with the slug and contentHtml
  return {
    slug,
    contentHtml,
    ...(matterResult.data as { title: string; date: string; excerpt: string; featuredImage?: string })
  };
}

export function getAllPostSlugs() {
  // Make sure the directory exists
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, '')
        }
      };
  });
} 