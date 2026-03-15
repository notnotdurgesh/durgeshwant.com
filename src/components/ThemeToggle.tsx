import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun, Sparkles, X, Pencil, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';
  const isBlogRoute = location.pathname.startsWith('/blog');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const hasSeenSuggestion = localStorage.getItem('hasSeenThemeSuggestion');
    
    if (!isDark && !hasSeenSuggestion) {
      const timer = setTimeout(() => {
        setShowSuggestion(true);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestion(false);
    }
  }, [isDark]);

  // Listen for sidebar state via body class
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsSidebarOpen(document.body.classList.contains('sidebar-open'));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSuggestion(false);
    localStorage.setItem('hasSeenThemeSuggestion', 'true');
  };

  const handleToggle = (e: React.MouseEvent) => {
    if (showSuggestion) {
      localStorage.setItem('hasSeenThemeSuggestion', 'true');
      setShowSuggestion(false);
    }
    toggleTheme(e);
  };

  return (
    <div 
      className={`fixed top-10 right-6 flex items-center gap-4 transition-all duration-500 ${
        isBlogRoute ? 'z-40' : 'z-50'
      } ${isSidebarOpen ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100'}`}
    >
      <AnimatePresence>
        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 10, filter: 'blur(5px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="bg-card/60 backdrop-blur-xl border border-border/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 min-w-max group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0 relative">
                <Lightbulb className="w-4 h-4 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
              </div>
              
              <div className="flex flex-col pr-2">
                <span className="text-[9px] uppercase tracking-[0.25em] text-muted font-mono font-bold leading-none mb-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary" /> Recommendation
                </span>
                <p className="text-sm font-sans font-medium text-foreground whitespace-nowrap leading-tight tracking-tight">
                  Best experienced in dark mode
                </p>
              </div>
              
              <button 
                onClick={handleDismiss}
                className="ml-1 p-1.5 text-muted hover:text-foreground hover:bg-muted/20 rounded-full transition-all active:scale-95"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Elegant pointer arrow */}
            <div className="absolute top-1/2 -right-[5px] -translate-y-1/2 w-2.5 h-2.5 bg-card/60 backdrop-blur-xl border-t border-r border-border/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleToggle}
        className={`p-3 glass-panel rounded-full transition-all shadow-lg border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none hover:scale-110 active:scale-95 cursor-pointer relative overflow-hidden group
          ${showSuggestion ? 'border-primary shadow-primary/20 text-primary' : 'border-primary/20 text-muted hover:text-foreground'}
        `}
        aria-label="Toggle Dark Mode"
      >
        <motion.div
          animate={{ rotate: isDark ? 0 : -12 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.div>
        
        {/* Subtle pulsing background if suggestion is active */}
        <AnimatePresence>
          {showSuggestion && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" 
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
