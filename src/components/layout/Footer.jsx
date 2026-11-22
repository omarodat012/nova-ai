import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { SOCIAL_LINKS } from '../../data/links.js';
import { NAV_SECTIONS, sectionPath } from '../../data/navigation.js';
import { Logo } from '../ui/Brand.jsx';
import { InstagramIcon, WhatsAppIcon } from '../ui/BrandIcons.jsx';

const socialButtonClass =
  'grid size-11 place-items-center rounded-full border border-edge bg-surface/60 text-muted transition hover:-translate-y-1 hover:text-white';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-edge bg-space/70 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo className="size-11" />
            <span dir="ltr" className="font-display text-xl font-extrabold tracking-wide">
              NOVA <span className="text-gradient">AI</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">{t('footer.tagline')}</p>
        </div>

        <nav aria-label={t('footer.quickLinks')}>
          <h3 className="text-sm font-bold text-white">{t('footer.quickLinks')}</h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_SECTIONS.map((id) => (
              <li key={id}>
                <Link to={sectionPath(id)} className="text-muted transition-colors hover:text-electric">
                  {t(`nav.${id}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/feedback" className="text-muted transition-colors hover:text-electric">
                {t('nav.feedback')}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-bold text-white">{t('footer.follow')}</h3>
          <div className="mt-4 flex gap-3">
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('contact.instagram')}
              className={`${socialButtonClass} hover:border-bow hover:shadow-[0_0_24px_-6px_rgba(244,114,182,0.9)]`}
            >
              <InstagramIcon className="size-5" />
            </a>
            <a
              href={SOCIAL_LINKS.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('contact.whatsapp')}
              className={`${socialButtonClass} hover:border-[#25D366] hover:shadow-[0_0_24px_-6px_rgba(37,211,102,0.9)]`}
            >
              <WhatsAppIcon className="size-5" />
            </a>
          </div>
          <p dir="ltr" className="mt-4 text-sm text-muted rtl:text-right">
            {SOCIAL_LINKS.instagram.handle}
          </p>
        </div>
      </div>

      <div className="border-t border-edge">
        <p className="mx-auto max-w-7xl px-5 py-5 text-center text-sm text-muted">
          © {new Date().getFullYear()} <span dir="ltr">NOVA AI</span>. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
