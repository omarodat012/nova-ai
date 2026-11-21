import { Check, Eye, Target, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../ui/Reveal.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';

const CARDS = [
  { key: 'vision', icon: Eye, accent: '#4F8CFF' },
  { key: 'mission', icon: Target, accent: '#8B5CF6' },
  { key: 'impact', icon: Users, accent: '#F472B6' },
];

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="relative scroll-mt-24 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading align="start" eyebrow={t('about.eyebrow')} title={t('about.title')} />
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-loose text-muted">{t('about.lead')}</p>
          </Reveal>
          <ul className="mt-8 space-y-3.5">
            {t('about.points').map((point, index) => (
              <li key={point}>
                <Reveal delay={0.15 + index * 0.07} className="flex items-center gap-3 font-medium text-white">
                  <span className="bg-brand grid size-7 shrink-0 place-items-center rounded-full shadow-[0_0_18px_-4px_rgba(79,140,255,0.9)]">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {point}
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          {CARDS.map(({ key, icon: Icon, accent }, index) => (
            <Reveal key={key} delay={index * 0.1}>
              <article
                style={{ '--accent': accent }}
                className="glass group relative flex gap-5 overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-[0_24px_60px_-30px_var(--accent)] sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-16 -top-16 size-44 rounded-full bg-[var(--accent)] opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                />
                <span
                  className="relative grid size-14 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 group-hover:scale-110"
                  style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}1F` }}
                >
                  <Icon className="size-7" strokeWidth={1.75} />
                </span>
                <div className="relative">
                  <h3 className="text-xl font-bold">{t(`about.cards.${key}.title`)}</h3>
                  <p className="mt-2 leading-loose text-muted">{t(`about.cards.${key}.text`)}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
