import { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import {
  ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin,
  Link as LinkIcon, Check, Copy, ArrowUp, List, X,
  BookOpen, ChevronRight
} from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

import { 
  Zap, Info, AlertTriangle, CheckCircle2, XCircle, Sparkles,
  ShieldAlert, Lightbulb, MessageSquare
} from 'lucide-react';

import { format } from 'date-fns';
import { getPostBySlug, getAllPosts, getAssetUrl } from '../../lib/blog';
import AudioPlayer from '../../components/AudioPlayer';

// ─── TOC Heading type ─────────────────────────────────────────────────────────
interface TocItem {
  id: string;
  text: string;
  level: number;
}

// ─── Extract TOC from markdown ───────────────────────────────────────────────
function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_`[\]]/g, '').trim();
    // replicate rehype-slug logic
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    items.push({ id, text, level });
  }
  return items;
}

// ─── Code block with copy button ─────────────────────────────────────────────
function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    const text = codeRef.current?.innerText || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group/code">
      <pre className={`${className || ''}`} {...props}>
        <code ref={codeRef}>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white opacity-0 group-hover/code:opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/10"
        title="Copy code"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
              <Check className="w-3.5 h-3.5 text-green-400" />
            </motion.div>
          ) : (
            <motion.div key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
              <Copy className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

// ─── Article Content Component (Memoized) ───────────────────────────────────
const ArticleContent = memo(({ content, slug, articleRef }: { content: string, slug: string, articleRef: React.RefObject<HTMLElement> }) => {
  const components = useMemo(() => ({
    img({ src, alt, ...props }: any) {
      const imageSrc = src?.startsWith('http') ? src : getAssetUrl(slug, src);
      const isInline = src?.startsWith('data:image') || (alt && alt.toLowerCase().includes('inline'));
      
      if (isInline) {
        return (
          <img 
            src={imageSrc} 
            alt={alt} 
            className="inline-block align-middle mx-1 h-[1.2em] w-auto max-w-none opacity-90 dark:invert transition-opacity hover:opacity-100" 
            {...props} 
          />
        );
      }

      return (
        <div className="isolate my-10 sm:my-14 md:my-20 flex flex-col items-center">
          <div className="relative group/img max-w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-xl transition-all duration-700 hover:scale-[1.01] bg-muted/5">
            <img 
              src={imageSrc} 
              alt={alt} 
              decoding="async"
              loading="lazy"
              className="w-full max-h-[70vh] object-contain transform-gpu transition-all duration-700 grayscale-[0.2] group-hover:grayscale-0" 
              {...props} 
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl sm:rounded-2xl" />
          </div>
          {alt && !alt.toLowerCase().includes('banner') && (
            <p className="mt-4 text-center text-xs font-mono uppercase tracking-[0.2em] text-muted opacity-60">
              {alt}
            </p>
          )}
        </div>
      );
    },
    pre({ children, ...props }: any) {
      const [copied, setCopied] = useState(false);
      const codeRef = useRef<HTMLPreElement>(null);

      const handleCopy = () => {
        const codeElement = codeRef.current?.querySelector('code');
        const text = codeElement?.innerText || codeRef.current?.innerText || '';
        
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }
      };

      return (
        <div className="relative group/code my-6 sm:my-8 isolate">
          <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <pre
            ref={codeRef}
            className="relative bg-zinc-950 border border-white/10 shadow-2xl rounded-xl p-4 sm:p-6 overflow-x-auto text-sm sm:text-base transform-gpu"
            {...props}
          >
            {children}
          </pre>
          <button
            onClick={handleCopy}
            className={`
              absolute top-4 right-4 p-2 rounded-lg 
              bg-white/5 hover:bg-white/10 text-white/50 hover:text-white 
              transition-all duration-300 backdrop-blur-md border border-white/10
              z-20 cursor-pointer
              ${copied ? 'opacity-100 ring-2 ring-green-500/30 bg-green-500/10' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}
            `}
            title="Copy code"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div 
                  key="check" 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Check className="w-4 h-4 text-green-400" />
                </motion.div>
              ) : (
                <motion.div 
                  key="copy" 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      );
    },
    blockquote({ children }: any) {
      const childrenArray = Array.isArray(children) ? children : [children];
      
      // Helper to find the alert tag string in a node
      const extractAlertTag = (node: any): { type: string; full: string } | null => {
        if (!node) return null;
        if (typeof node === 'string') {
          const match = node.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|SUCCESS|ERROR|DANGER|INFO|HINT|QUESTION)\]/i);
          return match ? { type: match[1].toUpperCase(), full: match[0] } : null;
        }
        if (Array.isArray(node)) {
          for (const child of node) {
            const res = extractAlertTag(child);
            if (res) return res;
          }
          return null;
        }
        if (node.props?.children) {
          return extractAlertTag(node.props.children);
        }
        return null;
      };

      const alertData = extractAlertTag(childrenArray);

      if (!alertData) {
        return (
          <blockquote className="my-10 pl-6 border-l-4 border-primary/20 bg-primary/5 py-4 italic text-foreground/80 rounded-r-2xl">
            {children}
          </blockquote>
        );
      }

      const { type, full } = alertData;
      const configChoices: Record<string, { icon: any; color: string; bgClass: string; accentClass: string }> = {
        NOTE: { icon: MessageSquare, color: 'text-zinc-500 dark:text-zinc-400', bgClass: 'bg-zinc-500/5', accentClass: 'bg-zinc-500/40' },
        INFO: { icon: Info, color: 'text-blue-500 dark:text-blue-400', bgClass: 'bg-blue-500/5', accentClass: 'bg-blue-500/40' },
        TIP: { icon: Lightbulb, color: 'text-emerald-500 dark:text-emerald-400', bgClass: 'bg-emerald-500/5', accentClass: 'bg-emerald-500/40' },
        IMPORTANT: { icon: Zap, color: 'text-purple-500 dark:text-purple-400', bgClass: 'bg-purple-500/5', accentClass: 'bg-purple-500/40' },
        WARNING: { icon: AlertTriangle, color: 'text-amber-500 dark:text-amber-400', bgClass: 'bg-amber-500/5', accentClass: 'bg-amber-500/40' },
        CAUTION: { icon: ShieldAlert, color: 'text-orange-500 dark:text-orange-400', bgClass: 'bg-orange-500/5', accentClass: 'bg-orange-500/40' },
        SUCCESS: { icon: CheckCircle2, color: 'text-green-500 dark:text-green-400', bgClass: 'bg-green-500/5', accentClass: 'bg-green-500/40' },
        ERROR: { icon: XCircle, color: 'text-red-500 dark:text-red-400', bgClass: 'bg-red-500/5', accentClass: 'bg-red-500/40' },
        DANGER: { icon: XCircle, color: 'text-red-600 dark:text-red-500', bgClass: 'bg-red-600/5', accentClass: 'bg-red-600/40' },
        HINT: { icon: Sparkles, color: 'text-teal-500 dark:text-teal-400', bgClass: 'bg-teal-500/5', accentClass: 'bg-teal-500/40' },
        QUESTION: { icon: MessageSquare, color: 'text-cyan-500 dark:text-cyan-400', bgClass: 'bg-cyan-500/5', accentClass: 'bg-cyan-500/40' }
      };

      const config = configChoices[type] || configChoices.NOTE;
      const Icon = config.icon;

      // Recursive removal of the tag
      const cleanNode = (node: any): any => {
        if (!node) return null;
        if (typeof node === 'string') {
          return node.replace(full, '').trimStart();
        }
        if (Array.isArray(node)) {
          return node.map(cleanNode).filter((k: any) => k !== null && k !== '');
        }
        if (node?.props?.children) {
          const kids = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
          const newKids = kids.map(cleanNode).filter((k: any) => k !== null && k !== '');
          if (newKids.length === 0) return null;
          return { ...node, props: { ...node.props, children: newKids.length === 1 ? newKids[0] : newKids } };
        }
        return node;
      };

      const finalContent = cleanNode(childrenArray);

      return (
        <div className={`my-8 relative overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-border/80 ${config.bgClass}`}>
          {/* Subtle left accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accentClass}`} />
          
          <div className="relative z-10 px-5 py-5 sm:px-6 sm:py-6 flex items-start gap-4 sm:gap-5">
            <div className={`shrink-0 mt-0.5 ${config.color}`}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.15em] mb-1.5 ${config.color} uppercase opacity-90`}>
                {type}
              </div>
              <div className="prose prose-base sm:prose-sm dark:prose-invert !max-w-none text-foreground/85 leading-relaxed font-light font-sans [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                {finalContent}
              </div>
            </div>
          </div>
        </div>
      );
    },
    sup() {
      return null;
    },
  }), [slug]);

  return (
    <article
      ref={articleRef}
      className={`
        prose dark:prose-invert max-w-none font-sans text-foreground/90
        prose-base sm:prose-base md:prose-lg selection:bg-primary/30
        
        [&_h1,h2,h3,h4,h5,h6]:font-display [&_h1,h2,h3,h4,h5,h6]:font-bold [&_h1,h2,h3,h4,h5,h6]:tracking-tight
        [&_h1,h2,h3,h4,h5,h6]:text-foreground [&_h1,h2,h3,h4,h5,h6]:break-words
        [&_h1,h2,h3,h4,h5,h6]:mt-10 sm:[&_h1,h2,h3,h4,h5,h6]:mt-14
        [&_h1,h2,h3,h4,h5,h6]:mb-4 sm:[&_h1,h2,h3,h4,h5,h6]:mb-6
        [&_h1,h2,h3,h4,h5,h6]:scroll-mt-24
        
        [&_h1]:text-4xl sm:[&_h1]:text-4xl md:[&_h1]:text-5xl lg:[&_h1]:text-6xl
        [&_h1]:text-primary [&_h1]:italic [&_h1]:normal-case [&_h1]:leading-[1.1]
        
        [&_h2]:text-3xl sm:[&_h2]:text-3xl md:[&_h2]:text-4xl
        [&_h2]:leading-[1.1] [&_h2]:border-b-0 [&_h2]:pb-0
        
        [&_h3]:text-2xl sm:[&_h3]:text-2xl md:[&_h3]:text-3xl
        [&_h3]:leading-[1.2] [&_h3]:text-foreground/80
        
        [&_p]:mb-6 sm:[&_p]:mb-6
        [&_p]:leading-[1.8] sm:[&_p]:leading-[1.8]
        [&_p]:font-light [&_p]:text-foreground/85
        
        [&_a]:text-primary [&_a]:font-medium [&_a]:underline-offset-4
        [&_a]:decoration-primary/20 hover:[&_a]:decoration-primary transition-all
        
        [&_blockquote]:my-8
        
        [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1.5
        [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[0.9em]
        [&_code]:before:content-none [&_code]:after:content-none
        [&_ul]:my-3 sm:[&_ul]:my-2.5 [&_ol]:my-3 sm:[&_ol]:my-2.5
        [&_strong]:text-foreground [&_strong]:font-bold
        [&_hr]:border-border [&_hr]:my-6 sm:[&_hr]:my-6
        [&_table]:my-4 sm:[&_table]:my-4 [&_table]:border-collapse
        [&_th]:border-b [&_th]:border-border [&_th]:py-3 sm:[&_th]:py-4 [&_th]:text-left
        [&_th]:font-mono [&_th]:text-xs sm:[&_th]:text-xs [&_th]:uppercase [&_th]:tracking-widest
        [&_td]:border-b [&_td]:border-border/50 [&_td]:py-3 sm:[&_td]:py-4
        [&_td]:text-sm sm:[&_td]:text-sm
        [&_h1_a]:!no-underline [&_h2_a]:!no-underline [&_h3_a]:!no-underline
        [&_h4_a]:!no-underline [&_h5_a]:!no-underline [&_h6_a]:!no-underline
        hover:[&_h1_a]:!no-underline hover:[&_h2_a]:!no-underline hover:[&_h3_a]:!no-underline
        hover:[&_h4_a]:!no-underline hover:[&_h5_a]:!no-underline hover:[&_h6_a]:!no-underline
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkToc, { heading: 'Table of Contents', tight: true }]]}
        rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }], rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState(getPostBySlug(slug || ''));
  const [allPosts] = useState(getAllPosts());
  const [isCopied, setIsCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');
  const [tocOpen, setTocOpen] = useState(false);          // mobile TOC drawer
  const [stickyHeader, setStickyHeader] = useState(false); // mini sticky header
  const [readingTimeLeft, setReadingTimeLeft] = useState('');

  // Manage body class for sidebar state
  useEffect(() => {
    if (tocOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [tocOpen]);

  const articleRef = useRef<HTMLElement>(null);
  const tocItems = useMemo(() => post ? extractToc(post.content) : [], [post]);

  // ── Scroll events ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowBackToTop(y > 600);
      setStickyHeader(y > 500);

      // Remaining reading time (avg 200 wpm)
      if (post) {
        const wordCount = post.content.split(/\s+/).length;
        const articleEl = articleRef.current;
        if (articleEl) {
          const rect = articleEl.getBoundingClientRect();
          const totalHeight = articleEl.offsetHeight;
          const scrolled = Math.max(0, -rect.top);
          const fraction = Math.min(1, scrolled / totalHeight);
          const wordsRead = Math.floor(fraction * wordCount);
          const remaining = Math.max(0, Math.ceil((wordCount - wordsRead) / 200));
          setReadingTimeLeft(remaining > 0 ? `${remaining} min left` : 'Done!');
        }
      }

      // Active heading highlight in TOC
      const headings = document.querySelectorAll('article h2, article h3, article h4');
      let current = '';
      headings.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < 120) current = el.id;
      });
      setActiveHeading(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  useEffect(() => {
    const foundPost = getPostBySlug(slug || '');
    if (!foundPost) {
      navigate('/blog');
    } else {
      setPost(foundPost);
      window.scrollTo(0, 0);
    }
  }, [slug, navigate]);

  const lenis = useLenis();

  const scrollToTop = useCallback(() => {
    lenis ? lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lenis]);

  useEffect(() => {
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor?.hash && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname) {
        const el = document.getElementById(anchor.hash.substring(1));
        if (el && lenis) {
          e.preventDefault();
          window.history.pushState(null, '', anchor.hash);
          lenis.scrollTo(el, { offset: -80, duration: 1.5, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        }
      }
    };
    document.addEventListener('click', handleInternalLinks);
    return () => document.removeEventListener('click', handleInternalLinks);
  }, [lenis]);

  if (!post) return null;

  const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug)
    .map(p => {
      const sharedTags = p.meta.tags.filter(tag => post.meta.tags.includes(tag));
      const score = sharedTags.length * 10 + new Date(p.meta.date).getTime() / 1000000000;
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTocOpen(false);
    if (lenis) {
      lenis.scrollTo(el, { offset: -80, duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground pb-24"
    >
      <Helmet>
        <title>{post.meta.title} | Portfolio Blog</title>
        <meta name="description" content={post.meta.description} />
        <meta property="og:title" content={post.meta.title} />
        <meta property="og:description" content={post.meta.description} />
        <meta property="og:image" content={getAssetUrl(post.slug, post.meta.banner)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="article:published_time" content={post.meta.date} />
        <meta property="article:author" content="Portfolio Owner" />
        {post.meta.tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta.title} />
        <meta name="twitter:description" content={post.meta.description} />
        <meta name="twitter:image" content={getAssetUrl(post.slug, post.meta.banner)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org", "@type": "BlogPosting",
            "headline": post.meta.title, "description": post.meta.description,
            "image": [getAssetUrl(post.slug, post.meta.banner)],
            "datePublished": post.meta.date, "dateModified": post.meta.date,
            "author": [{ "@type": "Person", "name": "Portfolio Owner", "url": window.location.origin }],
            "publisher": { "@type": "Organization", "name": "Portfolio" },
            "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href },
            "keywords": post.meta.tags.join(", ")
          })}
        </script>
      </Helmet>

      {/* ── Reading Progress Bar (Removed redundant local one) ── */}

      {/* ── Sticky Mini Header (appears after scrolling past hero) ── */}
      <AnimatePresence>
        {stickyHeader && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link to="/blog" className="shrink-0 p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <span className="font-display font-bold text-sm truncate">{post.meta.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {readingTimeLeft && (
                  <span className="hidden sm:block text-[10px] font-mono uppercase tracking-widest text-muted">
                    {readingTimeLeft}
                  </span>
                )}
                {/* Mobile TOC toggle */}
                {tocItems.length > 0 && (
                  <button
                    onClick={() => setTocOpen(true)}
                    className="lg:hidden p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted hover:text-foreground"
                    title="Table of Contents"
                  >
                    <List className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile TOC Drawer ── */}
      <AnimatePresence>
        {tocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-background/60 backdrop-blur-sm lg:hidden"
              onClick={() => setTocOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 z-[201] w-72 bg-background border-l border-border shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                    <List className="w-3.5 h-3.5" /> Contents
                  </span>
                  <button onClick={() => setTocOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {tocItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-start gap-2
                        ${item.level === 2 ? 'font-medium' : 'pl-5 text-xs'}
                        ${activeHeading === item.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      {activeHeading === item.id && <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-primary" />}
                      <span className={activeHeading === item.id ? '' : 'ml-5'}>{item.text}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hero Banner ── */}
      <div className="relative w-full min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh] flex flex-col overflow-hidden bg-muted/10 isolate [perspective:1000px] [contain:paint]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 -z-10">
          <img
            src={getAssetUrl(post.slug, post.meta.banner)}
            alt={post.meta.title}
            className="w-full h-full object-cover grayscale-[0.2] dark:grayscale-0 transform-gpu [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform [transform:translate3d(0,0,0)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent dark:via-background/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col flex-1 px-4 sm:px-8 md:px-12 lg:px-24 max-w-7xl mx-auto w-full py-12 sm:py-16 md:py-20 justify-between gap-12">
          <div className="shrink-0">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-all w-fit font-mono text-xs uppercase tracking-[0.2em] bg-card/30 backdrop-blur-xl px-4 py-2 rounded-full border border-border/50 hover:scale-105 active:scale-95 shadow-xl hover:shadow-primary/20"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Journal
            </Link>
          </div>

          <div className="mt-auto pt-8 sm:pt-12">
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
              {post.meta.tags.map(tag => (
                <span key={tag} className="px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight uppercase mb-4 sm:mb-6 md:mb-8 leading-[1.1] text-foreground drop-shadow-sm max-w-5xl break-words">
              {post.meta.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{format(new Date(post.meta.date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{post.meta.readingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{post.content.split(/\s+/).length} words</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout: article + desktop TOC sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 sm:mt-16 md:mt-20 flex gap-12 xl:gap-16">

        {/* ── Main content column ── */}
        <div className="min-w-0 flex-1">

          {/* Audio Player */}
          {post.meta.audio && (
            <div className="mb-12 sm:mb-16 md:mb-20">
              <AudioPlayer src={getAssetUrl(post.slug, post.meta.audio)} title={post.meta.title} />
            </div>
          )}

          {/* ── Markdown Article ── */}
          <ArticleContent content={post.content} slug={post.slug} articleRef={articleRef} />

          {/* ── Blog Footer ── */}
          <div className="mt-12 sm:mt-16 md:mt-20 py-8 sm:py-10 md:py-12 border-y border-border/50 text-center space-y-3 sm:space-y-4">
            <p className="font-display italic text-xl sm:text-2xl text-foreground/80">End of the blog</p>
            <p className="text-muted font-light text-sm sm:text-base">If you enjoyed please consider sharing this blog, thank you!</p>
          </div>

          {/* ── Share & Navigation ── */}
          <div className="mt-8 sm:mt-10 md:mt-12 pt-8 sm:pt-10 md:pt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-10 sm:mb-14 md:mb-16">
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <span className="font-mono text-xs uppercase tracking-widest text-muted">Share</span>
                <div className="flex gap-2 sm:gap-3">
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                      onClick={() => navigator.share({ title: post.meta.title, text: post.meta.description, url: window.location.href }).catch(() => {})}
                      className="p-2.5 sm:p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm"
                      title="Share Article"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.meta.title)}&url=${encodeURIComponent(window.location.href)}`)}
                    className="p-2.5 sm:p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.meta.title)}`)}
                    className="p-2.5 sm:p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="relative p-2.5 sm:p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm overflow-hidden"
                    title="Copy Link"
                  >
                    <AnimatePresence mode="wait">
                      {isCopied ? (
                        <motion.div key="check" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </motion.div>
                      ) : (
                        <motion.div key="copy" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </div>

            {/* Prev / Next navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {prevPost ? (
                <Link to={`/blog/${prevPost.slug}`} className="group p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col items-start text-left shadow-sm hover:shadow-xl">
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mb-2 sm:mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-3 h-3" /> Previous
                  </span>
                  <span className="font-display font-bold text-base sm:text-xl line-clamp-2 text-foreground leading-snug">{prevPost.meta.title}</span>
                </Link>
              ) : <div />}

              {nextPost ? (
                <Link to={`/blog/${nextPost.slug}`} className="group p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col items-end text-right shadow-sm hover:shadow-xl">
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mb-2 sm:mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                    Next <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                  </span>
                  <span className="font-display font-bold text-base sm:text-xl line-clamp-2 text-foreground leading-snug">{nextPost.meta.title}</span>
                </Link>
              ) : <div />}
            </div>
          </div>

          {/* ── Related Posts ── */}
          {relatedPosts.length > 0 && (
            <div className="mt-20 sm:mt-28 md:mt-32">
              <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight mb-8 sm:mb-12 flex items-center gap-4">
                Explore More <div className="h-px flex-1 bg-border/50" />
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {relatedPosts.map(related => (
                  <Link key={related.slug} to={`/blog/${related.slug}`} className="group block">
                    <div className="aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 border border-border group-hover:border-primary/50 transition-all shadow-md group-hover:shadow-2xl isolate [perspective:1000px] [contain:paint]">
                      <img
                        src={getAssetUrl(related.slug, related.meta.banner)}
                        alt={related.meta.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 transform-gpu [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform [transform:translate3d(0,0,0)]"
                      />
                    </div>
                    <h4 className="font-display font-bold text-base sm:text-xl group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {related.meta.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted mt-2 sm:mt-3 line-clamp-2 font-light leading-relaxed">
                      {related.meta.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop Sticky TOC Sidebar ── */}
        {tocItems.length > 0 && (
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="sticky top-24 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-4 flex items-center gap-2">
                <List className="w-3 h-3" /> Contents
              </p>
              <nav className="space-y-0.5">
                {tocItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={`
                      w-full text-left text-xs py-1.5 px-2 rounded-lg transition-all duration-200
                      ${item.level === 2 ? 'font-medium' : 'pl-4 opacity-80'}
                      ${activeHeading === item.id
                        ? 'text-primary bg-primary/8 font-semibold'
                        : 'text-foreground/60 hover:text-foreground hover:bg-muted/40'
                      }
                    `}
                  >
                    {item.level > 2 && (
                      <span className="inline-block w-1 h-1 rounded-full bg-current mr-2 opacity-50 translate-y-[-1px]" />
                    )}
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* ── Back to Top FAB ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40 p-3 sm:p-3.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
            title="Back to top"
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}