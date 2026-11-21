import { motion } from 'framer-motion';
import { BookOpen, Building2, CircleAlert, Crown, EyeOff, GraduationCap, Lock, Mail, Phone, UserRound, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { academicYears } from '../../data/academicYears.js';
import { getRoleById } from '../../data/memberRoles.js';
import { useRosterSettings, useSubteamRoster } from '../../hooks/useRoster.js';
import Avatar from '../ui/Avatar.jsx';
import { PersonDetail } from './TeamLeadership.jsx';

const EASE = [0.22, 1, 0.36, 1];

const LIST_VARIANTS = { hidden: {}, shown: { transition: { staggerChildren: 0.06 } } };
const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// Leaders first, then everyone by name.
function byRoleThenName(a, b) {
  const rank = (member) => (member.role === 'leader' ? 0 : 1);
  return rank(a) - rank(b) || (a.fullName ?? '').localeCompare(b.fullName ?? '');
}

function MemberCard({ member, isYou, showDetails }) {
  const { t, localize } = useLanguage();
  const role = getRoleById(member.role) ?? getRoleById('member');
  const isLeader = member.role === 'leader';
  const RoleIcon = isLeader ? Crown : UserRound;
  const academicYear = academicYears.find((year) => year.id === member.academicYear);

  const details = showDetails
    ? [
        { id: 'phone', icon: Phone, label: t('form.phone'), value: member.phone, href: `tel:${member.phone?.replace(/[^\d+]/g, '')}`, dir: 'ltr' },
        { id: 'email', icon: Mail, label: t('form.email'), value: member.email, href: `mailto:${member.email}`, dir: 'ltr' },
        { id: 'major', icon: BookOpen, label: t('form.major'), value: member.major, showLabel: true },
        { id: 'university', icon: Building2, label: t('form.university'), value: member.university, showLabel: true },
        {
          id: 'academicYear',
          icon: GraduationCap,
          label: t('form.academicYear'),
          value: academicYear ? localize(academicYear.label) : member.academicYear,
          showLabel: true,
        },
      ].filter((detail) => detail.value)
    : [];

  return (
    <motion.li
      variants={CARD_VARIANTS}
      className={`glass relative rounded-3xl p-5 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)] ${
        isYou ? 'border-[color:var(--accent)] shadow-[0_0_38px_-10px_var(--accent)]' : ''
      }`}
    >
      {isYou && (
        <span className="bg-brand absolute -top-3 end-5 animate-glow rounded-full px-3 py-1 text-xs font-extrabold tracking-wide">
          {t('subteamPage.roster.you')}
        </span>
      )}

      <div className="flex items-center gap-4">
        <span className="size-16 shrink-0 rounded-full bg-[linear-gradient(135deg,var(--accent),#7C3AED)] p-[3px] shadow-[0_0_24px_-8px_var(--accent)]">
          <Avatar photoURL={member.photoURL} name={member.fullName} className="size-full text-xl" />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug [overflow-wrap:anywhere]">{member.fullName}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <RoleIcon className={`size-4 shrink-0 ${isLeader ? 'text-amber-300' : 'text-[var(--accent)]'}`} />
            {localize(role.label)}
          </p>
        </div>
      </div>

      {details.length > 0 && (
        <ul className="mt-4 space-y-2.5 border-t border-edge pt-4 text-sm text-muted">
          {details.map(({ id, value, ...detail }) => (
            <PersonDetail key={id} {...detail}>
              {value}
            </PersonDetail>
          ))}
        </ul>
      )}
    </motion.li>
  );
}

function RosterNote({ icon: Icon, tone = 'border-edge bg-white/5 text-muted', children }) {
  return (
    <p className={`mt-6 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium leading-relaxed ${tone}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

// The "Team Members" section of a SubTeam page. It renders nothing for guests and for accounts that are not
// NOVA AI members; firestore.rules refuses them the data as well. Admins always see it, members only while the
// admins keep this SubTeam's roster switched on in settings/rosterVisibility.
export default function TeamRoster({ team }) {
  const { t } = useLanguage();
  const { isAdmin, memberProfile } = useAuth();
  const canView = isAdmin || Boolean(memberProfile);
  const { settings, loading: settingsLoading } = useRosterSettings(canView);
  const openToMembers = settings.showRoster[team.id] === true;
  const visible = canView && !settingsLoading && (isAdmin || openToMembers);
  const { members, loading, error } = useSubteamRoster(team.id, visible);

  if (!visible) return null;

  const sorted = [...members].sort(byRoleThenName);

  return (
    <motion.section
      className="mt-20"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="flex items-center gap-3 text-2xl font-bold">
          <span aria-hidden="true" className="h-7 w-1.5 rounded-full bg-[var(--accent)]" />
          {t('subteamPage.roster.title')}
          {!loading && !error && (
            <span className="rounded-full border border-edge bg-white/5 px-2.5 py-0.5 text-sm font-bold text-muted">
              {sorted.length}
            </span>
          )}
        </h2>
        <p className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/5 px-3.5 py-1.5 text-xs font-bold text-muted">
          <Lock className="size-3.5 text-[var(--accent)]" />
          {t('subteamPage.roster.membersOnly')}
        </p>
      </div>

      {isAdmin && !openToMembers && (
        <RosterNote icon={EyeOff} tone="border-amber-300/35 bg-amber-300/10 text-amber-100">
          {t('subteamPage.roster.hiddenNote')}
        </RosterNote>
      )}

      {loading && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((card) => (
            <li key={card} className="glass h-28 animate-pulse rounded-3xl" />
          ))}
        </ul>
      )}

      {error && (
        <RosterNote icon={CircleAlert} tone="border-bow/40 bg-bow/10 text-white">
          {t('subteamPage.roster.error')}
        </RosterNote>
      )}

      {!loading && !error && sorted.length === 0 && <RosterNote icon={Users}>{t('subteamPage.roster.empty')}</RosterNote>}

      {sorted.length > 0 && (
        <motion.ul
          className="mt-7 grid items-start gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={LIST_VARIANTS}
          initial="hidden"
          animate="shown"
        >
          {sorted.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isYou={member.id === memberProfile?.id}
              showDetails={settings.showMemberDetails}
            />
          ))}
        </motion.ul>
      )}
    </motion.section>
  );
}
