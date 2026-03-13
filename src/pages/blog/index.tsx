import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { getAllPosts, getAssetUrl } from '../../lib/blog';

export default function BlogListing() {
  const allPosts = getAllPosts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = allPosts.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.meta.title.toLowerCase().includes(query) ||
      post.meta.description.toLowerCase().includes(query) ||
      post.meta.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground pt-8 pb-24 px-6 md:px-12 lg:px-24"
    >
      <Helmet>
        <title>The Journal | Software Engineering Blog</title>
        <meta name="description" content="Thoughts, tutorials, and insights on software engineering, design, and building scalable systems." />
        <meta property="og:title" content="The Journal | Software Engineering Blog" />
        <meta property="og:description" content="Thoughts, tutorials, and insights on software engineering, design, and building scalable systems." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "The Journal",
            "description": "Thoughts, tutorials, and insights on software engineering, design, and building scalable systems.",
            "url": window.location.href,
            "publisher": {
              "@type": "Organization",
              "name": "Portfolio"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors w-fit mb-4 font-mono text-sm uppercase tracking-widest group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-4 leading-tight">
              The <span className="text-primary italic">Journal</span>
            </h1>
            <p className="text-foreground/70 font-sans font-light text-xl max-w-xl leading-relaxed">
              Thoughts, tutorials, and insights on software engineering, design, and building scalable systems.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full md:w-96"
          >
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-full py-4 pl-14 pr-8 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-foreground placeholder:text-muted shadow-sm"
            />
          </motion.div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-16" />

        {filteredPosts.length === 0 ? (
          <div className="text-center py-24 text-muted font-sans text-lg italic">
            No articles found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Link to={`/blog/${post.slug}`} className="group block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-[2rem]">
                  <div className="glass-panel rounded-[2rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all h-full flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 duration-500">
                    {/* Banner Image */}
                    <div className="relative aspect-video overflow-hidden bg-muted/10">
                      <img
                        src={getAssetUrl(post.slug, post.meta.banner)}
                        alt={post.meta.title}
                        className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 grayscale-[0.2] dark:grayscale-0 group-hover:grayscale-0"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.meta.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 text-[10px] font-mono uppercase tracking-[0.15em] bg-primary/10 text-primary rounded-full border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-2xl font-display font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {post.meta.title}
                      </h2>
                      
                      <p className="text-foreground/60 font-sans font-light text-base mb-8 line-clamp-3 flex-grow leading-relaxed">
                        {post.meta.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted pt-6 border-t border-border/50 mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(post.meta.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{post.meta.readingTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
