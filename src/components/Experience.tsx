import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { CONFIG } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelinePathRef = useRef<HTMLDivElement>(null);

  // 1. Framer Motion for Ultra-Smooth "Liquid" Tracking
  // This matches the exact spring physics of the global ScrollProgress component
  const { scrollYProgress } = useScroll({
    target: timelinePathRef,
    offset: ["start 45%", "end 55%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const ballY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // 2. Entrance Animations for Items
    const items = gsap.utils.toArray('.experience-item');
    items.forEach((item: any) => {
      gsap.fromTo(item,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 3. Background Parallax
    gsap.to('.experience-bg-text', {
      xPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

  }, { scope: sectionRef });

  return (
    <section id="experience" ref={sectionRef} className="py-24 md:py-40 relative px-4 sm:px-8 md:px-12 lg:px-24 overflow-hidden">
      {/* Cinematic Background Text */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap pointer-events-none opacity-[0.02] dark:opacity-[0.05] z-0">
        <span className="experience-bg-text text-[40vw] md:text-[30vw] font-display font-bold uppercase tracking-tighter inline-block">
          Experience Path Journey
        </span>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-20 md:mb-32">
          <div>
            <span className="px-3 md:px-4 py-1 sm:py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] md:text-sm uppercase tracking-widest backdrop-blur-md rounded-sm transform rotate-1 md:rotate-2 inline-block mb-4 md:mb-6">
              Chapter 3: The Path
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-display font-bold tracking-tighter uppercase leading-none text-foreground">
              Professional <span className="text-primary italic">Chronicles</span>
            </h2>
          </div>
          <p className="text-muted font-mono text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em]">
            2024 - Present
          </p>
        </div>

        <div className="relative pl-8 md:pl-0">
          {/* THE PATH: Vertical Timeline Line Container */}
          <div 
            ref={timelinePathRef}
            className="absolute left-0 md:left-1/2 top-4 bottom-4 w-[2px] bg-border/20 md:-translate-x-1/2 overflow-visible"
          >
            {/* 4. Progress Fill (Framer Motion) */}
            <motion.div 
              style={{ scaleY: smoothProgress, originY: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-primary via-primary/50 to-transparent"
            />
            
            {/* 5. The Liquid Ball (Framer Motion) */}
            <motion.div 
              style={{ top: ballY }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 rounded-full bg-primary shadow-[0_0_30px_rgba(var(--color-primary),0.8)] z-30"
            >
              <div className="absolute inset-1.5 rounded-full bg-white/30" />
            </motion.div>
          </div>

          {(CONFIG.experience as any[]).map((exp, index) => (
            <div 
              key={index} 
              className={`experience-item relative flex flex-col md:flex-row items-start md:items-center justify-between mb-20 md:mb-48 last:mb-0 ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Static background marker */}
              <div className="absolute left-[-4px] md:left-1/2 top-2 md:top-1/2 w-2 h-2 rounded-full bg-border/40 transform md:-translate-x-1/2 md:-translate-y-1/2 z-10" />

              {/* Content Card */}
              <div className="w-full md:w-[42%] group">
                <div className="glass-panel p-6 md:p-12 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-700 hover:shadow-[0_20px_80px_-20px_rgba(var(--color-primary),0.2)] hover:-translate-y-3 relative overflow-hidden isolate">
                  <span className="absolute -right-4 -top-8 text-8xl md:text-[10rem] font-display font-bold opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                    0{CONFIG.experience.length - index}
                  </span>

                  <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-card flex items-center justify-center border border-border group-hover:border-primary/50 transition-all duration-500 shrink-0 shadow-lg overflow-hidden relative">
                      {exp.logo ? (
                        <img 
                          src={exp.logo} 
                          alt={exp.company} 
                          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                      )}
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl md:text-3xl font-display font-bold text-foreground leading-tight mb-1 truncate">
                        {exp.role}
                      </h3>
                      <p className="text-primary font-mono text-[10px] md:text-sm uppercase tracking-widest truncate font-bold">
                        {exp.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 md:gap-6 mb-6 md:mb-10 text-[10px] md:text-xs font-mono text-muted uppercase tracking-widest border-y border-border/30 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      {exp.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      Remote
                    </div>
                  </div>

                  <p className="text-foreground/70 font-sans font-light leading-relaxed text-sm md:text-lg">
                    {exp.description}
                  </p>

                  <div className="absolute bottom-6 right-10 w-12 md:w-24 h-[1px] bg-primary/20 group-hover:bg-primary transition-all duration-1000" />
                </div>
              </div>

              <div className="hidden md:block md:w-[42%]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
