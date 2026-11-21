import { Link } from 'react-router-dom';
import { ArrowDown, BookOpen, Crown, GraduationCap, Mail, Phone, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../ui/Reveal.jsx';
import SmartImage from '../ui/SmartImage.jsx';

function getInitials(name, lang) {
  const words = name.trim().split(/\s+/);
  if (lang === 'ar') return words[0][0];
  return `${words[0][0]}${words.length > 1 ? words.at(-1)[0] : ''}`.toUpperCase();
}

// `showLabel` spells the label out for values that are unclear on their own (e.g. "First Year").
function LeaderDetail({ icon: Icon, label, showLabel = false, href, dir, children }) {
  const text = (
    <span dir={dir} className="min-w-0 [overflow-wrap:anywhere]">
      {children}
    </span>
  );

  return (
    <li className="flex items-start gap-2.5">
      <span
        title={label}
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-edge bg-white/5 text-[var(--accent)]"
      >
        <Icon aria-hidden="true" className="size-3.5" />
      </span>
      {href ? (
        <a href={href} className="mt-1 min-w-0 text-white/90 transition-colors hover:text-white hover:underline">
          <span className="sr-only">{label}: </span>
          {text}
        </a>
      ) : (
        <span className="mt-1 min-w-0 text-white/90">
          <span className={showLabel ? 'text-muted' : 'sr-only'}>{label}: </span>
          {text}
        </span>
      )}
    </li>
  );
}

function LeaderCard({ leader }) {
  const { t, lang, localize } = useLanguage();
  const name = localize(leader.name);
  const initials = (
    <span
      aria-hidden="true"
      className="grid size-full place-items-center bg-[color-mix(in_srgb,var(--accent)_30%,#16132b)] font-display text-2xl font-extrabold"
    >
      {getInitials(name, lang)}
    </span>
  );

  const details = [
    { id: 'major', icon: BookOpen, label: t('form.major'), value: localize(leader.major), showLabel: true },
    {
      id: 'academicYear',
      icon: GraduationCap,
      label: t('form.academicYear'),
      value: localize(leader.academicYear),
      showLabel: true,
    },
    { id: 'email', icon: Mail, label: t('form.email'), value: leader.email, href: `mailto:${leader.email}`, dir: 'ltr' },
    {
      id: 'phone',
      icon: Phone,
      label: t('form.phone'),
      value: leader.phone,
      href: `tel:${leader.phone.replace(/[^\d+]/g, '')}`,
      dir: 'ltr',
    },
  ].filter((detail) => detail.value);

  return (
    <li className="glass rounded-3xl p-5 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)]">
      <div className="flex items-center gap-4">
        <span className="size-20 shrink-0 rounded-full bg-[linear-gradient(135deg,var(--accent),#7C3AED)] p-[3px] shadow-[0_0_28px_-6px_var(--accent)]">
          <span className="block size-full overflow-hidden rounded-full bg-surface">
            {leader.photo ? (
              <SmartImage
                key={leader.photo}
                src={leader.photo}
                alt={`${t('subteamPage.photoAlt')} ${name}`}
                className="size-full object-cover"
                fallback={initials}
              />
            ) : (
              initials
            )}
          </span>
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug">{name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Crown className="size-4 shrink-0 text-amber-300" />
            {t('subteams.leader')}
          </p>
        </div>
      </div>

      {details.length > 0 && (
        <ul className="mt-4 space-y-2.5 border-t border-edge pt-4 text-sm text-muted">
          {details.map(({ id, value, ...detail }) => (
            <LeaderDetail key={id} {...detail}>
              {value}
            </LeaderDetail>
          ))}
        </ul>
      )}
    </li>
  );
}

function RecruitmentCard() {
  const { t } = useLanguage();

  return (
    <div className="animate-glow rounded-3xl border border-bow/50 bg-bow/10 p-6 text-center backdrop-blur-md">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#F472B6,#7C3AED)] shadow-[0_0_30px_-6px_rgba(244,114,182,0.9)]">
        <Sparkles className="size-7" />
      </span>
      <h3 className="mt-4 text-xl font-extrabold leading-snug">{t('subteamPage.recruitTitle')}</h3>
      <p className="mt-2 leading-relaxed text-muted">{t('subteamPage.recruitText')}</p>
      <Link to="#apply" replace className="btn btn-founder btn-sm mt-5">
        {t('subteamPage.joinCta')}
        <ArrowDown className="size-4" />
      </Link>
    </div>
  );
}

export default function TeamLeadership({ team }) {
  const { t } = useLanguage();

  return (
    <section>
      <h2 className="flex items-center gap-3 text-2xl font-bold">
        <span aria-hidden="true" className="h-7 w-1.5 rounded-full bg-[var(--accent)]" />
        {t('subteamPage.leadership')}
      </h2>
      <Reveal className="mt-6">
        {team.leaders.length === 0 ? (
          <RecruitmentCard />
        ) : (
          <ul className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {team.leaders.map((leader, index) => (
              <LeaderCard key={`${index}-${leader.name.en}`} leader={leader} />
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}
