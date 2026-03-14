import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { CONFIG } from '../config';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function Contact() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONFIG.personal.email}`, {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            _subject: "New Contact from Portfolio!"
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Message sent successfully!');
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="min-h-screen relative flex items-center justify-center py-24 pb-32 md:pb-24 px-6 overflow-hidden">
      <Toaster position="bottom-right" theme="dark" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
        <span className="px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-sm uppercase tracking-widest backdrop-blur-md rounded-sm transform rotate-1 inline-block">
          Chapter 5: Contact
        </span>
      </div>

      <div className="w-full max-w-2xl z-10 relative">
        <div className="glass-panel p-8 md:p-12 rounded-sm shadow-xl border border-border relative">
          {/* Paper texture detail */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/10 rotate-12 blur-md" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/10 -rotate-12 blur-md" />
          
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-medium mb-4 text-foreground">
              Let's build something <span className="italic text-primary">impactful</span>.
            </h2>
            <p className="text-muted font-sans font-light">
              Reach out to {CONFIG.personal.email} or use the form below.
            </p>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-primary animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <h3 className="text-2xl font-display mb-2">Message Sent</h3>
              <p className="text-muted font-sans font-light text-center">I'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-muted">Name</label>
                  <input
                    {...register('name', { required: true })}
                    className="w-full bg-transparent border-b border-border py-3 px-0 focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors font-sans text-foreground placeholder:text-muted/50"
                    placeholder="Jane Doe"
                  />
                  {errors.name && <span className="text-accent text-xs font-sans">Required field</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-muted">Email</label>
                  <input
                    {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                    className="w-full bg-transparent border-b border-border py-3 px-0 focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors font-sans text-foreground placeholder:text-muted/50"
                    placeholder="jane@example.com"
                  />
                  {errors.email && <span className="text-accent text-xs font-sans">Valid email required</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-widest text-muted">Message</label>
                <textarea
                  {...register('message', { required: true })}
                  rows={4}
                  className="w-full bg-transparent border-b border-border py-3 px-0 focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors font-sans text-foreground placeholder:text-muted/50 resize-none"
                  placeholder="Tell me about your project..."
                />
                {errors.message && <span className="text-accent text-xs font-sans">Required field</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-background font-sans uppercase tracking-widest text-sm hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm shadow-md"
              >
                {isSubmitting ? 'Sending...' : (
                  <>Send Message <Send className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
