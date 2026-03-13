import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const handRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !titleRef.current || !subtitleRef.current || !handRef.current) return;
    
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2, delay: 0.3 }
    )
    .fromTo(
      handRef.current,
      { opacity: 0, rotation: -5, scale: 0.95 },
      { opacity: 1, rotation: 0, scale: 1, duration: 1.5 },
      '-=1.2'
    )
    .fromTo(
      subtitleRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1.5 },
      '-=1'
    );

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      gsap.to(containerRef.current, {
        yPercent: 20,
        opacity: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    });

    mm.add("(max-width: 767px)", () => {
      gsap.to(containerRef.current, {
        yPercent: 5,
        opacity: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        }
      });
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      id="hero" 
      className="min-h-[100svh] flex flex-col items-center justify-between relative px-6 text-center pt-32 pb-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-5xl mx-auto">
        <div ref={handRef} className="font-mono text-sm md:text-base uppercase tracking-widest text-primary mb-4 md:mb-6 opacity-90">
          welcome, I'm
        </div>
        
        <h1 
          ref={titleRef}
          className="text-[14vw] md:text-[7vw] font-display font-light leading-[0.9] tracking-tight mb-6 md:mb-8 text-foreground mt-4 md:mt-0"
        >
          {CONFIG.personal.name.split(' ')[0]}<br />
          <span className="italic text-primary/80">
            {CONFIG.personal.name.split(' ')[1] || ''}
          </span>
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-lg md:text-2xl text-muted max-w-2xl mx-auto font-sans font-light leading-relaxed tracking-wide"
        >
          {CONFIG.personal.tagline}
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-4 opacity-40 mt-8">
        <span className="font-mono text-sm uppercase tracking-widest text-primary whitespace-nowrap">scroll to explore</span>
        <div className="w-[1px] h-12 md:h-16 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
