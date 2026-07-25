/**
 * The eyebrow that introduces each section of the portfolio.
 *
 * Replaces six separately-styled "Chapter N: The <Noun>" pills. A number, a
 * rule and a plain noun reads as deliberate structure; the chapter conceit read
 * as a costume, and the six pills had drifted to four different paddings,
 * rotations and text sizes.
 */
export default function SectionLabel({
  index,
  children,
  className = '',
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono text-[10px] md:text-[11px]
                  uppercase tracking-[0.3em] text-primary ${className}`}
    >
      <span className="tabular-nums opacity-55">{String(index).padStart(2, '0')}</span>
      <span aria-hidden="true" className="h-px w-6 md:w-8 bg-primary/35" />
      <span>{children}</span>
    </span>
  );
}
