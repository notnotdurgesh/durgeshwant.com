import { useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  
  const scale = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* Mobile/Tablet & All Blog pages: Horizontal Progress Line at the very top */}
      <div className={`${location.pathname.startsWith('/blog') ? 'block' : 'md:hidden'} fixed top-0 left-0 right-0 h-[2px] bg-border/20 z-[100] overflow-hidden`}>
        <motion.div
          className="h-full bg-primary origin-left"
          style={{ scaleX: scale }}
        />
      </div>

      {/* Desktop Portfolio: Vertical Progress Line on the right */}
      {!location.pathname.startsWith('/blog') && (
        <div className="hidden md:block fixed right-12 top-1/2 -translate-y-1/2 h-64 w-[2px] bg-border z-50 rounded-full overflow-hidden">
          <motion.div
            className="w-full bg-primary origin-top rounded-full"
            style={{ scaleY: scale, height: '100%' }}
          />
          {/* Decorative dots */}
          <div className="absolute -top-4 -left-1 w-2.5 h-2.5 rounded-full border border-primary/50" />
          <div className="absolute -bottom-4 -left-1 w-2.5 h-2.5 rounded-full border border-primary/50 bg-primary/20" />
        </div>
      )}
    </>
  );
}
