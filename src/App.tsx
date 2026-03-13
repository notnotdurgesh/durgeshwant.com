/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

gsap.registerPlugin(ScrollTrigger);

function Portfolio() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="scroll-snap-start"><Hero /></div>
      <div className="scroll-snap-start"><About /></div>
      <div className="scroll-snap-start"><Projects /></div>
      <div className="scroll-snap-start"><Skills /></div>
      <div className="scroll-snap-start"><BlogSection /></div>
      <div className="scroll-snap-start"><Contact /></div>
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
        // Use native smooth scroll for hash links
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isBlogRoute = location.pathname.startsWith('/blog');
  const isBlogPostRoute = location.pathname.match(/^\/blog\/.+/);

  useEffect(() => {
    // Handle Scroll Snapping
    if (location.pathname === '/') {
      document.documentElement.classList.add('scroll-snap-container');
    } else {
      document.documentElement.classList.remove('scroll-snap-container');
    }

    // Handle Custom Cursor visibility
    if (!isBlogPostRoute) {
      document.body.classList.add('custom-cursor-active');
    } else {
      document.body.classList.remove('custom-cursor-active');
    }

    return () => {
      document.documentElement.classList.remove('scroll-snap-container');
      document.body.classList.remove('custom-cursor-active');
    };
  }, [location.pathname, isBlogPostRoute]);

  return (
    <HelmetProvider>
      <ScrollToHash />
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

      <div className={`relative w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white overflow-x-hidden`}>
        
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
        {!isBlogPostRoute && <CustomCursor />}
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
    </HelmetProvider>
  );
}
