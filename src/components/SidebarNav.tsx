import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, User, Briefcase, Code2, Mail, Moon, Sun, BookOpen } from 'lucide-react';
import { useLenis } from 'lenis/react';

const NAV_ITEMS = [
  { id: 'hero', icon: Home, label: 'Home', href: '/#hero' },
  { id: 'about', icon: User, label: 'About', href: '/#about' },
  { id: 'work', icon: Briefcase, label: 'Projects', href: '/#work' },
  { id: 'skills', icon: Code2, label: 'Skills', href: '/#skills' },
  { id: 'blog', icon: BookOpen, label: 'Blog', href: '/#blog' },
  { id: 'contact', icon: Mail, label: 'Contact', href: '/#contact' },
];

export default function SidebarNav() {
  const location = useLocation();
  const lenis = useLenis();
  const [activeSection, setActiveSection] = useState('hero');
  const [isDark, setIsDark] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // If we are on the home page, handle the scroll manually for a smoother experience
    if (location.pathname === '/' && lenis) {
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        // Update hash in URL without triggering a full page reload or buggy scroll
        window.history.pushState(null, '', `/#${id}`);
        lenis.scrollTo(element, {
          offset: 0,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    }
  };

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
    
    if (location.pathname.startsWith('/blog') && location.pathname !== '/') {
      // Only set active section to blog if we are on the dedicated blog pages
      setActiveSection('blog');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-24 flex-col items-center justify-center z-50 mix-blend-difference text-white">
        <div className="flex flex-col gap-8 relative">
          {NAV_ITEMS.map(({ id, icon: Icon, label, href }) => (
            <Link
              key={id}
              to={href}
              onClick={(e) => handleNavClick(e, id)}
              className="group relative flex items-center justify-center w-12 h-12 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-full"
              aria-label={label}
            >
              <Icon 
                className={`w-5 h-5 transition-all duration-300 ${
                  activeSection === id ? 'opacity-100 scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'
                }`} 
              />
              <span className="absolute left-14 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-sans text-xs uppercase tracking-widest whitespace-nowrap">
                {label}
              </span>
              {activeSection === id && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 border border-white/30 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm glass-panel rounded-full px-6 py-4 shadow-2xl border border-primary/20">
        <div className="flex justify-between items-center">
          {NAV_ITEMS.map(({ id, icon: Icon, href }) => (
            <Link
              key={id}
              to={href}
              onClick={(e) => handleNavClick(e, id)}
              className="relative p-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-full"
              aria-label={id}
            >
              <Icon 
                className={`w-5 h-5 transition-all duration-300 ${
                  activeSection === id ? 'text-primary scale-110' : 'text-muted hover:text-foreground'
                }`} 
              />
              {activeSection === id && (
                <motion.div
                  layoutId="active-nav-mobile"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
