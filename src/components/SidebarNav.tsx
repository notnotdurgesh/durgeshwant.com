import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, User, Briefcase, Code2, Mail, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'hero',    icon: Home,     label: 'Home',     href: '/#hero' },
  { id: 'about',   icon: User,     label: 'About',    href: '/#about' },
  { id: 'work',    icon: Briefcase,label: 'Projects', href: '/#work' },
  { id: 'skills',  icon: Code2,    label: 'Skills',   href: '/#skills' },
  { id: 'blog',    icon: BookOpen, label: 'Blog',     href: '/#blog' },
  { id: 'contact', icon: Mail,     label: 'Contact',  href: '/#contact' },
];

export default function SidebarNav() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolling, setIsScrolling] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Scroll-tracking via IntersectionObserver ────────────────────────────
  const setupObserver = useCallback(() => {
    // Kill old observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const visibleRatios: Record<string, number> = {};

    const pickMostVisible = () => {
      let best = 'hero';
      let bestRatio = -1;
      for (const [id, ratio] of Object.entries(visibleRatios)) {
        if (ratio > bestRatio) { bestRatio = ratio; best = id; }
      }
      setActiveSection(best);
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleRatios[entry.target.id] = entry.intersectionRatio;
        });
        // Don't override active state while programmatic scroll is in progress
        if (!isScrolling) pickMostVisible();
      },
      {
        root: null,
        // Use rootMargin to bias towards the upper-mid portion of the viewport
        rootMargin: '-10% 0px -50% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });
  }, [isScrolling]);

  useEffect(() => {
    // Blog sub-routes: keep 'blog' active
    if (location.pathname.startsWith('/blog') && location.pathname !== '/') {
      setActiveSection('blog');
      if (observerRef.current) observerRef.current.disconnect();
      return;
    }

    if (location.pathname !== '/') return;

    // Small defer so the DOM is settled after route change
    const tid = setTimeout(setupObserver, 120);
    return () => {
      clearTimeout(tid);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [location.pathname, setupObserver]);

  // ─── Click → smooth-scroll ───────────────────────────────────────────────
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    // Only intercept when we're already on the home page
    if (location.pathname !== '/') return;

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    // Update URL without triggering a reload
    window.history.pushState(null, '', `/#${id}`);

    // Optimistically set active so the indicator snaps immediately
    setActiveSection(id);

    // Pause observer-driven updates during the scroll animation
    setIsScrolling(true);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Re-enable observer updates once scroll settles (~1 s)
    scrollTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1100);
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    if (observerRef.current) observerRef.current.disconnect();
  }, []);

  // ─── Shared render helper ────────────────────────────────────────────────
  const renderNavItem = (
    { id, icon: Icon, label, href }: typeof NAV_ITEMS[0],
    variant: 'desktop' | 'mobile'
  ) => {
    const isActive = activeSection === id;

    if (variant === 'desktop') {
      return (
        <Link
          key={id}
          to={href}
          onClick={(e) => handleNavClick(e, id)}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
        >
          {/* Active ring */}
          <AnimatePresence>
            {isActive && (
              <motion.span
                layoutId="desktop-active-ring"
                className="absolute inset-0 rounded-full border border-white/40"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
          </AnimatePresence>

          {/* Icon */}
          <Icon
            className={`w-5 h-5 transition-all duration-300 ${
              isActive
                ? 'opacity-100 scale-110'
                : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'
            }`}
          />

          {/* Tooltip label */}
          <span
            className="pointer-events-none absolute left-14 whitespace-nowrap
                       text-xs uppercase tracking-widest font-sans
                       opacity-0 -translate-x-2
                       group-hover:opacity-100 group-hover:translate-x-0
                       transition-all duration-250"
          >
            {label}
          </span>
        </Link>
      );
    }

    // Mobile variant
    return (
      <Link
        key={id}
        to={href}
        onClick={(e) => handleNavClick(e, id)}
        className="relative flex flex-col items-center justify-center p-2 min-w-[2.5rem]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
                   rounded-full"
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon
          className={`w-5 h-5 transition-all duration-300 ${
            isActive
              ? 'text-primary scale-110'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        />

        {/* Active dot */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              layoutId="mobile-active-dot"
              className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            />
          )}
        </AnimatePresence>
      </Link>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Desktop: fixed left sidebar ── */}
      <nav
        className="hidden md:flex fixed left-0 top-0 h-screen w-24
                   flex-col items-center justify-center z-50
                   mix-blend-difference text-white"
        aria-label="Main navigation"
      >
        <div className="flex flex-col gap-8">
          {NAV_ITEMS.map((item) => renderNavItem(item, 'desktop'))}
        </div>
      </nav>

      {/* ── Mobile: floating bottom bar ── */}
      <nav
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                   w-[92%] max-w-sm
                   bg-background/80 backdrop-blur-md
                   rounded-full px-4 py-3
                   shadow-2xl shadow-black/20
                   border border-border/40"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between gap-1">
          {NAV_ITEMS.map((item) => renderNavItem(item, 'mobile'))}
        </div>
      </nav>
    </>
  );
}