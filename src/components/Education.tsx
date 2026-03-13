import { motion } from 'motion/react';
import { GraduationCap, Award } from 'lucide-react';

const education = [
  {
    degree: 'B.Tech in Computer Science',
    institution: 'Raghu Institute of Technology, Visakhapatnam',
    date: '2021 - 2025',
    details: 'Passed First Class with Distinction'
  },
  {
    degree: 'XII (Science)',
    institution: 'Kendriya Vidyalaya, Visakhapatnam',
    date: '2020 - 2021',
    details: 'Percentage: 93.8%'
  },
  {
    degree: 'X',
    institution: 'Kendriya Vidyalaya, Visakhapatnam',
    date: '2018 - 2019',
    details: 'Percentage: 92.6%'
  }
];

const certifications = [
  { title: 'IBM Back-end Application Development with Node.js and Express', date: 'March 2024' },
  { title: 'IBM Developing Front End Apps with React', date: 'March 2024' },
  { title: 'IBM Introduction to Cloud Native, DevOps, Agile, and NoSQL', date: 'February 2024' },
  { title: 'Oracle Cloud Infrastructure 2023 Certified Foundations Associate', date: 'August 2023' },
  { title: 'AWS Academy Machine Learning Foundations', date: 'July 2023' },
  { title: 'AWS Academy Cloud Foundations', date: 'January 2023' }
];

export default function Education() {
  return (
    <section id="education" className="py-24 relative bg-card/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Education */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Education
            </h2>
            
            <div className="space-y-8">
              {education.map((edu, index) => (
                <div key={index} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-primary before:rounded-full before:shadow-[0_0_0_4px_var(--color-background)]">
                  <div className="absolute left-[5px] top-5 bottom-[-2rem] w-0.5 bg-border last:hidden" />
                  <h3 className="text-xl font-bold text-foreground mb-1">{edu.degree}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="text-base font-medium text-muted">{edu.institution}</span>
                    <span className="text-sm font-mono text-primary/80">{edu.date}</span>
                  </div>
                  <p className="text-sm text-muted/80">{edu.details}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <Award className="w-8 h-8 text-primary" />
              Certifications
            </h2>
            
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-primary shrink-0 mt-1 sm:mt-0" />
                    <h3 className="text-base font-medium text-foreground">{cert.title}</h3>
                  </div>
                  <span className="text-sm font-mono text-muted whitespace-nowrap bg-card px-3 py-1 rounded-full border border-border">
                    {cert.date}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
