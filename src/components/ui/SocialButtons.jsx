import { useLanguage } from '../../context/LanguageContext.jsx';
import { SOCIAL_LINKS } from '../../data/links.js';
import { InstagramIcon, WhatsAppIcon } from './BrandIcons.jsx';

export default function SocialButtons({ className = '' }) {
  const { t } = useLanguage();

  return (
    <div className={`flex flex-col gap-4 sm:flex-row ${className}`}>
      <a
        href={SOCIAL_LINKS.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn bg-[linear-gradient(135deg,#F472B6_0%,#7C3AED_55%,#4F8CFF_100%)] text-white shadow-[0_14px_36px_-14px_rgba(244,114,182,0.85)] hover:shadow-[0_20px_44px_-14px_rgba(244,114,182,1)]"
      >
        <InstagramIcon className="size-5" />
        {t('contact.instagram')}
      </a>
      <a
        href={SOCIAL_LINKS.whatsapp.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn border border-[#25D366]/45 bg-[#25D366]/10 text-white hover:bg-[#25D366]/20 hover:shadow-[0_18px_40px_-16px_rgba(37,211,102,0.75)]"
      >
        <WhatsAppIcon className="size-5 text-[#25D366]" />
        {t('contact.whatsapp')}
      </a>
    </div>
  );
}
