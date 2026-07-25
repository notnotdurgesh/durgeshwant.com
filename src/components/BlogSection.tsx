import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllPosts, getAssetUrl } from '../lib/blog';
import SectionLabel from './SectionLabel';

export default function BlogSection() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section id="blog" className="py-20 sm:py-28 md:py-32 relative px-5 sm:px-6 md:px-12 lg:px-24 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-14 md:mb-16">
          <div>
            <SectionLabel index={4} className="mb-4 sm:mb-6">Writing</SectionLabel>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display tracking-[-0.015em] leading-[1.05] text-foreground text-balance">
              Notes on things I've <span className="text-primary italic">taken apart</span>
            </h2>
          </div>
          <Link to="/blog" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all group shrink-0">
            All posts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* sm:grid-cols-2 fills the gap between a single stacked column and the
            three-across desktop layout, where one card previously stretched to
            the full width of a tablet. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-3xl sm:rounded-[2rem]">
              <div className="glass-panel rounded-3xl sm:rounded-[2rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all h-full flex flex-col shadow-lg hover:shadow-2xl md:hover:-translate-y-2 duration-500">
                <div className="relative aspect-video overflow-hidden bg-muted/10 isolate [perspective:1000px] [contain:paint]">
                  <img
                    src={getAssetUrl(post.slug, post.meta.banner)}
                    alt={post.meta.title}
                    loading="lazy"
                    className="w-full h-full object-cover scale-100 group-hover:scale-[1.04] transition-transform duration-1000 grayscale-[0.2] dark:grayscale-0 group-hover:grayscale-0 transform-gpu [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform [transform:translate3d(0,0,0)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
                </div>
                <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-[1.15] text-foreground">
                    {post.meta.title}
                  </h3>
                  <p className="text-foreground/60 font-sans font-light text-sm sm:text-base line-clamp-3 leading-relaxed">
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
