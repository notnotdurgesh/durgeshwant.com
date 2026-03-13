import { useEffect, useRef } from 'react';

export default function AsciiDonut() {
  const preRef = useRef<HTMLPreElement>(null);
  const targetScrollRef = useRef({ scale: 1.5, rotation: 0 });
  const currentScrollRef = useRef({ scale: 1.5, rotation: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let A = 0;
    let B = 0;
    let animationFrameId: number;

    const renderFrame = () => {
      const width = 240;
      const height = 88;
      const size = width * height;
      const b: string[] = new Array(size).fill(' ');
      const z: number[] = new Array(size).fill(0);
      
      for (let j = 0; j < 6.28; j += 0.02) {
        for (let i = 0; i < 6.28; i += 0.005) {
          const c = Math.sin(i);
          const d = Math.cos(j);
          const e = Math.sin(A);
          const f = Math.sin(j);
          const g = Math.cos(A);
          // R1 is thickness (0.35 instead of 0.5), R2 is radius (2.2)
          const R1 = 0.35;
          const R2 = 2.2;
          const h = R1 * d + R2;
          const z_pos = R1 * f;
          const D = 1 / (c * h * e + z_pos * g + 5);
          const l = Math.cos(i);
          const m = Math.cos(B);
          const n = Math.sin(B);
          const t = c * h * g - z_pos * e;
          
          const x = Math.floor(120 + 90 * D * (l * h * m - t * n));
          const y = Math.floor(44 + 45 * D * (l * h * n + t * m));
          const o = x + width * y;
          const N = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
          
          if (y > 0 && y < height && x > 0 && x < width && D > z[o]) {
            z[o] = D;
            const charIndex = N > 0 ? N : 0;
            b[o] = ".,-~:;=!*#$@"[charIndex > 11 ? 11 : charIndex];
          }
        }
      }
      
      let output = '';
      for (let k = 0; k < size; k++) {
        output += k % width === 0 ? '\n' : b[k];
      }
      
      currentScrollRef.current.scale += (targetScrollRef.current.scale - currentScrollRef.current.scale) * 0.05;
      currentScrollRef.current.rotation += (targetScrollRef.current.rotation - currentScrollRef.current.rotation) * 0.05;

      if (preRef.current) {
        preRef.current.textContent = output;
        preRef.current.style.transform = `scale(${currentScrollRef.current.scale}) rotate(${currentScrollRef.current.rotation}deg)`;
      }
      
      A += 0.005 + mouseRef.current.y * 0.005;
      B += 0.0025 + mouseRef.current.x * 0.005;
      
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const progress = Math.max(0, Math.min(scrollY / maxScroll, 1));
          
          targetScrollRef.current = {
            scale: 1.5 + progress * 2.5,
            rotation: progress * 45
          };
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-30 dark:opacity-40 text-primary">
      <pre 
        ref={preRef} 
        className="font-mono text-[3px] sm:text-[4px] md:text-[5px] leading-none tracking-tighter whitespace-pre"
        style={{ 
          transformOrigin: 'center center'
        }}
      />
    </div>
  );
}
