import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import AsciiDonut from './components/AsciiDonut';
import Starfield from './components/Starfield';
import CustomCursor from './components/CustomCursor';
import SidebarNav from './components/SidebarNav';
import ScrollProgress from './components/ScrollProgress';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BlogListing from './pages/blog/index';
import BlogPost from './pages/blog/[slug]';
import BlogSection from './components/BlogSection';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

import { Helmet } from 'react-helmet-async';

function Portfolio() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>Reddy Durgeshwant | SWE & AI Engineer</title>
        <meta name="description" content="Portfolio of Reddy Durgeshwant, a passionate Software Engineer and AI Engineer specializing in building scalable web applications, AI integration, and modern UI/UX." />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://durgeshwant.com/" />
        <meta property="og:title" content="Reddy Durgeshwant | Software Engineer & AI Engineer" />
        <meta property="og:description" content="Portfolio of Reddy Durgeshwant, a passionate Software Engineer and CTO specializing in building scalable web applications, AI integration, and modern UI/UX." />
        <meta property="og:image" content="https://durgeshwant.com/assets/about-image.png" />
        <meta property="og:site_name" content="Reddy Durgeshwant Portfolio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@itsdurgesh" />
        <meta name="twitter:creator" content="@itsdurgesh" />
        <meta name="twitter:title" content="Reddy Durgeshwant | Software Engineer & AI Engineer" />
        <meta name="twitter:description" content="Portfolio of Reddy Durgeshwant, a passionate Software Engineer and CTO specializing in building scalable web applications, AI integration, and modern UI/UX." />
        <meta name="twitter:image" content="https://durgeshwant.com/assets/about-image.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "dateCreated": "2024-01-01T12:00:00-05:00",
            "dateModified": new Date().toISOString(),
            "mainEntity": {
              "@type": "Person",
              "name": "Reddy Durgeshwant",
              "jobTitle": "SWE & AI Engineer",
              "description": "A passionate Software Engineer and AI Engineer specializing in building scalable web applications.",
              "url": "https://durgeshwant.com",
              "sameAs": [
                "https://github.com/notnotdurgesh",
                "https://www.linkedin.com/in/itsdurgesh/"
              ]
            }
          })}
        </script>
      </Helmet>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <BlogSection />
      <Contact />
    </motion.div>
  );
}

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

function PageTransition() {
  return (
    <AnimatePresence mode="wait">
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
  const isBlogPostRoute = location.pathname.match(/^\/blog\/.+/);

  useEffect(() => {
    if (!isBlogPostRoute) {
      document.body.classList.add('custom-cursor-active');
    } else {
      document.body.classList.remove('custom-cursor-active');
    }

    return () => {
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isBlogPostRoute]);

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ErrorBoundary>
          <Starfield />
        </ErrorBoundary>
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ErrorBoundary>
          <AsciiDonut />
        </ErrorBoundary>
      </div>

      {/* Navigation UI */}
      {!isBlogPostRoute && <CustomCursor />}
      {!isBlogRoute && <SidebarNav />}
      <ThemeToggle />
      <ScrollProgress />

      {/* Main Content */}
      <main className={`relative z-10 transition-all duration-300 ${!isBlogRoute ? 'md:pl-16' : ''}`}>
        {children}
        <Footer />
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isBlogRoute = location.pathname.startsWith('/blog');

  return (
    <HelmetProvider>
      <ThemeProvider>
        <ReactLenis root options={{ 
          lerp: 0.1, 
          duration: 1.5,
          smoothWheel: !isBlogRoute, // Disable Lenis smooth scroll on blog routes as requested
        }}>
          <ScrollToHash />
          <PageTransition />
          <RootLayout>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Portfolio />} />
                  <Route path="/blog" element={<BlogListing />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                </Routes>
              </AnimatePresence>
            </ErrorBoundary>
          </RootLayout>
        </ReactLenis>
      </ThemeProvider>
    </HelmetProvider>
  );
}
