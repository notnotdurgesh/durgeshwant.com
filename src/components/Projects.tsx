import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Github } from 'lucide-react';
import { CONFIG } from '../config';
import { useReducedMotionPreference } from '../lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotionPreference();

  useGSAP(() => {
    if (!sectionRef.current || !containerRef.current) return;
    // The horizontal rail is scroll-hijacking by definition. Under reduced
    // motion the panels render as a normal vertical stack instead (see the
    // `reduceMotion` branches in the markup below), so there is nothing to set
    // up and, critically, nothing left translated off-screen.
    if (reduceMotion) return;

    const mm = gsap.matchMedia();

    // Desktop: horizontal rail driven by vertical scroll
    mm.add('(min-width: 768px)', () => {
      const sections = gsap.utils.toArray<HTMLElement>('.project-panel');
      if (sections.length < 2) return;

      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          invalidateOnRefresh: true,
          // Derived from the panel count rather than a hardcoded container
          // width, so adding a project to config.ts cannot desynchronise the
          // scroll distance from the rail.
          end: () => '+=' + sections.length * window.innerWidth * 0.6,
        },
      });
    });

    // Mobile: vertical stack, fade each panel in
    mm.add('(max-width: 767px)', () => {
      gsap.utils.toArray<HTMLElement>('.project-panel').forEach((panel) => {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [reduceMotion] });

  return (
    <div id="projects-wrapper" className="w-full">
      <section
        ref={sectionRef}
        id="work"
        className={`w-full relative ${reduceMotion ? '' : 'md:h-screen md:overflow-hidden'}`}
      >
        <div className="absolute top-12 left-6 md:left-12 z-20">
          <span className="px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-sm uppercase tracking-widest backdrop-blur-md rounded-sm transform -rotate-2 inline-block">
            Chapter 2: The Projects
          </span>
        </div>

        <div
          ref={containerRef}
          // md:w-max lets the rail size itself to its panels. The previous
          // md:w-[400vw] was hardcoded to exactly four projects and would have
          // silently clipped a fifth.
          className={`flex flex-col pt-32 pb-24 ${
            reduceMotion ? '' : 'md:flex-row md:w-max md:h-full md:pt-0 md:pb-0'
          }`}
        >
          {CONFIG.projects.map((project, index) => (
            <div
              key={project.title}
              className={`project-panel w-full h-auto flex items-center justify-center relative px-6 py-12 border-b border-border ${
                reduceMotion ? '' : 'md:w-screen md:shrink-0 md:h-full md:px-24 md:py-0 md:border-none'
              }`}
            >
              <div className="absolute inset-0 z-0 hidden md:block">
                <img
                  src={project.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-10 sepia-[0.5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </div>

              <div className="relative z-10 w-full max-w-7xl grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-4 md:space-y-6">
                  <p className="font-hand text-xl md:text-2xl tracking-wide" style={{ color: project.color }}>
                    Page {String(index + 1).padStart(2, '0')} // {project.category}
                  </p>
                  <h3 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight uppercase leading-none text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-base md:text-xl text-muted max-w-md leading-relaxed font-sans font-light">
                    {project.description}
                  </p>

                  <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-6">
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-sans text-xs md:text-sm uppercase tracking-widest border-b pb-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors w-fit"
                        style={{ borderColor: project.color, color: project.color }}
                      >
                        Live Demo
                        <span className="sr-only"> for {project.title} (opens in a new tab)</span>
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-sans text-xs md:text-sm uppercase tracking-widest border-b pb-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors w-fit"
                        style={{ borderColor: project.color, color: project.color }}
                      >
                        GitHub
                        <span className="sr-only"> repository for {project.title} (opens in a new tab)</span>
                        <Github className="w-4 h-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative aspect-video md:aspect-[4/3] glass-panel p-3 md:p-4 rounded-sm shadow-xl border border-border group mt-6 md:mt-0 transform rotate-1 md:rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                  <div className="w-full h-full overflow-hidden relative rounded-sm">
                    <img
                      src={project.image}
                      alt={`Screenshot of ${project.title}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 sepia-[0.2] group-hover:sepia-0"
                    />
                    <div
                      className="absolute inset-0 mix-blend-multiply opacity-20 group-hover:opacity-0 transition-opacity duration-1000 z-0"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                  {/* Tape detail */}
                  <div className="absolute -top-3 right-8 w-16 h-6 bg-white/40 backdrop-blur-sm transform rotate-[5deg] shadow-sm z-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
