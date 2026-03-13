import { useEffect, useState } from 'react';
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
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { getPostBySlug, getAllPosts, getAssetUrl } from '../../lib/blog';
import AudioPlayer from '../../components/AudioPlayer';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState(getPostBySlug(slug || ''));
  const [allPosts] = useState(getAllPosts());
  const [isCopied, setIsCopied] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const foundPost = getPostBySlug(slug || '');
    if (!foundPost) {
      navigate('/blog');
    } else {
      setPost(foundPost);
      window.scrollTo(0, 0);
    }
  }, [slug, navigate]);

  if (!post) return null;

  const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // Get 3 related posts (excluding current)
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug)
    .map(p => {
      // Calculate relevance score based on shared tags
      const sharedTags = p.meta.tags.filter(tag => post.meta.tags.includes(tag));
      const score = sharedTags.length * 10 + (new Date(p.meta.date).getTime() / 1000000000);
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

  const lenis = useLenis();

  useEffect(() => {
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.origin === window.location.origin && anchor.pathname === window.location.pathname) {
        const id = anchor.hash.substring(1);
        const element = document.getElementById(id);
        
        if (element && lenis) {
          e.preventDefault();
          window.history.pushState(null, '', anchor.hash);
          lenis.scrollTo(element, {
            offset: -20,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener('click', handleInternalLinks);
    return () => document.removeEventListener('click', handleInternalLinks);
  }, [lenis]);

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
        
        {/* Open Graph */}
        <meta property="og:title" content={post.meta.title} />
        <meta property="og:description" content={post.meta.description} />
        <meta property="og:image" content={getAssetUrl(post.slug, post.meta.banner)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="article:published_time" content={post.meta.date} />
        <meta property="article:author" content="Portfolio Owner" />
        {post.meta.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta.title} />
        <meta name="twitter:description" content={post.meta.description} />
        <meta name="twitter:image" content={getAssetUrl(post.slug, post.meta.banner)} />

        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.meta.title,
            "description": post.meta.description,
            "image": [getAssetUrl(post.slug, post.meta.banner)],
            "datePublished": post.meta.date,
            "dateModified": post.meta.date,
            "author": [{
              "@type": "Person",
              "name": "Portfolio Owner",
              "url": window.location.origin
            }],
            "publisher": {
              "@type": "Organization",
              "name": "Portfolio"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            },
            "keywords": post.meta.tags.join(", ")
          })}
        </script>
      </Helmet>

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Banner */}
      <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-muted/10">
        <img
          src={getAssetUrl(post.slug, post.meta.banner)}
          alt={post.meta.title}
          className="w-full h-full object-cover grayscale-[0.2] dark:grayscale-0"
        />
        {/* Dynamic theme-aware overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent dark:via-background/40" />
        
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 lg:px-24 pb-20 max-w-6xl mx-auto">
          <Link to="/blog" className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors w-fit mb-12 font-mono text-xs uppercase tracking-[0.2em] bg-card/30 backdrop-blur-xl px-4 py-2 rounded-full border border-border/50">
            <ArrowLeft className="w-3 h-3" /> Back to Journal
          </Link>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {post.meta.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.15em] bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight uppercase mb-8 leading-[0.9] text-foreground drop-shadow-sm max-w-4xl">
            {post.meta.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-8 text-xs font-mono uppercase tracking-widest text-muted">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(post.meta.date), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.meta.readingTime} read</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 mt-20">
        {/* Audio Player */}
        {post.meta.audio && (
          <div className="mb-20">
            <AudioPlayer src={getAssetUrl(post.slug, post.meta.audio)} title={post.meta.title} />
          </div>
        )}

        {/* Markdown Content */}
        <article className="prose dark:prose-invert prose-lg md:prose-xl max-w-none font-sans text-foreground/90
          prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:uppercase prose-headings:mt-20 prose-headings:mb-8 prose-headings:scroll-mt-24
          prose-h1:text-5xl md:prose-h1:text-6xl prose-h1:text-primary prose-h1:italic prose-h1:normal-case
          prose-h2:text-4xl md:prose-h2:text-5xl prose-h2:border-b prose-h2:border-border prose-h2:pb-6
          prose-h3:text-3xl md:prose-h3:text-4xl
          prose-p:mb-10 prose-p:leading-[1.8] prose-p:text-lg md:prose-p:text-xl prose-p:font-light
          prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/30 hover:prose-a:decoration-primary transition-all
          prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-20 prose-img:mx-auto
          prose-blockquote:border-l-0 prose-blockquote:bg-muted/30 prose-blockquote:px-12 prose-blockquote:py-12 prose-blockquote:rounded-3xl prose-blockquote:not-italic prose-blockquote:text-foreground prose-blockquote:my-20 prose-blockquote:font-display prose-blockquote:text-3xl md:prose-blockquote:text-4xl prose-blockquote:leading-tight prose-blockquote:relative
          prose-blockquote:before:content-['“'] prose-blockquote:before:absolute prose-blockquote:before:top-4 prose-blockquote:before:left-4 prose-blockquote:before:text-8xl prose-blockquote:before:opacity-10 prose-blockquote:before:font-serif
          prose-code:text-primary prose-code:bg-primary/5 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-base
          prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/10 prose-pre:shadow-2xl prose-pre:rounded-3xl prose-pre:p-10 prose-pre:my-16 prose-pre:overflow-x-auto
          prose-li:mb-4 prose-li:marker:text-primary
          prose-ul:my-10 prose-ol:my-10
          prose-strong:text-foreground prose-strong:font-bold
          prose-hr:border-border prose-hr:my-20
          prose-table:my-16 prose-table:border-collapse
          prose-th:border-b prose-th:border-border prose-th:py-4 prose-th:text-left prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-widest
          prose-td:border-b prose-td:border-border/50 prose-td:py-4 prose-td:text-sm
          [&_h1_a]:!no-underline [&_h2_a]:!no-underline [&_h3_a]:!no-underline [&_h4_a]:!no-underline [&_h5_a]:!no-underline [&_h6_a]:!no-underline
          hover:[&_h1_a]:!no-underline hover:[&_h2_a]:!no-underline hover:[&_h3_a]:!no-underline hover:[&_h4_a]:!no-underline hover:[&_h5_a]:!no-underline hover:[&_h6_a]:!no-underline
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, [remarkToc, { heading: 'Table of Contents', tight: true }]]}
            rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }], rehypeHighlight]}
            components={{
              img({ src, alt, ...props }: any) {
                // Handle relative image paths inside the blog folder
                const imageSrc = src?.startsWith('http') ? src : getAssetUrl(post.slug, src);
                return <img src={imageSrc} alt={alt} loading="lazy" {...props} />;
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Blog Footer Message */}
        <div className="mt-20 py-12 border-y border-border/50 text-center space-y-4">
          <p className="font-display italic text-2xl text-foreground/80">End of the blog</p>
          <p className="text-muted font-light">If you enjoyed please consider sharing this blog, thank you!</p>
        </div>

        {/* Share & Navigation */}
        <div className="mt-12 pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-6">
              <span className="font-mono text-sm uppercase tracking-widest text-muted">Share Article</span>
              <div className="flex gap-3">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button 
                    onClick={() => {
                      navigator.share({
                        title: post.meta.title,
                        text: post.meta.description,
                        url: window.location.href,
                      }).catch(() => {});
                    }} 
                    className="p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title="Share Article"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.meta.title)}&url=${encodeURIComponent(window.location.href)}`)} 
                  className="p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm"
                  title="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.meta.title)}`)} 
                  className="p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleCopyLink} 
                  className="relative p-3.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm overflow-hidden"
                  title="Copy Link"
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-5 h-5 text-primary" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Copy className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} className="group p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col items-start text-left shadow-sm hover:shadow-xl">
                <span className="font-mono text-xs uppercase tracking-widest text-muted mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-3 h-3" /> Previous Post
                </span>
                <span className="font-display font-bold text-xl line-clamp-1 text-foreground">{prevPost.meta.title}</span>
              </Link>
            ) : <div />}
            
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`} className="group p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col items-end text-right shadow-sm hover:shadow-xl">
                <span className="font-mono text-xs uppercase tracking-widest text-muted mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                  Next Post <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.div>
                </span>
                <span className="font-display font-bold text-xl line-clamp-1 text-foreground">{nextPost.meta.title}</span>
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* Read Next Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-32">
            <h3 className="text-3xl font-display font-bold uppercase tracking-tight mb-12 flex items-center gap-4">
              Explore More <div className="h-px flex-1 bg-border/50" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(related => (
                <Link 
                  key={related.slug} 
                  to={`/blog/${related.slug}`}
                  className="group block"
                >
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-border group-hover:border-primary/50 transition-all shadow-md group-hover:shadow-2xl">
                    <img 
                      src={getAssetUrl(related.slug, related.meta.banner)} 
                      alt={related.meta.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h4 className="font-display font-bold text-xl group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {related.meta.title}
                  </h4>
                  <p className="text-sm text-muted mt-3 line-clamp-2 font-light leading-relaxed">{related.meta.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
