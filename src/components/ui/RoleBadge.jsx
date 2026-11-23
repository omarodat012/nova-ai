import { useLanguage } from '../../context/LanguageContext.jsx';

const TIER_STYLES = {
  supervisor: 'badge-supervisor',
  leader: 'badge-leader',
  member: 'animate-glow border-bow/50 bg-[linear-gradient(135deg,rgba(244,114,182,0.2),rgba(124,58,237,0.28))]',
};

// The glowing team badge: gold for the Faculty Supervisor, purple/cyan for leaders, pink for members.
// `tier` comes from getRoleTier(); `children` replaces the default label.
export default function RoleBadge({ tier, icon: Icon, className = 'px-3 py-1 text-xs', children }) {
  const { t } = useLanguage();
  if (!TIER_STYLES[tier]) return null;

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border font-bold ${TIER_STYLES[tier]} ${className}`}>
      {Icon && <Icon className="size-4 shrink-0" />}
      {children ?? t(`roleBadge.${tier}`)}
    </span>
  );
}
