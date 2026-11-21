import Reveal from './Reveal.jsx';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const alignment = align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-start';

  return (
    <Reveal className={alignment}>
      <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-4 py-1.5 text-sm font-medium text-logo-blue backdrop-blur-md">
        <span className="size-1.5 rounded-full bg-electric shadow-[0_0_10px_2px_rgba(79,140,255,0.8)]" />
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg sm:leading-relaxed">{subtitle}</p>}
    </Reveal>
  );
}
