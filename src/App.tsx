import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import { Helmet } from 'react-helmet-async';

import AsciiDonut from './components/AsciiDonut';
import CustomCursor from './components/CustomCursor';
import SidebarNav from './components/SidebarNav';
import ScrollProgress from './components/ScrollProgress';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BlogSection from './components/BlogSection';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { CONFIG, SITE, ALL_SKILLS } from './config';

// The blog carries katex, highlight.js and every post's markdown. Splitting it
// out keeps that weight off the landing page, which is the page that has to be
// fast for a first-time visitor.
const BlogListing = lazy(() => import('./pages/blog/index'));
const BlogPost = lazy(() => import('./pages/blog/[slug]'));

// three.js is ~600kB and drives nothing but a decorative background. Deferring
// it means it never sits on the critical path to first paint.
const Starfield = lazy(() => import('./components/Starfield'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <span className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
    </div>
  );
}

function Portfolio() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>{SITE.title}</title>
        <meta name="description" content={SITE.description} />
        <link rel="canonical" href={`${SITE.url}/`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE.url}/`} />
        <meta property="og:title" content={SITE.title} />
        <meta property="og:description" content={SITE.description} />
        <meta property="og:image" content={`${SITE.url}/og/default.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={CONFIG.personal.name} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE.twitter} />
        <meta name="twitter:creator" content={SITE.twitter} />
        <meta name="twitter:title" content={SITE.title} />
        <meta name="twitter:description" content={SITE.description} />
        <meta name="twitter:image" content={`${SITE.url}/og/default.jpg`} />

        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      </Helmet>

      <Hero />
      <About />
      <Projects />
      <Experience />
      <BlogSection />
      <Contact />
    </motion.div>
  );
}

function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-32"
    >
      <Helmet>
        <title>Page not found | {CONFIG.personal.name}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6">Error 404</p>
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight mb-6 text-balance">
        This page is <span className="italic text-primary/90">unwritten</span>.
      </h1>
      <p className="text-muted font-sans font-light max-w-md mb-10 leading-relaxed">
        The page you were looking for does not exist. It may have been renamed, or it never made it
        past the draft.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-sans text-sm uppercase tracking-widest
                     hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                     focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-opacity"
        >
          Back to the beginning
        </Link>
        <Link
          to="/blog"
          className="px-6 py-3 rounded-full border border-border font-sans text-sm uppercase tracking-widest
                     text-muted hover:text-foreground hover:border-primary/50 focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-primary transition-colors"
        >
          Read the journal
        </Link>
      </div>
    </motion.div>
  );
}

function ScrollToHash() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(location.hash.substring(1));

    // Sections are laid out by GSAP ScrollTrigger (including pinned ones), so the
    // target's final offset is not known on the first frame after a route change.
    // Two rAFs lets layout settle before measuring.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [location, reduceMotion]);

  return null;
}

function PageTransition() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="shutter"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="fixed inset-0 bg-primary z-[100] origin-top pointer-events-none"
      />
      <motion.div
        key="shutter-bg"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
        className="fixed inset-0 bg-background z-[99] origin-bottom pointer-events-none"
      />
    </AnimatePresence>
  );
}

function RootLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isBlogRoute = location.pathname.startsWith('/blog');
  const isBlogPostRoute = /^\/blog\/.+/.test(location.pathname);

  useEffect(() => {
    document.body.classList.toggle('custom-cursor-active', !isBlogPostRoute);
    return () => document.body.classList.remove('custom-cursor-active');
  }, [isBlogPostRoute]);

  // overflow-x-clip below, not -hidden: `hidden` on one axis computes the other
  // axis to `auto`, which turned this into a second scroll container sitting
  // behind the document's own — the source of the duplicated scrollbar.
  return (
    <div className="relative w-full min-h-screen bg-background text-foreground font-sans overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300]
                   focus:px-5 focus:py-3 focus:rounded-full focus:bg-primary focus:text-primary-foreground
                   focus:font-sans focus:text-sm focus:shadow-2xl focus:outline-none
                   focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
      >
        Skip to content
      </a>

      {/*
        The starfield and the ASCII donut are decorative and expensive. On an
        article page they sit behind body copy where they add nothing but cost,
        so they only mount on the portfolio route.
      */}
      {!isBlogRoute && (
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Starfield />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary>
            <AsciiDonut />
          </ErrorBoundary>
        </div>
      )}

      {/* Navigation UI */}
      {!isBlogPostRoute && <CustomCursor />}
      {!isBlogRoute && <SidebarNav />}
      <ThemeToggle />
      <ScrollProgress />

      <main
        id="main-content"
        tabIndex={-1}
        className={`relative z-10 transition-all duration-300 focus:outline-none ${!isBlogRoute ? 'md:pl-16' : ''}`}
      >
        {children}
        <Footer />
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isBlogRoute = location.pathname.startsWith('/blog');
  const reduceMotion = useReducedMotion();

  return (
    <ThemeProvider>
      <ReactLenis
        root
        options={{
          lerp: 0.1,
          duration: 1.5,
          // Smooth-scroll hijacking is disorienting for anyone who has asked the
          // OS for reduced motion, and it fights native reading behaviour on
          // long-form articles.
          smoothWheel: !isBlogRoute && !reduceMotion,
        }}
      >
        <ScrollToHash />
        <PageTransition />
        <RootLayout>
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Portfolio />} />
                  <Route path="/blog" element={<BlogListing />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </RootLayout>
      </ReactLenis>
    </ThemeProvider>
  );
}
