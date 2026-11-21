import { QrCode } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { SOCIAL_LINKS } from '../../data/links.js';
import { InstagramIcon } from '../ui/BrandIcons.jsx';
import Reveal from '../ui/Reveal.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import SmartImage from '../ui/SmartImage.jsx';
import SocialButtons from '../ui/SocialButtons.jsx';

const CORNERS = [
  'start-3 top-3 border-s-2 border-t-2 rounded-ss-lg',
  'end-3 top-3 border-e-2 border-t-2 rounded-se-lg',
  'start-3 bottom-3 border-s-2 border-b-2 rounded-es-lg',
  'end-3 bottom-3 border-e-2 border-b-2 rounded-ee-lg',
];

// Shown until public/assets/qr-insta.png exists; still takes visitors to the profile.
function QrFallback() {
  return (
    <a
      href={SOCIAL_LINKS.instagram.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/qr relative grid size-full place-items-center rounded-2xl bg-surface"
    >
      {CORNERS.map((corner) => (
        <span key={corner} aria-hidden="true" className={`absolute size-7 border-logo-blue ${corner}`} />
      ))}
      <span className="flex flex-col items-center gap-4">
        <QrCode
          className="size-24 text-logo-blue transition-transform duration-300 group-hover/qr:scale-105"
          strokeWidth={1.1}
        />
        <span
          dir="ltr"
          className="bg-brand inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
        >
          <InstagramIcon className="size-3.5" />
          {SOCIAL_LINKS.instagram.handle}
        </span>
      </span>
    </a>
  );
}

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-32 -top-32 size-96 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.22),transparent_65%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -start-32 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.22),transparent_65%)]"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <SectionHeading
                align="start"
                eyebrow={t('contact.eyebrow')}
                title={t('contact.title')}
                subtitle={t('contact.subtitle')}
              />
              <Reveal delay={0.1}>
                <SocialButtons className="mt-8" />
                <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
                  <span dir="ltr">{SOCIAL_LINKS.instagram.handle}</span>
                  <span aria-hidden="true" className="size-1 rounded-full bg-logo-blue" />
                  <span dir="ltr">{SOCIAL_LINKS.whatsapp.display}</span>
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <div className="mx-auto w-full max-w-xs rounded-3xl border border-edge bg-space/70 p-6 text-center shadow-[0_0_70px_-24px_rgba(124,58,237,0.85)] transition duration-300 hover:-translate-y-1.5 hover:border-bow/50">
                <div className="aspect-square w-full">
                  <SmartImage
                    src="/assets/qr-insta.png"
                    alt={t('contact.qrAlt')}
                    className="size-full rounded-2xl bg-white object-contain p-3"
                    fallback={<QrFallback />}
                  />
                </div>
                <h3 className="mt-5 text-lg font-bold">{t('contact.qrTitle')}</h3>
                <p dir="ltr" className="text-gradient font-bold">
                  {SOCIAL_LINKS.instagram.handle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t('contact.qrHint')}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
