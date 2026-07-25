import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config';
import { prefersReducedMotion } from '../lib/motion';
import SectionLabel from './SectionLabel';

gsap.registerPlugin(ScrollTrigger);

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

const ScrambleText = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState(text);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    // Scrambling text is exactly the kind of motion reduced-motion users opt out
    // of, and it makes the word unreadable while it runs.
    if (!el || prefersReducedMotion()) return;

    let interval: ReturnType<typeof setInterval> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || interval) return;

        let iteration = 0;
        interval = setInterval(() => {
          if (iteration >= text.length) {
            clearInterval(interval);
            setDisplay(text);
            observer.disconnect();
            return;
          }
          setDisplay(
            text
              .split('')
              .map((_, index) =>
                index < iteration ? text[index] : chars[Math.floor(Math.random() * chars.length)]
              )
              .join('')
          );
          iteration += 1 / 3;
        }, 150);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      // Without this the interval kept setting state after unmount.
      if (interval) clearInterval(interval);
      observer.disconnect();
    };
  }, [text]);

  return (
    <span ref={spanRef} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
};

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const tapeY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  useGSAP(() => {
    if (!containerRef.current || !textRef.current || !imageRef.current) return;
    // Skipping setup leaves the section unpinned and fully visible.
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Create a timeline that handles the entry more gracefully
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.5, // Reduced scrub for more immediate response
          anticipatePin: 1,
        }
      });

      // Start with a small progress so it's not completely invisible at start
      tl.fromTo(
        textRef.current,
        { opacity: 0, x: -30, filter: 'blur(8px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }
      )
      .fromTo(
        imageRef.current,
        { opacity: 0, y: 30, rotation: -2, filter: 'blur(8px)' },
        { opacity: 1, y: 0, rotation: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
        '<0.1'
      )
      // Add a hold in the middle so content stays visible while scrolling
      .to({}, { duration: 2 }) 
      .to(textRef.current, { opacity: 0, y: -20, filter: 'blur(4px)', duration: 1, ease: 'power2.in' })
      .to(imageRef.current, { opacity: 0, scale: 1.05, filter: 'blur(4px)', duration: 1, ease: 'power2.in' }, '<');
    });

    mm.add("(max-width: 767px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: 0.5,
        }
      });

      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 30, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }
      )
      .fromTo(
        imageRef.current,
        { opacity: 0, y: 30, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
        '<0.2'
      );
    });
  }, { scope: containerRef });

  return (
    <div id="about-wrapper" className="w-full">
      <section ref={containerRef} id="about" className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-24">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-accent/20 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center w-full z-10">
          
          <div ref={textRef} className="space-y-6 md:space-y-8">
            <SectionLabel index={1}>About</SectionLabel>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display tracking-[-0.015em] leading-[1.05] text-foreground text-balance">
              I build systems that <br />
              <span className="italic text-primary/90">
                <ScrambleText text="hold up" />
              </span>
            </h2>
            <p className="text-base md:text-xl text-muted leading-relaxed max-w-lg font-sans font-light">
              {CONFIG.personal.about}
            </p>
            <div className="flex gap-6 font-sans text-xs md:text-sm pt-4">
              <div className="glass-panel p-4 md:p-5 rounded-sm shadow-sm border-b border-r border-primary/10">
                <span className="block text-primary text-2xl md:text-3xl mb-1 font-display">4+</span>
                <span className="text-muted uppercase tracking-widest text-[10px] md:text-xs">Years Coding</span>
              </div>
              <div className="glass-panel p-4 md:p-5 rounded-sm shadow-sm border-b border-r border-primary/10">
                <span className="block text-primary text-2xl md:text-3xl mb-1 font-display">35+</span>
                <span className="text-muted uppercase tracking-widest text-[10px] md:text-xs">Projects Shipped</span>
              </div>
            </div>
          </div>

          <div ref={imageRef} className="relative aspect-[4/5] w-full max-w-sm md:max-w-md mx-auto md:ml-auto glass-panel p-3 md:p-4 rounded-sm shadow-xl border border-border group mt-8 md:mt-0 transform rotate-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent z-10 mix-blend-multiply" />
            <img
              src="/assets/about-image.webp"
              alt="Luffy waving and smiling"
              loading="lazy"
              className="w-full h-full object-cover sepia-[0.4] group-hover:sepia-[0.2] transition-all duration-1000 scale-100 group-hover:scale-105"
            />
            {/* Linen tape detail */}
            <motion.div 
              style={{ y: tapeY }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#fdfbf7]/60 backdrop-blur-sm transform rotate-[-2deg] shadow-sm z-20 border border-border/50" 
            />
          </div>

        </div>
      </section>
    </div>
  );
}
