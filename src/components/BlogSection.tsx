import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllPosts, getAssetUrl } from '../lib/blog';

export default function BlogSection() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section id="blog" className="py-24 relative px-6 md:px-12 lg:px-24 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-sm uppercase tracking-widest backdrop-blur-md rounded-sm transform -rotate-2 inline-block mb-6">
              Chapter 4: The Journal
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase">
              Latest <span className="text-primary italic">Writings</span>
            </h2>
          </div>
          <Link to="/blog" className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors border-b border-transparent hover:border-primary pb-1">
            View All Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-2xl">
              <div className="glass-panel rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-colors h-full flex flex-col shadow-lg">
                <div className="relative aspect-video overflow-hidden bg-muted/10">
                  <img
                    src={getAssetUrl(post.slug, post.meta.banner)}
                    alt={post.meta.title}
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 sepia-[0.2] group-hover:sepia-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.meta.title}
                  </h3>
                  <p className="text-muted font-sans font-light text-sm line-clamp-3">
                    {post.meta.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
