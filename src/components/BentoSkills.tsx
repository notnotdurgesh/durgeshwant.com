import { motion } from 'motion/react';
import { Layers, Database, Layout, Wrench } from 'lucide-react';

const skillCategories = [
  {
    title: 'Frontend & UI',
    icon: <Layout className="w-6 h-6 text-primary" />,
    skills: ['ReactJS', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'GraphQL']
  },
  {
    title: 'Backend & Core',
    icon: <Database className="w-6 h-6 text-primary" />,
    skills: ['Node.js', 'TypeScript', 'Python', 'C/C++', 'Express']
  },
  {
    title: 'Data & Cloud',
    icon: <Layers className="w-6 h-6 text-primary" />,
    skills: ['PostgreSQL', 'MongoDB', 'Prisma', 'AWS', 'Docker']
  },
  {
    title: 'Tools & Workflow',
    icon: <Wrench className="w-6 h-6 text-primary" />,
    skills: ['Git', 'GitHub Actions', 'Vercel', 'Netlify', 'Figma']
  }
];

export default function BentoSkills() {
  return (
    <section id="about" className="py-24 relative px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 uppercase">
            Identity <span className="text-primary">&</span> Core
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[240px]">
          {/* Main About Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 md:row-span-2 bg-card rounded-3xl p-8 relative overflow-hidden group border border-border hover:border-primary/50 transition-colors"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
            <h3 className="text-2xl font-bold uppercase mb-4">The Architect</h3>
            <p className="text-muted leading-relaxed mb-6 text-lg">
              I am a Full Stack Developer and CTO specializing in building scalable, high-performance systems. My approach combines brutalist authenticity with organic user experiences.
            </p>
            <p className="text-muted leading-relaxed text-lg">
              Whether it's architecting a complex GraphQL backend or crafting fluid, motion-driven interfaces, I focus on delivering end-to-end digital excellence.
            </p>
            
            <div className="absolute bottom-8 left-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <span className="font-mono text-primary font-bold">RD</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold uppercase tracking-wider text-sm">Reddy Durgeshwant</span>
                <span className="text-xs text-muted font-mono">Based in India</span>
              </div>
            </div>
          </motion.div>

          {/* Skill Cards */}
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-card rounded-3xl p-6 border border-border hover:border-primary/50 transition-colors group relative overflow-hidden ${
                index === 0 || index === 1 ? 'md:col-span-2' : 'md:col-span-1'
              }`}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500 scale-150">
                {category.icon}
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider">{category.title}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-background border border-border text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
