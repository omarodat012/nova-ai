import { motion } from 'framer-motion';
import { BadgeCheck, Lock, Mail, ShieldCheck, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useSubteams } from '../../context/SubteamsContext.jsx';
import { getRoleById } from '../../data/memberRoles.js';
import Avatar from '../ui/Avatar.jsx';
import { Logo } from '../ui/Brand.jsx';

const EASE = [0.22, 1, 0.36, 1];

function CardRow({ icon: Icon, label, dir, locked = false, children }) {
  return (
    <div className="flex items-center gap-3.5 p-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-edge bg-electric/15 text-logo-blue">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted">{label}</dt>
        <dd dir={dir} className="font-bold [overflow-wrap:anywhere] rtl:text-right">
          {children}
        </dd>
      </div>
      {locked && <Lock aria-hidden="true" className="size-4 shrink-0 text-muted/70" />}
    </div>
  );
}

// The read-only membership card. `member` is the saved `members` document, so it only changes after a save.
export default function MemberIdCard({ member }) {
  const { t, localize } = useLanguage();
  const { getSubteam } = useSubteams();
  const team = getSubteam(member.subteam);
  const role = getRoleById(member.role) ?? getRoleById('member');

  return (
    <motion.div
      className="glass-strong relative overflow-hidden rounded-[2rem] p-6 shadow-[0_40px_120px_-50px_rgba(124,58,237,0.95)] sm:p-8"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <span aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 size-64 rounded-full bg-neon opacity-25 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -start-20 size-64 rounded-full bg-electric opacity-15 blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-wide">
          <Logo className="size-9" />
          <span dir="ltr">NOVA AI</span>
        </span>
        <span className="rounded-full border border-edge bg-space/60 px-3 py-1 text-xs font-bold text-logo-blue">
          {t('profile.card.label')}
        </span>
      </div>

      <div className="relative mt-8 flex flex-col items-center text-center">
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute -inset-1.5 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#4F8CFF,#7C3AED,#F472B6,#4F8CFF)] blur-[2px]"
          />
          <Avatar
            photoURL={member.photoURL}
            name={member.fullName}
            className="relative size-28 border-4 border-surface text-4xl"
          />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold leading-snug [overflow-wrap:anywhere] sm:text-3xl sm:leading-snug">
          {member.fullName}
        </h1>
        <span className="mt-3 inline-flex animate-glow items-center gap-1.5 rounded-full border border-bow/50 bg-[linear-gradient(135deg,rgba(244,114,182,0.2),rgba(124,58,237,0.28))] px-4 py-1.5 text-sm font-bold">
          <BadgeCheck className="size-4 shrink-0 text-bow" />
          {t('profile.card.verified')}
        </span>
      </div>

      <dl className="relative mt-8 divide-y divide-edge rounded-2xl border border-edge bg-space/50">
        <CardRow icon={Users} label={t('profile.card.subteam')} locked>
          {team ? `${localize(team.name)} ${team.emoji}` : t('profile.card.unassigned')}
        </CardRow>
        <CardRow icon={ShieldCheck} label={t('profile.card.role')} locked>
          {localize(role.label)}
        </CardRow>
        {member.email && (
          <CardRow icon={Mail} label={t('profile.card.email')} dir="ltr" locked>
            {member.email}
          </CardRow>
        )}
      </dl>

      <p className="relative mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        {t('profile.card.locked')}
      </p>

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-dashed border-edge pt-4 text-xs text-muted">
        <span>{t('profile.card.memberId')}</span>
        <span dir="ltr" className="font-mono font-bold tracking-[0.2em] text-logo-blue">
          NOVA-{member.id.slice(0, 6).toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
}
