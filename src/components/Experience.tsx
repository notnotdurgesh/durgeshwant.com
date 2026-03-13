import { motion } from 'motion/react';

const experiences = [
  {
    id: 1,
    role: 'Full Stack Developer / CTO',
    company: 'Remote',
    date: 'Feb 2025 - Current',
    description: [
      'Architected and scaled a mission-critical internal workforce management tool, boosting operational efficiency across multiple departments by a measurable 40%.',
      'Engineered dynamic, high-performance list and edit views using React, TypeScript, and GraphQL (Apollo Client & Server), automating data management workflows.',
      'Led cross-functional design initiatives to build intuitive enterprise UI/UX flows, driving higher user adoption.',
      'Optimized inter-service communication and complex database queries, slashing API response times by over 50%.'
    ]
  },
  {
    id: 2,
    role: 'Lead Full Stack Developer',
    company: 'Dynish Solutions, Remote',
    date: 'Jan 2025 - Feb 2025',
    description: [
      'Led a team of two engineers to architect and deploy a scalable navigation and routing system with Next.js, improving modularity and decreasing page load times by 35%.',
      'Implemented a robust, enterprise-grade Role-Based Access Control (RBAC) system.',
      'Spearheaded the development of a Progressive Web App (PWA) admin dashboard, delivering a seamless mobile-web experience with full offline capabilities.'
    ]
  },
  {
    id: 3,
    role: 'Software Engineering Intern',
    company: 'Umenit Solutions, Remote',
    date: 'June 2024 - August 2024',
    description: [
      'Built a high-throughput analytics backend to process and analyze user data, resulting in a 20% increase in user engagement.',
      'Developed an automated mailing system for sales and lead generation, which directly increased lead conversion rates by 25%.',
      'Designed and implemented custom inbox APIs for real-time lead notifications, improving lead response time by 30%.',
      'Engineered and optimized backend systems for high performance, contributing to a 15% growth in website traffic.'
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 relative px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
            Trajectory <span className="text-primary">&</span> Impact
          </h2>
        </motion.div>

        <div className="relative border-l border-border pl-8 md:pl-12 space-y-16">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Timeline Node */}
              <div className="absolute -left-[33px] md:-left-[49px] top-1 w-4 h-4 rounded-none bg-background border-2 border-primary group-hover:bg-primary transition-colors duration-300" />
              
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-4">
                <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {exp.role}
                </h3>
                <span className="font-mono text-sm text-primary uppercase tracking-widest">
                  {exp.date}
                </span>
              </div>
              
              <h4 className="text-lg font-medium text-muted mb-6 uppercase tracking-wider">{exp.company}</h4>
              
              <div className="bg-card border border-border p-6 md:p-8 relative overflow-hidden group-hover:border-primary/50 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                <ul className="space-y-4">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-base text-muted leading-relaxed flex items-start gap-4">
                      <span className="text-primary mt-2 text-xs">■</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
