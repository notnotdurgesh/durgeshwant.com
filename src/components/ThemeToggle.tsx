import { useState, useEffect } from 'react';
import { Moon, Sun, PencilLine, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the suggestion or if they are in dark mode
    const hasSeenSuggestion = localStorage.getItem('hasSeenThemeSuggestion');
    
    if (!isDark && !hasSeenSuggestion) {
      const timer = setTimeout(() => {
        setShowSuggestion(true);
      }, 2000); // Show after 2 seconds of being in light mode
      return () => clearTimeout(timer);
    } else {
      setShowSuggestion(false);
    }
  }, [isDark]);

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
    <div className="fixed top-10 right-6 z-50 flex items-center gap-4">
      <AnimatePresence>
        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="relative"
          >
            <div className="bg-background/80 backdrop-blur-md border border-primary/20 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[200px] group">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <PencilLine className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-mono leading-none mb-1">PRO TIP</span>
                <p className="text-sm font-hand text-foreground/90 whitespace-nowrap">
                  Looks better in dark mode...
                </p>
              </div>
              <button 
                onClick={handleDismiss}
                className="ml-2 p-1 hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3 text-muted" />
              </button>

              {/* Decorative "Pencil Scribble" underline */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -bottom-1 left-4 right-8 h-[2px] bg-primary/30 origin-left rounded-full"
                style={{ filter: 'blur(0.5px)' }}
              />
            </div>
            
            {/* Arrow pointing to toggle */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-2 bg-background border-t border-r border-primary/20 rotate-45 backdrop-blur-md" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleToggle}
        className="p-3 glass-panel rounded-full text-muted hover:text-foreground transition-all shadow-lg border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none hover:scale-110 active:scale-95 cursor-pointer relative overflow-hidden group"
        aria-label="Toggle Dark Mode"
      >
        <motion.div
          animate={{ rotate: isDark ? 0 : -12 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.div>
        
        {/* Subtle glow effect on the button when suggestion is active */}
        {showSuggestion && (
          <span className="absolute inset-0 bg-primary/20 animate-pulse pointer-events-none" />
        )}
      </button>
    </div>
  );
}
