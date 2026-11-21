import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { TeamLogo } from './TeamBits.jsx';

export default function TeamHero({ team }) {
  const { t, localize } = useLanguage();
  const Icon = team.icon;

  return (
    <motion.header
      className="glass relative mt-6 overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:p-12"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[var(--accent)] opacity-25 blur-3xl"
      />
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -end-10 size-64 text-[var(--accent)] opacity-[0.07]"
        strokeWidth={1}
      />

      <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:gap-10">
        <div className="relative shrink-0 self-start md:self-center">
          <span aria-hidden="true" className="absolute inset-3 rounded-3xl bg-[var(--accent)] opacity-50 blur-2xl" />
          <TeamLogo team={team} className="relative size-28 sm:size-36" />
        </div>

        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-4 py-1.5 text-sm font-medium text-logo-blue">
            <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_2px_var(--accent)]" />
            {t('subteams.eyebrow')}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-snug sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-snug">
            {localize(team.name)}
            {'\u00A0'}
            <span aria-hidden="true">{team.emoji}</span>
          </h1>
          <p className="mt-4 text-lg leading-loose text-muted">{localize(team.description)}</p>
          <Link to="#apply" replace className="btn btn-primary mt-7">
            {t('subteamPage.joinCta')}
            <ArrowDown className="size-5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
