/// <reference types="vite/client" />

export interface BlogPostMeta {
  title: string;
  date: string;
  description: string;
  banner: string;
  audio?: string;
  tags: string[];
  readingTime: string;
}

export interface BlogPost {
  slug: string;
  meta: BlogPostMeta;
  content: string;
}

// In Vite, we can use import.meta.glob to read files at build time.
// We read the meta.json files eagerly to build the blog list.
const metaFiles = import.meta.glob('/src/data/blogs/*/meta.json', { eager: true });
// We read the markdown files as raw text.
const contentFiles = import.meta.glob('/src/data/blogs/*/index.md', { query: '?raw', import: 'default', eager: true });
// We read all assets (images, audio) to get their public URLs
const assetFiles = import.meta.glob('/src/data/blogs/**/*.{jpg,jpeg,png,webp,gif,svg,mp3,m4a,wav}', { query: '?url', import: 'default', eager: true });
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop';
const SITE_URL = 'https://durgeshwant.com';

export function getAssetUrl(slug: string, filename: string | undefined, absolute = false): string {
  // If no filename provided, return default banner
  if (!filename) return DEFAULT_BANNER;

  // If it's already an absolute URL, return it
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:')) {
    return filename;
  }
  
  // Clean up filename just in case it starts with ./ or /
  const cleanFilename = filename.replace(/^\.\//, '').replace(/^\//, '');
  const path = `/src/data/blogs/${slug}/${cleanFilename}`;
  
  const url = (assetFiles[path] as string) || DEFAULT_BANNER;
  
  if (absolute && url.startsWith('/')) {
    return `${SITE_URL}${url}`;
  }
  
  return url;
}

export function getAllPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const path in metaFiles) {
    // Extract slug from path: /src/data/blogs/my-slug/meta.json -> my-slug
    const match = path.match(/\/src\/data\/blogs\/([^/]+)\/meta\.json$/);
    if (match) {
      const slug = match[1];
      const meta = (metaFiles[path] as any).default || metaFiles[path] as BlogPostMeta;
      
      // Find corresponding content
      const contentPath = `/src/data/blogs/${slug}/index.md`;
      const content = (contentFiles[contentPath] as string) || '';

      // Calculate dynamic reading time (avg 200 wpm)
      const wordCount = content.split(/\s+/).length;
      const calculatedReadingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

      posts.push({
        slug,
        meta: {
          ...meta,
          readingTime: calculatedReadingTime
        },
        content
      });
    }
  }

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug);
}
