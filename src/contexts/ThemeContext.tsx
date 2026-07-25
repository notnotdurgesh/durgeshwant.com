import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getFaviconUri = (theme: Theme) => {
  const bgColor = theme === 'dark' ? '%2312100e' : '%23fdfbf7';
  const rColor = theme === 'dark' ? 'white' : '%23a67c6d';
  const dColor = theme === 'dark' ? '%23d4a373' : '%237b8c73';

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='${bgColor}' /%3E%3Ctext x='50' y='52' text-anchor='middle' dominant-baseline='central' font-family='Georgia, serif' font-weight='700' font-size='42'%3E%3Ctspan fill='${rColor}'%3ER%3C/tspan%3E%3Ctspan fill='${dColor}'%3ED.%3C/tspan%3E%3C/text%3E%3C/svg%3E`;
};

/**
 * Writes the theme straight to the document.
 *
 * Deliberately not left to an effect: the view transition below snapshots the
 * page the moment its callback returns, so the DOM has to already be in its new
 * state by then. Driving it from useEffect meant the "new" snapshot was
 * captured from the *old* DOM and the circular reveal wiped in a copy of the
 * theme the page was leaving, which is the stray disc that showed up mid-toggle.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;

  const favicon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  if (favicon) favicon.setAttribute('href', getFaviconUri(theme));

  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* Private mode or storage disabled — the theme still applies for this visit. */
  }
}

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  // index.html has already resolved and applied this before first paint; read it
  // back rather than recomputing, so the two can never disagree.
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // Keeps the document in step with any state change that did not come from the
  // toggle (initial mount, React strict-mode double render).
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback((event?: React.MouseEvent) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    const canAnimate =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !!event;

    if (!canAnimate) {
      setTheme(next);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = (
      document as Document & { startViewTransition(cb: () => void): { ready: Promise<void> } }
    ).startViewTransition(() => {
      // flushSync forces React to commit before startViewTransition captures the
      // new snapshot. Without it the callback returns while the update is still
      // queued and the transition animates between two identical frames.
      flushSync(() => {
        applyTheme(next);
        setTheme(next);
      });
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
          {
            duration: 480,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => {
        /* Transition was skipped (e.g. a second toggle mid-flight); the theme is
           already applied, so there is nothing to recover. */
      });
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
