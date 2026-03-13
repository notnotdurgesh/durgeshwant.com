import { Github, Linkedin, Mail } from 'lucide-react';
import { CONFIG } from '../config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 md:py-12 px-6 border-t border-border bg-background relative z-20 pb-28 md:pb-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-display text-2xl font-bold tracking-tighter uppercase">
            {CONFIG.personal.name.split(' ')[0]}<span className="text-primary">.</span>
          </span>
          <span className="text-muted text-xs font-sans uppercase tracking-widest">
            © {currentYear} All Rights Reserved
          </span>
        </div>

        <div className="flex items-center gap-6">
          {CONFIG.personal.links.github && (
            <a href={CONFIG.personal.links.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full">
              <Github className="w-5 h-5" />
            </a>
          )}
          {CONFIG.personal.links.linkedin && (
            <a href={CONFIG.personal.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full">
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          <a href={`mailto:${CONFIG.personal.email}`} className="text-muted hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full">
            <Mail className="w-5 h-5" />
          </a>
        </div>

        <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted">
          <span>Built with</span>
          <span className="text-accent">♥</span>
          <span>& Code</span>
        </div>

      </div>
    </footer>
  );
}
