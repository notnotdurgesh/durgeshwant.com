import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Favicon SVG Generation
const getFaviconUri = (theme: Theme) => {
  const bgColor = theme === 'dark' ? '%2312100e' : '%23fdfbf7';
  const rColor = theme === 'dark' ? 'white' : '%23a67c6d';
  const dColor = theme === 'dark' ? '%23d4a373' : '%237b8c73';
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='${bgColor}' /%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='central' font-family='sans-serif' font-weight='900' font-size='50'%3E%3Ctspan fill='${rColor}'%3ER%3C/tspan%3E%3Ctspan fill='${dColor}'%3ED.%3C/tspan%3E%3C/text%3E%3C/svg%3E`;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved) return saved;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    // DYNAMIC FAVICON UPDATE
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('href', getFaviconUri(theme));
    }
  }, [theme]);

  const toggleTheme = (event?: React.MouseEvent) => {
    const isAppearanceTransition =
      // @ts-ignore
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition || !event) {
      setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // @ts-ignore
    const transition = document.startViewTransition(async () => {
      setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
