import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Github } from 'lucide-react';
import { CONFIG } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !containerRef.current) return;
    
    const mm = gsap.matchMedia();

    // Desktop: Horizontal Scroll
    mm.add("(min-width: 768px)", () => {
      const sections = gsap.utils.toArray('.project-panel');
      
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => '+=' + (containerRef.current?.offsetWidth || 0) * 0.6,
        }
      });
    });

    // Mobile: Vertical Scroll (Fade in)
    mm.add("(max-width: 767px)", () => {
      const sections = gsap.utils.toArray('.project-panel');
      sections.forEach((sec: any) => {
        gsap.fromTo(sec, 
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sec,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });
  }, { scope: sectionRef });

  return (
    <div id="projects-wrapper" className="w-full">
      <section ref={sectionRef} id="work" className="md:h-screen w-full overflow-hidden relative">
        <div className="absolute top-12 left-6 md:left-12 z-20">
          <span className="px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-sm uppercase tracking-widest backdrop-blur-md rounded-sm transform -rotate-2 inline-block">
            Chapter 2: The Projects
          </span>
        </div>
        
        <div ref={containerRef} className="flex flex-col md:flex-row md:w-[400vw] md:h-full pt-32 md:pt-0 pb-24 md:pb-0">
          {CONFIG.projects.map((project, index) => (
            <div 
              key={index} 
              className="project-panel w-full md:w-screen h-auto md:h-full flex items-center justify-center relative px-6 md:px-24 py-12 md:py-0 border-b border-border md:border-none"
            >
              <div className="absolute inset-0 z-0 hidden md:block">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  loading="lazy"
                  className="w-full h-full object-cover opacity-10 sepia-[0.5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </div>
              
              <div className="relative z-10 w-full max-w-7xl grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-4 md:space-y-6">
                  <p className="font-hand text-xl md:text-2xl tracking-wide" style={{ color: project.color }}>
                    Page 0{index + 1} // {project.category}
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
                        Live Demo <ArrowUpRight className="w-4 h-4" />
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
                        GitHub <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="relative aspect-video md:aspect-[4/3] glass-panel p-3 md:p-4 rounded-sm shadow-xl border border-border group mt-6 md:mt-0 transform rotate-1 md:rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                  <div className="w-full h-full overflow-hidden relative rounded-sm">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      loading="lazy"
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
