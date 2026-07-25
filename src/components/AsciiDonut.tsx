import { useEffect, useRef } from 'react';

/**
 * Decorative ASCII torus.
 *
 * The rendering cost is deliberately budgeted. The previous version sampled the
 * surface ~394,000 times per frame at an uncapped frame rate (~11ms of main
 * thread work every 16ms, i.e. most of a core, forever, on every route). The
 * grid and step sizes below were checked against the original output: the
 * surface is equally solid at ~66,000 samples, which with a 30fps cap is an
 * order of magnitude less work.
 *
 * It also stops entirely when the tab is hidden, when the element scrolls out
 * of view, and when the user has asked for reduced motion (one static frame).
 */

const WIDTH = 180;
const HEIGHT = 66;
const THETA_STEP = 0.05; // around the tube
const PHI_STEP = 0.012;  // around the ring
const R1 = 0.35;         // tube radius
const R2 = 2.2;          // ring radius
const LUMINANCE = '.,-~:;=!*#$@';
const FRAME_MS = 1000 / 30;

export default function AsciiDonut() {
  const preRef = useRef<HTMLPreElement>(null);
  const targetScrollRef = useRef({ scale: 1.5, rotation: 0 });
  const currentScrollRef = useRef({ scale: 1.5, rotation: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Scratch buffers, allocated once instead of twice per frame.
    const cells = new Uint8Array(WIDTH * HEIGHT);
    const depth = new Float32Array(WIDTH * HEIGHT);
    const line = new Array<string>(WIDTH);

    let A = 0;
    let B = 0;
    let rafId = 0;
    let lastFrame = 0;
    let running = false;
    let visible = true;

    // scrollHeight forces a layout recalculation. Reading it inside the render
    // loop meant thrashing layout every single frame; it is cached instead and
    // only refreshed when the document can actually have changed size.
    let maxScroll = 1;
    const measureScrollRange = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const drawFrame = () => {
      cells.fill(0);
      depth.fill(0);

      const sinA = Math.sin(A);
      const cosA = Math.cos(A);
      const sinB = Math.sin(B);
      const cosB = Math.cos(B);

      for (let theta = 0; theta < 6.28; theta += THETA_STEP) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const ringX = R1 * cosTheta + R2;
        const ringY = R1 * sinTheta;

        for (let phi = 0; phi < 6.28; phi += PHI_STEP) {
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);

          const invZ = 1 / (sinPhi * ringX * sinA + ringY * cosA + 5);
          const t = sinPhi * ringX * cosA - ringY * sinA;

          const x = (90 + 68 * invZ * (cosPhi * ringX * cosB - t * sinB)) | 0;
          const y = (33 + 34 * invZ * (cosPhi * ringX * sinB + t * cosB)) | 0;

          if (x <= 0 || x >= WIDTH || y <= 0 || y >= HEIGHT) continue;

          const idx = x + WIDTH * y;
          if (invZ <= depth[idx]) continue;

          const lum =
            8 *
            ((sinTheta * sinA - sinPhi * cosTheta * cosA) * cosB -
              sinPhi * cosTheta * sinA -
              sinTheta * cosA -
              cosPhi * cosTheta * sinB);

          depth[idx] = invZ;
          cells[idx] = Math.min(11, Math.max(0, lum | 0)) + 1;
        }
      }

      let output = '';
      for (let y = 0; y < HEIGHT; y++) {
        const row = WIDTH * y;
        for (let x = 0; x < WIDTH; x++) {
          const v = cells[row + x];
          line[x] = v === 0 ? ' ' : LUMINANCE[v - 1];
        }
        output += line.join('') + '\n';
      }

      const current = currentScrollRef.current;
      const target = targetScrollRef.current;
      current.scale += (target.scale - current.scale) * 0.05;
      current.rotation += (target.rotation - current.rotation) * 0.05;

      pre.textContent = output;
      pre.style.transform = `scale(${current.scale}) rotate(${current.rotation}deg)`;
    };

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      drawFrame();
      // Doubled per-frame deltas because the frame rate is halved, so the torus
      // turns at exactly the speed it did before the cap.
      A += 0.01 + mouseRef.current.y * 0.01;
      B += 0.005 + mouseRef.current.x * 0.01;
    };

    const start = () => {
      if (running || reduceMotion.matches || !visible || document.hidden) return;
      running = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    let scrollFrame = 0;
    const handleScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        targetScrollRef.current.scale = 1.5 + progress * 2.5;
        targetScrollRef.current.rotation = progress * 45;
      });
    };

    const handleVisibility = () => (document.hidden ? stop() : start());

    const handleResize = () => {
      measureScrollRange();
      handleScroll();
    };

    const handleMotionPreference = () => {
      if (reduceMotion.matches) {
        stop();
        drawFrame();
      } else {
        start();
      }
    };

    // Only animate while the element is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(pre);

    measureScrollRange();
    handleScroll();
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    reduceMotion.addEventListener('change', handleMotionPreference);

    if (reduceMotion.matches) drawFrame();
    else start();

    return () => {
      stop();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      io.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      reduceMotion.removeEventListener('change', handleMotionPreference);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-30 dark:opacity-40 text-primary"
      aria-hidden="true"
    >
      <pre
        ref={preRef}
        className="font-mono text-[4px] sm:text-[5px] md:text-[7px] leading-none tracking-tighter whitespace-pre"
        style={{ transformOrigin: 'center center' }}
      />
    </div>
  );
}
