import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { CONFIG } from '../config';
import { prefersReducedMotion } from '../lib/motion';
import SectionLabel from './SectionLabel';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelinePathRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: timelinePathRef,
    offset: ['start 50%', 'end 50%'],
  });

  // The marker used to run through a stiffness:100 / damping:30 spring, which
  // is a ~300ms settle — enough that it visibly trailed the scroll and sat
  // above the card it was meant to be marking. Lenis already smooths the scroll
  // itself, so the marker only needs enough spring to take the edge off a
  // wheel-notch jump, not to re-interpolate the whole motion.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 900,
    damping: 60,
    mass: 0.18,
    restDelta: 0.0005,
  });

  const markerY = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  /*
   * A card is "reached" when its midpoint crosses the middle of the viewport —
   * which is exactly where the marker rides, because the scroll offset above is
   * anchored to 50%. Collapsing the root box to that single line with a
   * -50%/-50% rootMargin means the observer fires precisely on contact, with no
   * per-frame measurement.
   */
  useEffect(() => {
    const cards = itemRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = cards.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;
    if (prefersReducedMotion()) return;

    gsap.utils.toArray<HTMLElement>('.experience-item').forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none reverse' },
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-labelledby="experience-heading"
      className="py-20 sm:py-24 md:py-40 relative px-5 sm:px-8 md:px-12 lg:px-24"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-20 md:mb-32">
          <div>
            <SectionLabel index={3} className="mb-6">Experience</SectionLabel>
            <h2
              id="experience-heading"
              className="text-4xl sm:text-5xl md:text-7xl font-display tracking-[-0.02em] leading-[1.02] text-foreground text-balance"
            >
              Where I've <span className="text-primary italic">worked</span>
            </h2>
          </div>
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted tabular-nums shrink-0">
            2024 — Present
          </p>
        </div>

        <div className="relative pl-8 md:pl-0">
          {/* Timeline rail */}
          <div
            ref={timelinePathRef}
            className="absolute left-0 md:left-1/2 top-4 bottom-4 w-px bg-border md:-translate-x-1/2"
            aria-hidden="true"
          >
            <motion.div
              style={{ scaleY: smoothProgress, originY: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary/30"
            />

            {/* Travelling marker */}
            <motion.div
              style={{ top: markerY }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <span className="relative block w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-primary
                               shadow-[0_0_0_4px_var(--color-background),0_0_22px_color-mix(in_srgb,var(--color-primary)_70%,transparent)]">
                <span className="absolute inset-[3px] rounded-full bg-primary-foreground/45" />
              </span>
            </motion.div>
          </div>

          {CONFIG.experience.map((exp, index) => {
            const isActive = activeIndex === index;

            return (
              <div
                key={`${exp.company}-${exp.date}`}
                ref={(el) => { itemRefs.current[index] = el; }}
                className={`experience-item relative flex flex-col md:flex-row items-start md:items-center
                            justify-between mb-20 md:mb-40 last:mb-0
                            ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Static notch on the rail, filled once the marker has arrived */}
                <span
                  aria-hidden="true"
                  className={`absolute left-[-4.5px] md:left-1/2 top-2 md:top-1/2 w-2 h-2 rounded-full
                              transform md:-translate-x-1/2 md:-translate-y-1/2 z-10
                              transition-colors duration-500
                              ${isActive ? 'bg-primary' : 'bg-border'}`}
                />

                <div className="w-full md:w-[44%] group" aria-current={isActive ? 'step' : undefined}>
                  <article
                    data-active={isActive || undefined}
                    className="glass-panel relative isolate overflow-hidden rounded-2xl
                               p-5 sm:p-6 md:p-10 border border-border/60
                               transition-[transform,border-color,box-shadow] duration-500 ease-out
                               data-active:border-primary/55
                               data-active:shadow-[0_24px_70px_-30px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]
                               md:data-active:-translate-y-1.5
                               motion-reduce:transition-none motion-reduce:md:data-active:translate-y-0"
                  >
                    {/*
                      Accent that sweeps across the top edge as the marker
                      arrives — the card acknowledging contact rather than
                      changing size and shoving the text around.
                    */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r
                                 from-primary via-primary to-transparent
                                 scale-x-0 data-active:scale-x-100
                                 transition-transform duration-700 ease-out
                                 motion-reduce:transition-none"
                      data-active={isActive || undefined}
                    />

                    {/* Index watermark. Kept inside the padding box: at
                        -right-4/-top-8 it was clipped by overflow-hidden and
                        rendered as a half-visible glyph. */}
                    <span
                      aria-hidden="true"
                      className={`absolute right-4 top-2 font-display text-4xl sm:text-5xl md:text-7xl leading-none
                                  pointer-events-none select-none tabular-nums
                                  transition-opacity duration-700
                                  ${isActive ? 'opacity-[0.09]' : 'opacity-[0.035]'}`}
                    >
                      {String(CONFIG.experience.length - index).padStart(2, '0')}
                    </span>

                    <div className="flex items-start gap-4 md:gap-5 mb-6 md:mb-8 relative">
                      <div
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white dark:bg-card
                                    flex items-center justify-center border shrink-0 shadow-sm
                                    overflow-hidden transition-colors duration-500
                                    ${isActive ? 'border-primary/50' : 'border-border'}`}
                      >
                        {exp.logo ? (
                          <img
                            src={exp.logo}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <Briefcase className="w-6 h-6 text-primary" aria-hidden="true" />
                        )}
                      </div>

                      {/* min-w-0 + pr keeps long roles wrapping instead of being
                          truncated — "Open-Source Contributor" was rendering as
                          "Open-Source Contri…". */}
                      <div className="min-w-0 pr-11 sm:pr-16 md:pr-24">
                        <h3 className="text-xl md:text-2xl font-display text-foreground leading-[1.15] mb-1.5 text-balance">
                          {exp.role}
                        </h3>
                        <p className="text-primary font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em]">
                          {exp.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 md:mb-8 text-[10px] md:text-[11px]
                                    font-mono text-muted uppercase tracking-[0.18em]
                                    border-y border-border/50 py-3.5">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary/60" aria-hidden="true" />
                        {exp.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary/60" aria-hidden="true" />
                        Remote
                      </span>
                    </div>

                    <p className="text-foreground/70 font-sans font-light leading-relaxed text-sm md:text-base">
                      {exp.description}
                    </p>

                    {exp.skills?.length ? (
                      <ul className="flex flex-wrap gap-2 mt-6">
                        {exp.skills.map((skill) => (
                          <li
                            key={skill.name}
                            className="px-2.5 py-1 rounded-full border border-border/70 bg-background/40
                                       font-mono text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-muted"
                          >
                            {skill.name}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </div>

                <div className="hidden md:block md:w-[44%]" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
