import { Crown, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import SmartImage from '../ui/SmartImage.jsx';

export function TeamLogo({ team, className = 'size-14' }) {
  const { t, localize } = useLanguage();
  const Icon = team.icon;

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border ${className}`}
      style={{
        borderColor: `${team.accent}55`,
        background: `linear-gradient(135deg, ${team.accent}33, rgba(22, 19, 43, 0.6))`,
      }}
    >
      <SmartImage
        src={team.logo}
        alt={`${t('subteams.logoAlt')} ${localize(team.name)}`}
        className="size-full object-cover"
        fallback={<Icon className="size-1/2" style={{ color: team.accent }} strokeWidth={1.75} />}
      />
    </span>
  );
}

export function TeamLeaders({ team }) {
  const { t, localize } = useLanguage();

  if (team.leaders.length === 0) {
    return (
      <span className="inline-flex animate-glow items-center gap-2 rounded-full border border-bow/50 bg-bow/10 px-3.5 py-1.5 text-sm font-bold text-bow">
        <Sparkles className="size-4 shrink-0" />
        {t('subteams.openBadge')}
      </span>
    );
  }

  const names = team.leaders.map((leader) => localize(leader.name)).join(t('subteams.nameSeparator'));

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <Crown className="size-4 shrink-0 text-amber-300" />
      <span className="text-muted">{t(team.leaders.length > 1 ? 'subteams.leaders' : 'subteams.leader')}:</span>
      <span className="font-bold text-white">{names}</span>
    </span>
  );
}
