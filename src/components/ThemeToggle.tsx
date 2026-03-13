import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDark = (event: React.MouseEvent) => {
    const isAppearanceTransition = 
      //@ts-ignore
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition) {
      setIsDark(!isDark);
      document.documentElement.classList.toggle('dark');
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    //@ts-ignore
    const transition = document.startViewTransition(async () => {
      setIsDark(!isDark);
      document.documentElement.classList.toggle('dark');
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <button 
      onClick={toggleDark}
      className="fixed top-10 right-6 z-50 p-3 glass-panel rounded-full text-muted hover:text-foreground transition-all shadow-lg border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none hover:scale-110 active:scale-95 cursor-pointer"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <Sun className="w-5 h-5 transition-transform duration-500 rotate-0" /> : <Moon className="w-5 h-5 transition-transform duration-500 -rotate-12" />}
    </button>
  );
}
