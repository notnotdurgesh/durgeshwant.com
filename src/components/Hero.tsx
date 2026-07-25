import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, ArrowUpRight } from 'lucide-react';
import { CONFIG } from '../config';
import { prefersReducedMotion } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

/** "https://github.com/notnotdurgesh" -> "github.com/notnotdurgesh" */
const GITHUB_HANDLE = CONFIG.personal.links.github.replace(/^https?:\/\//, '').replace(/\/$/, '');

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Wraps the tagline and the GitHub link so both share one entrance.
  const subtitleRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !titleRef.current || !subtitleRef.current || !handRef.current) return;
    // Skipping setup leaves the markup in its natural, fully visible state.
    if (prefersReducedMotion()) return;

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
          scrub: 1,
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
        <div ref={handRef} className="font-mono text-[11px] md:text-xs uppercase tracking-[0.35em] text-primary mb-6 md:mb-8">
          {CONFIG.personal.role}
        </div>

        <h1
          ref={titleRef}
          className="text-[14vw] md:text-[8vw] font-display leading-[0.9] tracking-[-0.02em] mb-8 md:mb-10 text-foreground"
        >
          {CONFIG.personal.name.split(' ')[0]}<br />
          <span className="italic text-primary/85">
            {CONFIG.personal.name.split(' ')[1] || ''}
          </span>
        </h1>

        <div ref={subtitleRef} className="flex flex-col items-center">
          <p className="text-lg md:text-2xl text-muted max-w-xl mx-auto font-sans font-light leading-relaxed text-balance">
            {CONFIG.personal.tagline}
          </p>

          {/*
            GitHub sits here rather than in a call-to-action button: for a
            developer it is the primary evidence, but it should not compete with
            the name for attention. Quiet monospace, muted until hover.
          */}
          <a
            href={CONFIG.personal.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-7 md:mt-9 inline-flex items-center gap-2.5 rounded-full px-3 py-1.5
                       font-mono text-[10px] md:text-[11px] tracking-[0.18em] text-muted
                       border border-border/60 bg-card/25 backdrop-blur-sm
                       hover:text-primary hover:border-primary/40 transition-colors duration-300
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                       focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Github className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{GITHUB_HANDLE}</span>
            <ArrowUpRight
              className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-100
                         group-hover:-translate-y-px group-hover:translate-x-px transition-all duration-300"
              aria-hidden="true"
            />
            <span className="sr-only">(opens GitHub in a new tab)</span>
          </a>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 opacity-40 mt-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary whitespace-nowrap">Scroll</span>
        <div className="w-px h-12 md:h-16 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
