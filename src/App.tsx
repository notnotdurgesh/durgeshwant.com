/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ReactLenis, useLenis } from 'lenis/react';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
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
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BlogListing from './pages/blog/index';
import BlogPost from './pages/blog/[slug]';
import BlogSection from './components/BlogSection';
import ThemeToggle from './components/ThemeToggle';

import ErrorBoundary from './components/ErrorBoundary';

function Portfolio() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Hero />
      <About />
      <Projects />
      <Skills />
      <BlogSection />
      <Contact />
    </motion.div>
  );
}

function GsapSync() {
  const lenis = useLenis(ScrollTrigger.update);
  
  useEffect(() => {
    if (!lenis) return;
    
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      gsap.ticker.remove(update);
    };
  }, [lenis]);
  
  return null;
}

function ScrollToHash() {
  const location = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (location.hash && lenis) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        // Small delay to ensure any layout shifts or animations have settled
        const timeoutId = setTimeout(() => {
          lenis.scrollTo(element, {
            offset: 0, // Remove offset to ensure section lands exactly at top for pinning/snapping
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            immediate: false,
          });
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    } else if (!location.hash && lenis) {
      // If no hash and we just changed page, scroll to top
      lenis.scrollTo(0, { duration: 1, immediate: true });
    }
  }, [location, lenis]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isBlogRoute = location.pathname.startsWith('/blog');

  return (
    <HelmetProvider>
      <ReactLenis root autoRaf={false} options={{ lerp: 0.05, smoothWheel: true }}>
        <GsapSync />
        <ScrollToHash />
        <div className="relative w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white overflow-x-hidden">
          
          {/* Fixed 3D Background */}
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

          {/* Custom Cursor & Nav */}
          <CustomCursor />
          {!isBlogRoute && <SidebarNav />}
          <ThemeToggle />
          <ScrollProgress />
          
          {/* Main Scrolling Content */}
          <main className={`relative z-10 transition-all duration-300 ${!isBlogRoute ? 'md:pl-16' : ''}`}>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Portfolio />} />
                  <Route path="/blog" element={<BlogListing />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                </Routes>
              </AnimatePresence>
            </ErrorBoundary>
            <Footer />
          </main>
          
        </div>
      </ReactLenis>
    </HelmetProvider>
  );
}
