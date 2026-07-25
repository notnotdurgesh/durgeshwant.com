import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Imperative check, for use inside GSAP setup where a hook value is not handy.
 *
 * The scroll-driven sections animate *from* a hidden state, so the correct
 * reduced-motion behaviour is to skip GSAP setup entirely: the markup then
 * renders in its natural, fully visible state with no scroll hijacking.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}

/** Reactive version for components that need to change what they render. */
export function useReducedMotionPreference(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
