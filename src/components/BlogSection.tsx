import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllPosts, getAssetUrl } from '../lib/blog';

export default function BlogSection() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section id="blog" className="py-32 relative px-6 md:px-12 lg:px-24 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-sm uppercase tracking-widest backdrop-blur-md rounded-sm transform -rotate-2 inline-block mb-6">
              Chapter 4: The Journal
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase leading-tight text-foreground">
              Latest <span className="text-primary italic">Writings</span>
            </h2>
          </div>
          <Link to="/blog" className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all group">
            Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-[2rem]">
              <div className="glass-panel rounded-[2rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all h-full flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 duration-500">
                <div className="relative aspect-video overflow-hidden bg-muted/10 isolate [perspective:1000px] [contain:paint]">
                  <img
                    src={getAssetUrl(post.slug, post.meta.banner)}
                    alt={post.meta.title}
                    loading="lazy"
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 grayscale-[0.2] dark:grayscale-0 group-hover:grayscale-0 transform-gpu [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform [transform:translate3d(0,0,0)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight text-foreground">
                    {post.meta.title}
                  </h3>
                  <p className="text-foreground/60 font-sans font-light text-base line-clamp-3 leading-relaxed">
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
