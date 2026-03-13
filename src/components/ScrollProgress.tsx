import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (location.pathname.startsWith('/blog')) {
    return null;
  }

  return (
    <div className="hidden md:block fixed right-12 top-1/2 -translate-y-1/2 h-64 w-[2px] bg-border z-50 rounded-full overflow-hidden">
      <motion.div
        className="w-full bg-primary origin-top rounded-full"
        style={{ scaleY, height: '100%' }}
      />
      {/* Decorative dots */}
      <div className="absolute -top-4 -left-1 w-2.5 h-2.5 rounded-full border border-primary/50" />
      <div className="absolute -bottom-4 -left-1 w-2.5 h-2.5 rounded-full border border-primary/50 bg-primary/20" />
    </div>
  );
}
