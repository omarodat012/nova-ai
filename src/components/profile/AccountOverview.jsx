import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MailCheck, Rocket, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Avatar from '../ui/Avatar.jsx';
import DisplayNameForm from './DisplayNameForm.jsx';

const EASE = [0.22, 1, 0.36, 1];

// Member documents are only readable by a verified address, so a password account must verify before it can be recognized.
function VerifyEmailNotice() {
  const { t } = useLanguage();
  const { openVerifyEmail } = useOutletContext();

  return (
    <div className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5 text-start">
      <p className="flex items-center gap-2 font-bold text-amber-200">
        <MailCheck className="size-5 shrink-0" />
        {t('profile.verify.title')}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/90">{t('profile.verify.text')}</p>
      <button type="button" onClick={openVerifyEmail} className="btn btn-ghost btn-sm mt-4">
        <MailCheck className="size-4" />
        {t('profile.verify.cta')}
      </button>
    </div>
  );
}

function AccountRow({ icon: Icon, label, dir, children }) {
  return (
    <div className="flex items-center gap-3.5 p-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-edge bg-electric/15 text-logo-blue">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd dir={dir} className="font-bold [overflow-wrap:anywhere] rtl:text-right">
          {children}
        </dd>
      </div>
    </div>
  );
}

// The profile of a signed-in account that is not in the `members` collection (yet).
export default function AccountOverview({ user }) {
  const { t } = useLanguage();
  const name = user.displayName?.trim() || user.email?.split('@')[0] || '';

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <motion.div
        className="glass-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-24 -top-24 size-64 rounded-full bg-electric opacity-15 blur-3xl"
        />
        <div className="relative flex items-center gap-4">
          <Avatar photoURL={user.photoURL} name={name} className="size-16 text-2xl ring-2 ring-edge" />
          <div className="min-w-0">
            <p className="text-sm text-muted">{t('profile.account.title')}</p>
            <h1 className="text-2xl font-extrabold leading-snug [overflow-wrap:anywhere]">{name}</h1>
          </div>
        </div>
        <dl className="relative mt-6 rounded-2xl border border-edge bg-space/50">
          <AccountRow icon={Mail} label={t('profile.account.email')} dir="ltr">
            {user.email}
          </AccountRow>
        </dl>
        <DisplayNameForm key={user.uid} hint={t('profile.displayName.hint')} className="relative mt-6" />
      </motion.div>

      <motion.div
        className="glass relative overflow-hidden rounded-[2rem] px-6 py-9 text-center sm:px-10"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -start-20 size-64 rounded-full bg-neon opacity-20 blur-3xl"
        />
        <span className="relative mx-auto grid size-16 place-items-center rounded-3xl border border-bow/40 bg-bow/10 text-bow">
          <Sparkles className="size-8" strokeWidth={1.5} />
        </span>
        <h2 className="relative mt-5 text-2xl font-extrabold">{t('profile.notMember.title')}</h2>
        <p className="relative mx-auto mt-3 max-w-md leading-loose text-muted">{t('profile.notMember.text')}</p>
        <Link to="/join" className="btn btn-primary relative mt-7">
          <Rocket className="size-5" />
          {t('profile.notMember.cta')}
        </Link>

        {!user.emailVerified && (
          <div className="relative mt-8">
            <VerifyEmailNotice />
          </div>
        )}
      </motion.div>
    </div>
  );
}
