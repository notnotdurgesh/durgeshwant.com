import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config';
import { prefersReducedMotion } from '../lib/motion';
import SectionLabel from './SectionLabel';

gsap.registerPlugin(ScrollTrigger);

/**
 * The stack, as a specification sheet.
 *
 * This replaced a rotating constellation of nine slash-separated labels orbiting
 * a portrait. That layout had three problems: the portrait in the middle read as
 * a profile photo dropped into a diagram, the counter-rotation meant labels were
 * legible only at certain scroll positions, and cramming "Tailwind / MUI / AntD /
 * ShadCN" onto one node to fit the geometry hid most of what was actually being
 * claimed. A grouped list holds roughly four times as many entries, stays
 * readable at every width, and can say what each group is *for*.
 */
export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;

    gsap.utils.toArray<HTMLElement>('.stack-group').forEach((group, i) => {
      gsap.fromTo(
        group,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: (i % 3) * 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: group, start: 'top 88%', toggleActions: 'play none none reverse' },
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section
      id="skills"
      ref={sectionRef}
      aria-labelledby="stack-heading"
      className="relative py-24 md:py-40 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 mb-16 md:mb-24">
          <div>
            <SectionLabel index={4} className="mb-6">Stack</SectionLabel>
            <h2
              id="stack-heading"
              className="text-4xl sm:text-5xl md:text-7xl font-display tracking-[-0.02em] leading-[1.02] text-foreground text-balance"
            >
              Tools I reach for, <span className="text-primary italic">and why</span>
            </h2>
          </div>
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted tabular-nums shrink-0">
            {CONFIG.stack.reduce((n, g) => n + g.items.length, 0)} entries / {CONFIG.stack.length} groups
          </p>
        </div>

        {/*
          A single hairline grid rather than six floating cards: the shared rules
          line every group up on the same baseline, which is what makes a spec
          sheet feel engineered instead of assembled.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60
                        border border-border/60 rounded-2xl overflow-hidden">
          {CONFIG.stack.map((group, index) => (
            <div
              key={group.title}
              className="stack-group group/cell relative bg-background p-6 md:p-8
                         transition-colors duration-500 hover:bg-card/60"
            >
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-mono text-[10px] tabular-nums text-primary/55">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-2xl md:text-3xl text-foreground leading-none">
                  {group.title}
                </h3>
              </div>

              <p className="font-sans text-xs md:text-sm text-muted font-light mb-6 md:mb-7 pl-[2.1rem]">
                {group.note}
              </p>

              <ul className="flex flex-wrap gap-1.5 md:gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="px-2.5 py-1 rounded-md border border-border/70 bg-card/40
                               font-mono text-[10px] md:text-[11px] tracking-wide text-foreground/75
                               transition-colors duration-300
                               group-hover/cell:border-primary/30 group-hover/cell:text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              {/* Corner tick that fills on hover — the only decoration in here. */}
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 h-px w-0 bg-primary
                           transition-[width] duration-500 ease-out group-hover/cell:w-12"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
