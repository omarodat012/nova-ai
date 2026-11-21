import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useSubteams } from '../../context/SubteamsContext.jsx';
import { TeamLeaders, TeamLogo } from '../subteams/TeamBits.jsx';
import Reveal from '../ui/Reveal.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';

// 3 cards on the first row, 2 wider cards on the second (6-column grid on desktop).
const CARD_SPANS = [
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-3',
  'md:col-span-2 lg:col-span-3',
];

function SubTeamCard({ team }) {
  const { t, localize } = useLanguage();

  return (
    <Link
      to={`/subteam/${team.id}`}
      style={{ '--accent': team.accent }}
      className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[color:var(--accent)] hover:shadow-[0_28px_70px_-30px_var(--accent)] sm:p-7"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-20 -top-20 size-52 rounded-full bg-[var(--accent)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
      />

      <div className="relative flex items-start justify-between gap-4">
        <TeamLogo team={team} className="size-16 transition-transform duration-300 group-hover:scale-105" />
        <span className="grid size-10 place-items-center rounded-full border border-edge text-muted transition duration-300 group-hover:border-[color:var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-space">
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </span>
      </div>

      <h3 className="relative mt-5 text-xl font-bold leading-snug">
        {localize(team.name)} <span aria-hidden="true">{team.emoji}</span>
      </h3>

      <div className="relative mt-3">
        <TeamLeaders team={team} />
      </div>

      <p className="relative mt-4 flex-1 text-[0.95rem] leading-loose text-muted">{localize(team.description)}</p>

      <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
        {t('subteams.explore')}
        <ArrowRight className="size-4 rtl:-scale-x-100" />
      </span>
    </Link>
  );
}

export default function SubTeams() {
  const { t } = useLanguage();
  const { subteams } = useSubteams();

  return (
    <section id="subteams" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow={t('subteams.eyebrow')}
          title={t('subteams.title')}
          subtitle={t('subteams.subtitle')}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {subteams.map((team, index) => (
            <Reveal key={team.id} delay={(index % 3) * 0.08} className={CARD_SPANS[index]}>
              <SubTeamCard team={team} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
