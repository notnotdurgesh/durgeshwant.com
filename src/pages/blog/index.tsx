import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Clock, ArrowLeft, ArrowRight, Tag, X } from 'lucide-react';
import { format } from 'date-fns';
import { getAllPosts, getAssetUrl } from '../../lib/blog';

export default function BlogListing() {
  const allPosts = getAllPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags sorted by frequency
  const allTags = useMemo(() => {
    const freq: Record<string, number> = {};
    allPosts.forEach(p => p.meta.tags.forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allPosts.filter(post => {
      const matchesSearch = !q || (
        post.meta.title.toLowerCase().includes(q) ||
        post.meta.description.toLowerCase().includes(q) ||
        post.meta.tags.some(tag => tag.toLowerCase().includes(q))
      );
      const matchesTag = !activeTag || post.meta.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [allPosts, searchQuery, activeTag]);

  // Featured post = first/latest
  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  const hasFilters = !!searchQuery || !!activeTag;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-24 px-4 sm:px-6 md:px-12 lg:px-24"
    >
      <Helmet>
        <title>The Journal | Software Engineering Blog</title>
        <meta name="description" content="Thoughts, tutorials, and insights on software engineering, design, and building scalable systems." />
        <meta property="og:title" content="The Journal | Software Engineering Blog" />
        <meta property="og:description" content="Thoughts, tutorials, and insights on software engineering, design, and building scalable systems." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org", "@type": "Blog",
            "name": "The Journal",
            "description": "Thoughts, tutorials, and insights on software engineering, design, and building scalable systems.",
            "url": window.location.href,
            "publisher": { "@type": "Organization", "name": "Portfolio" }
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto">

        {/* ── Back link ── */}
        <Link
          to="/"
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors w-fit mb-4 sm:mb-6 font-mono text-xs uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* ── Header ── */}
        <div className="flex flex-col gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              {/* 
                SMART MOBILE TYPOGRAPHY:
                - mobile:  text-4xl (36px) - bold but fits small screens
                - sm:      text-5xl (48px)
                - md+:     text-7xl (72px)
              */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-3 sm:mb-4 leading-tight">
                The <span className="text-primary italic">Journal</span>
              </h1>
              <p className="text-foreground/70 font-sans font-light text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
                Thoughts, tutorials, and insights on software engineering, design, and building scalable systems.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative w-full md:w-80 lg:w-96 group"
            >
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-full py-3 sm:py-4 pl-11 sm:pl-14 pr-4 sm:pr-8 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm sm:text-base text-foreground placeholder:text-muted shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none z-10">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary/70 group-focus-within:text-primary transition-colors duration-300" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-4 flex items-center text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          </div>

          {/* ── Tag filter pills ── */}
          {allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              <button
                onClick={() => setActiveTag(null)}
                className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.15em] rounded-full border transition-all duration-200
                  ${!activeTag
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                    : 'bg-transparent text-muted border-border/50 hover:border-primary/50 hover:text-foreground'
                  }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.15em] rounded-full border transition-all duration-200
                    ${activeTag === tag
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                      : 'bg-transparent text-muted border-border/50 hover:border-primary/50 hover:text-foreground'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-10 sm:mb-14 md:mb-16" />

        {/* ── Post count / active filter indicator ── */}
        {hasFilters && (
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="text-xs sm:text-sm text-muted font-mono">
              {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
              {activeTag && <> for <span className="text-primary">#{activeTag}</span></>}
              {searchQuery && <> matching <span className="text-primary">"{searchQuery}"</span></>}
            </span>
            <button
              onClick={() => { setSearchQuery(''); setActiveTag(null); }}
              className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 sm:py-24 space-y-4"
          >
            <p className="text-muted font-sans text-base sm:text-lg italic">No articles found.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTag(null); }}
              className="text-xs font-mono uppercase tracking-widest text-primary hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── Featured hero post (only when no filters active or has results) ── */}
            {featuredPost && !hasFilters && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 sm:mb-14 md:mb-16"
              >
                <Link to={`/blog/${featuredPost.slug}`} className="group block focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-[2rem]">
                  <div className="glass-panel rounded-[2rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all shadow-lg hover:shadow-2xl">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="relative md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-muted/10 isolate [perspective:1000px] [contain:paint]">
                        <img
                          src={getAssetUrl(featuredPost.slug, featuredPost.meta.banner)}
                          alt={featuredPost.meta.title}
                          className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 grayscale-[0.2] dark:grayscale-0 group-hover:grayscale-0 transform-gpu [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform [transform:translate3d(0,0,0)]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40 hidden md:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent md:hidden" />
                        {/* Featured badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.2em] bg-primary text-primary-foreground rounded-full shadow-lg">
                            Latest
                          </span>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                            {featuredPost.meta.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] bg-primary/10 text-primary rounded-full border border-primary/20 group-hover:bg-primary group-hover:text-white dark:group-hover:text-background transition-colors duration-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors leading-tight">
                          {featuredPost.meta.title}
                        </h2>
                        <p className="text-foreground/60 font-sans font-light text-sm sm:text-base mb-6 sm:mb-8 line-clamp-3 leading-relaxed">
                          {featuredPost.meta.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted pt-5 sm:pt-6 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>{format(new Date(featuredPost.meta.date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <span>Read article</span>
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* ── Grid posts ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              <AnimatePresence mode="popLayout">
                {(hasFilters ? filteredPosts : gridPosts).map((post, index) => (
                  <motion.div
                    key={post.slug}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.07 }}
                    className="h-full"
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-[2rem]"
                    >
                      <div className="glass-panel rounded-[2rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all h-full flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1.5 sm:hover:-translate-y-2 duration-500">
                        {/* Banner */}
                        <div className="relative aspect-video overflow-hidden bg-muted/10 isolate [perspective:1000px] [contain:paint]">
                          <img
                            src={getAssetUrl(post.slug, post.meta.banner)}
                            alt={post.meta.title}
                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 grayscale-[0.2] dark:grayscale-0 group-hover:grayscale-0 transform-gpu [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform [transform:translate3d(0,0,0)]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
                        </div>

                        {/* Content */}
                        <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-grow">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                            {post.meta.tags.map(tag => (
                              <span key={tag} className="px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] bg-primary/10 text-primary rounded-full border border-primary/20 group-hover:bg-primary group-hover:text-white dark:group-hover:text-background transition-colors duration-300">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {post.meta.title}
                          </h2>

                          <p className="text-foreground/60 font-sans font-light text-sm sm:text-base mb-5 sm:mb-8 line-clamp-3 flex-grow leading-relaxed">
                            {post.meta.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted pt-4 sm:pt-6 border-t border-border/50 mt-auto">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span>{format(new Date(post.meta.date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span>{post.meta.readingTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}