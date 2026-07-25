/**
 * Post-build static head generation, sitemap and RSS.
 *
 * The app is a client-rendered SPA, so every <meta> tag is written by
 * react-helmet-async at runtime. Search crawlers execute JS, but link unfurlers
 * (Twitter/X, LinkedIn, Slack, Discord, WhatsApp, iMessage) do not — they read
 * the HTML they are served and stop. With a single index.html for every route,
 * that meant every shared article link showed the homepage's title and image,
 * and every route declared the homepage as its canonical URL.
 *
 * This emits a real HTML file per route with the correct <head> baked in. The
 * body is still hydrated by React exactly as before. Vercel matches the
 * filesystem before applying the SPA rewrite, so /blog/<slug> is served the
 * generated file rather than the fallback.
 *
 * Run automatically as part of `npm run build`.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, JOURNAL, CONFIG, ALL_SKILLS } from '../src/config';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BLOG_SRC = path.join(ROOT, 'src/data/blogs');

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  wordCount: number;
  readingTime: string;
}

interface RouteHead {
  route: string;
  title: string;
  description: string;
  ogType: 'website' | 'article';
  image: string;
  jsonLd: unknown;
  extraMeta?: Array<[string, string]>;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Escapes the characters that are illegal inside an XML text node. */
const escapeXml = (value: string) => escapeHtml(value).replace(/'/g, '&apos;');

async function readPosts(): Promise<PostMeta[]> {
  const entries = await fs.readdir(BLOG_SRC, { withFileTypes: true });
  const posts: PostMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dir = path.join(BLOG_SRC, entry.name);
    let raw: string;
    try {
      raw = await fs.readFile(path.join(dir, 'meta.json'), 'utf8');
    } catch {
      continue;
    }

    const meta = JSON.parse(raw) as Omit<PostMeta, 'slug' | 'wordCount' | 'readingTime'>;
    const content = await fs.readFile(path.join(dir, 'index.md'), 'utf8').catch(() => '');
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    posts.push({
      ...meta,
      slug: entry.name,
      tags: meta.tags ?? [],
      wordCount,
      readingTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    });
  }

  // Newest first, matching getAllPosts().
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Rewrites the tags in the template head. Each replacement is anchored to the
 * tag's identifying attribute so ordering in index.html does not matter.
 */
function renderHead(template: string, head: RouteHead): string {
  const url = `${SITE.url}${head.route}`;
  const title = escapeHtml(head.title);
  const description = escapeHtml(head.description);
  const image = escapeHtml(head.image);

  const replacements: Array<[RegExp, string]> = [
    [/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`],
    [/(<meta name="title" content=")[^"]*(")/, `$1${title}$2`],
    [/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`],
    [/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(url)}$2`],

    [/(<meta property="og:type" content=")[^"]*(")/, `$1${head.ogType}$2`],
    [/(<meta property="og:url" content=")[^"]*(")/, `$1${escapeHtml(url)}$2`],
    [/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`],
    [/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`],
    [/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`],
    [/(<meta property="og:image:secure_url" content=")[^"]*(")/, `$1${image}$2`],
    [/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${title}$2`],

    [/(<meta name="twitter:url" content=")[^"]*(")/, `$1${escapeHtml(url)}$2`],
    [/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`],
    [/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`],
    [/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`],
    [/(<meta name="twitter:image:alt" content=")[^"]*(")/, `$1${title}$2`],
  ];

  let html = template;
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(html)) {
      throw new Error(`postbuild: no match for ${pattern} — index.html head changed shape?`);
    }
    html = html.replace(pattern, replacement);
  }

  const extra = (head.extraMeta ?? [])
    .map(([property, content]) => `    <meta property="${property}" content="${escapeHtml(content)}" />`)
    .join('\n');

  const injected = [
    extra,
    `    <link rel="alternate" type="application/rss+xml" title="The Journal" href="${SITE.url}/rss.xml" />`,
    `    <script type="application/ld+json">${JSON.stringify(head.jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join('\n');

  return html.replace('</head>', `${injected}\n  </head>`);
}

async function writeRoute(route: string, html: string) {
  const target =
    route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.replace(/^\//, ''), 'index.html');

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html, 'utf8');
  console.log(`  ${route.padEnd(46)} -> ${path.relative(DIST, target)}`);
}

function buildSitemap(posts: PostMeta[]): string {
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${SITE.url}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE.url}/blog`, lastmod: posts[0]?.date ?? today, changefreq: 'weekly', priority: '0.8' },
    ...posts.map((post) => ({
      loc: `${SITE.url}/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    ),
    '</urlset>',
    '',
  ].join('\n');
}

async function buildRss(posts: PostMeta[]): Promise<string> {
  const items = await Promise.all(posts.map(async (post) => {
    const url = `${SITE.url}/blog/${post.slug}`;
    // RSS requires a real byte length on an enclosure.
    const cardBytes = await fs
      .stat(path.join(DIST, 'og', `${post.slug}.jpg`))
      .then((s) => s.size)
      .catch(() => 0);

    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(post.description)}</description>`,
      ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
      ...(cardBytes
        ? [
            `      <enclosure url="${escapeXml(`${SITE.url}/og/${post.slug}.jpg`)}" ` +
              `type="image/jpeg" length="${cardBytes}" />`,
          ]
        : []),
      '    </item>',
    ].join('\n');
  }));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml('The Journal — Reddy Durgeshwant')}</title>`,
    `    <link>${SITE.url}/blog</link>`,
    `    <description>${escapeXml(JOURNAL.description)}</description>`,
    '    <language>en-us</language>',
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

async function main() {
  const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
  const posts = await readPosts();

  console.log(`Prerendering ${posts.length + 2} route heads:`);

  // Home
  await writeRoute(
    '/',
    renderHead(template, {
      route: '/',
      title: SITE.title,
      description: SITE.description,
      ogType: 'website',
      image: `${SITE.url}/og/default.jpg`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: CONFIG.personal.name,
          jobTitle: CONFIG.personal.role,
          description: CONFIG.personal.about,
          email: `mailto:${CONFIG.personal.email}`,
          url: SITE.url,
          image: `${SITE.url}/og/default.jpg`,
          sameAs: [CONFIG.personal.links.github, CONFIG.personal.links.linkedin],
          knowsAbout: ALL_SKILLS,
        },
      },
    })
  );

  // Blog index
  await writeRoute(
    '/blog',
    renderHead(template, {
      route: '/blog',
      title: JOURNAL.title,
      description: JOURNAL.description,
      ogType: 'website',
      image: `${SITE.url}/og/default.jpg`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'The Journal',
        description: JOURNAL.description,
        url: JOURNAL.url,
        author: { '@type': 'Person', name: CONFIG.personal.name, url: SITE.url },
        blogPost: posts.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${SITE.url}/blog/${post.slug}`,
          datePublished: post.date,
        })),
      },
    })
  );

  // Individual posts
  for (const post of posts) {
    const url = `${SITE.url}/blog/${post.slug}`;
    const image = `${SITE.url}/og/${post.slug}.jpg`;

    await writeRoute(
      `/blog/${post.slug}`,
      renderHead(template, {
        route: `/blog/${post.slug}`,
        title: `${post.title} | ${CONFIG.personal.name}`,
        description: post.description,
        ogType: 'article',
        image,
        extraMeta: [
          ['article:published_time', post.date],
          ['article:author', CONFIG.personal.name],
          ...post.tags.map((tag): [string, string] => ['article:tag', tag]),
        ],
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          image: [image],
          datePublished: post.date,
          dateModified: post.date,
          wordCount: post.wordCount,
          timeRequired: `PT${Math.max(1, Math.ceil(post.wordCount / 200))}M`,
          author: [{ '@type': 'Person', name: CONFIG.personal.name, url: SITE.url }],
          publisher: { '@type': 'Person', name: CONFIG.personal.name, url: SITE.url },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          keywords: post.tags.join(', '),
          isPartOf: { '@type': 'Blog', name: 'The Journal', '@id': JOURNAL.url },
        },
      })
    );
  }

  await fs.writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(posts), 'utf8');
  await fs.writeFile(path.join(DIST, 'rss.xml'), await buildRss(posts), 'utf8');
  console.log(`\n  sitemap.xml   ${posts.length + 2} urls`);
  console.log(`  rss.xml       ${posts.length} items`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
