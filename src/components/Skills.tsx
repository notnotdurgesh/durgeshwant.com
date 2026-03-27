import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !containerRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      }
    });

    // Rotate the entire constellation slowly
    tl.to(containerRef.current, {
      rotation: 180,
      ease: 'none',
    });

    // Counter-rotate the text so it stays readable
    gsap.utils.toArray('.skill-node').forEach((node: any) => {
      tl.to(node, {
        rotation: -180,
        ease: 'none',
      }, 0);
    });
    
    // Gentle pulse for the center
    gsap.to('.center-core', {
      scale: 1.1,
      opacity: 0.6,
      yoyo: true,
      repeat: -1,
      duration: 3,
      ease: 'sine.inOut'
    });
    
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="skills" className="min-h-screen relative flex items-center justify-center overflow-hidden py-24 px-4">
      <div className="absolute top-12 left-6 md:left-auto md:right-12 z-20">
        <span className="px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-sm uppercase tracking-widest backdrop-blur-md rounded-sm transform rotate-2 inline-block">
          Chapter 4: The Tech Stack
        </span>
      </div>

      <div className="relative w-full max-w-md md:max-w-4xl aspect-square flex items-center justify-center mt-12 md:mt-0">
        {/* Organic Rings (Dashed/Dotted) */}
        <div className="absolute inset-0 border border-dashed border-primary/20 rounded-full scale-[0.4]" />
        <div className="absolute inset-0 border border-dotted border-primary/20 rounded-full scale-[0.65]" />
        <div className="absolute inset-0 border border-dashed border-primary/10 rounded-full scale-[0.9]" />
        
        {/* Center Core */}
        <div className="center-core absolute w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 blur-xl z-0" />
        
        {/* User Photo */}
        <div className="absolute z-10 w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(166,124,109,0.2)]">
          <img
            src="/assets/skills-photo.png"
            alt="Reddy Durgeshwant"
            loading="lazy"
            className="w-full h-full object-cover sepia-[0.2]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Orbiting Skills */}
        <div ref={containerRef} className="absolute inset-0">
          {CONFIG.skills.map((skill, i) => {
            const radius = skill.orbit === 1 ? 20 : skill.orbit === 2 ? 32.5 : 45;
            const x = 50 + radius * Math.cos((skill.angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((skill.angle * Math.PI) / 180);
            
            return (
              <div
                key={i}
                className="absolute w-max -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="skill-node flex flex-col items-center gap-1 md:gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary/60 shadow-sm" />
                  <span className="font-sans text-[10px] md:text-xs uppercase tracking-widest text-foreground bg-background/80 border border-border px-2 py-0.5 md:px-3 md:py-1 rounded-sm whitespace-nowrap shadow-sm">
                    {skill.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
