import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleAlert, LoaderCircle, Mail, MailCheck, RefreshCw, Rocket, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getAuthErrorKey } from '../../firebase/authErrors.js';
import Avatar from '../ui/Avatar.jsx';

const EASE = [0.22, 1, 0.36, 1];

// Member documents are only readable by a verified address, so a password account must verify before it can be recognized.
function VerifyEmailNotice() {
  const { t } = useLanguage();
  const { sendVerificationEmail, refreshMemberProfile } = useAuth();
  // 'idle' | 'sending' | 'sent' | 'checking' | 'pending' | { errorKey }
  const [state, setState] = useState('idle');
  const busy = state === 'sending' || state === 'checking';

  const handleSend = async () => {
    setState('sending');
    try {
      await sendVerificationEmail();
      setState('sent');
    } catch (error) {
      setState({ errorKey: getAuthErrorKey(error) ?? 'generic' });
    }
  };

  // Once the address is verified this notice is unmounted, so reaching 'pending' means it still is not.
  const handleCheck = async () => {
    setState('checking');
    await refreshMemberProfile();
    setState('pending');
  };

  return (
    <div className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5 text-start">
      <p className="flex items-center gap-2 font-bold text-amber-200">
        <MailCheck className="size-5 shrink-0" />
        {t('profile.verify.title')}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/90">{t('profile.verify.text')}</p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button type="button" onClick={handleSend} disabled={busy} className="btn btn-ghost btn-sm disabled:cursor-wait">
          {state === 'sending' ? <LoaderCircle className="size-4 animate-spin" /> : <Mail className="size-4" />}
          {t('profile.verify.send')}
        </button>
        <button type="button" onClick={handleCheck} disabled={busy} className="btn btn-ghost btn-sm disabled:cursor-wait">
          {state === 'checking' ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {t('profile.verify.check')}
        </button>
      </div>

      {(state === 'sent' || state === 'pending') && (
        <p role="status" className="mt-3 text-sm font-medium text-white/90">
          {t(`profile.verify.${state}`)}
        </p>
      )}
      {state.errorKey && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-medium text-bow">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {t(`auth.errors.${state.errorKey}`)}
        </p>
      )}
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
        <dl className="relative mt-6 divide-y divide-edge rounded-2xl border border-edge bg-space/50">
          <AccountRow icon={User} label={t('profile.account.name')}>
            {name}
          </AccountRow>
          <AccountRow icon={Mail} label={t('profile.account.email')} dir="ltr">
            {user.email}
          </AccountRow>
        </dl>
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
