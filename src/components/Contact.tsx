import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { motion } from 'framer-motion';
import { CONFIG } from '../config';
import { useTheme } from '../contexts/ThemeContext';
import SectionLabel from './SectionLabel';

type FormData = {
  name: string;
  email: string;
  message: string;
  /** Honeypot: invisible to humans, irresistible to naive bots. */
  website: string;
};

const FIELD_CLASS =
  'w-full bg-transparent border-b border-border py-3 px-0 transition-colors font-sans text-foreground ' +
  'placeholder:text-muted/50 focus:outline-none focus:border-primary ' +
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-background focus-visible:outline-none';

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();
  const [isSuccess, setIsSuccess] = useState(false);
  const { theme } = useTheme();

  const onSubmit = async (data: FormData) => {
    // A bot filled the hidden field. Behave as if it succeeded and send nothing.
    if (data.website) {
      setIsSuccess(true);
      reset();
      return;
    }

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONFIG.personal.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          _subject: 'New Contact from Portfolio!',
        }),
      });

      if (!response.ok) throw new Error(`Form submission failed (${response.status})`);

      setIsSuccess(true);
      toast.success('Message sent successfully!');
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Contact form submission failed:', error);
      toast.error(`Could not send. Please email me directly at ${CONFIG.personal.email}.`);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="min-h-screen relative flex items-center justify-center py-20 sm:py-24 pb-32 md:pb-24 px-5 sm:px-6 overflow-hidden"
    >
      <Toaster position="bottom-right" theme={theme} richColors closeButton />

      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
        <SectionLabel index={5}>Contact</SectionLabel>
      </div>

      <div className="w-full max-w-2xl z-10 relative">
        <div className="glass-panel p-5 sm:p-8 md:p-12 rounded-sm shadow-xl border border-border relative">
          {/* Paper texture detail */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/10 rotate-12 blur-md" aria-hidden="true" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/10 -rotate-12 blur-md" aria-hidden="true" />

          <div className="text-center mb-8 md:mb-12">
            <h2 id="contact-heading" className="text-3xl sm:text-4xl md:text-5xl font-display mb-3 sm:mb-4 text-foreground leading-[1.1] text-balance">
              Let's <span className="italic text-primary">talk</span>.
            </h2>
            <p className="text-muted font-sans font-light">
              Reach out at{' '}
              <a
                href={`mailto:${CONFIG.personal.email}`}
                className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
              >
                {CONFIG.personal.email}
              </a>{' '}
              or use the form below.
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              // animate-in/fade-in/zoom-in come from the tailwindcss-animate
              // plugin, which is not installed — those three classes emitted no
              // CSS, so this state simply appeared with no transition.
              role="status"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center py-12 text-primary"
            >
              <CheckCircle2 className="w-16 h-16 mb-4" aria-hidden="true" />
              <h3 className="text-2xl font-display mb-2">Message Sent</h3>
              <p className="text-muted font-sans font-light text-center">I'll get back to you soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Honeypot — off-screen rather than display:none so bots still see it */}
              <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                <label htmlFor="contact-website">Do not fill this in</label>
                <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="block text-xs font-sans uppercase tracking-widest text-muted">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={FIELD_CLASS}
                    placeholder="Jane Doe"
                    {...register('name', { required: 'Please enter your name' })}
                  />
                  {errors.name && (
                    <span id="contact-name-error" role="alert" className="block text-accent text-xs font-sans">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="block text-xs font-sans uppercase tracking-widest text-muted">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    className={FIELD_CLASS}
                    placeholder="jane@example.com"
                    {...register('email', {
                      required: 'Please enter your email',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email address' },
                    })}
                  />
                  {errors.email && (
                    <span id="contact-email-error" role="alert" className="block text-accent text-xs font-sans">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="block text-xs font-sans uppercase tracking-widest text-muted">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className={`${FIELD_CLASS} resize-none`}
                  placeholder="Tell me about your project..."
                  {...register('message', {
                    required: 'Please write a message',
                    minLength: { value: 10, message: 'A little more detail would help' },
                  })}
                />
                {errors.message && (
                  <span id="contact-message-error" role="alert" className="block text-accent text-xs font-sans">
                    {errors.message.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground font-sans uppercase tracking-widest text-sm hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm shadow-md"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message <Send className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
