import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, CircleAlert, CircleCheck, Inbox, LoaderCircle, MailCheck, MousePointerClick, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getAuthErrorKey } from '../../firebase/authErrors.js';

const RESEND_COOLDOWN_SECONDS = 60;
const DISABLED = 'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
const TONES = {
  success: 'border-emerald-400/40 bg-emerald-400/10 [&>svg]:text-emerald-300',
  warning: 'border-amber-300/35 bg-amber-300/10 [&>svg]:text-amber-200',
  error: 'border-bow/40 bg-bow/10 [&>svg]:text-bow',
};

// Seconds left before another email may be sent, counting down from the moment the last one went out.
function useCooldown(startedAt) {
  const [now, setNow] = useState(Date.now);
  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : RESEND_COOLDOWN_SECONDS;
  // `now` can be older than a link that was just sent, hence the upper bound.
  const remaining = Math.min(RESEND_COOLDOWN_SECONDS, Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed));

  useEffect(() => {
    if (remaining === 0) return undefined;
    const timer = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(timer);
  }, [remaining, now]);

  return remaining;
}

function Step({ icon: Icon, iconClass, children }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className={`mt-1 size-4 shrink-0 ${iconClass}`} />
      {children}
    </li>
  );
}

// The second step of the auth modal: a password account waiting for its verification link to be opened.
export default function VerifyEmailStep({ onVerified }) {
  const { t } = useLanguage();
  const { user, verificationSentAt, sendVerificationEmail, confirmEmailVerified } = useAuth();
  // 'idle' | 'checking' | 'sending' | 'pending' | 'resent' | { errorKey }
  const [state, setState] = useState('idle');
  const remaining = useCooldown(verificationSentAt);
  const busy = state === 'checking' || state === 'sending';

  const handleContinue = async () => {
    setState('checking');
    try {
      const { verified, member } = await confirmEmailVerified();
      if (verified) onVerified(member);
      else setState('pending');
    } catch (error) {
      console.error('[NOVA AI] Could not check the email verification.', error);
      setState({ errorKey: getAuthErrorKey(error) ?? 'generic' });
    }
  };

  const handleResend = async () => {
    setState('sending');
    try {
      await sendVerificationEmail();
      setState('resent');
    } catch (error) {
      console.error('[NOVA AI] Could not send the verification email.', error);
      setState({ errorKey: getAuthErrorKey(error) ?? 'generic' });
    }
  };

  const message =
    (state === 'pending' && { tone: 'warning', icon: CircleAlert, text: t('auth.verify.pending') }) ||
    (state === 'resent' && { tone: 'success', icon: CircleCheck, text: t('auth.verify.resent') }) ||
    (state.errorKey && { tone: 'error', icon: CircleAlert, text: t(`auth.errors.${state.errorKey}`) }) ||
    null;

  return (
    <div className="px-6 pb-8 pt-12 text-center sm:px-9">
      <span className="relative mx-auto grid size-20 place-items-center">
        <span className="absolute inset-2 animate-pulse-ring rounded-full bg-electric/50" />
        <span className="bg-brand relative grid size-16 place-items-center rounded-full shadow-[0_0_34px_-4px_rgba(124,58,237,0.9)]">
          <MailCheck className="size-8" strokeWidth={1.75} />
        </span>
      </span>

      <h2 id="auth-title" className="mt-4 text-2xl font-bold">
        {t('auth.verify.title')}
      </h2>
      <p className="mt-2.5 text-sm text-muted">{t(verificationSentAt ? 'auth.verify.sentTo' : 'auth.verify.notVerified')}</p>
      <p
        dir="ltr"
        className="mx-auto mt-2.5 w-fit max-w-full rounded-full border border-edge bg-space/60 px-4 py-2 text-sm font-bold [overflow-wrap:anywhere]"
      >
        {user.email}
      </p>

      <ul className="mt-5 space-y-3 rounded-2xl border border-edge bg-space/40 p-4 text-start text-sm leading-relaxed text-white/90">
        <Step icon={MousePointerClick} iconClass="text-logo-blue">
          {t('auth.verify.instructions')}
        </Step>
        <Step icon={Inbox} iconClass="text-amber-200">
          {t('auth.verify.spam')}
        </Step>
        <Step icon={Sparkles} iconClass="text-bow">
          {t('auth.verify.membershipNote')}
        </Step>
      </ul>

      <AnimatePresence mode="wait" initial={false}>
        {message && (
          <motion.p
            key={message.text}
            role={message.tone === 'error' ? 'alert' : 'status'}
            className={`mt-4 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-start text-sm font-medium leading-relaxed ${TONES[message.tone]}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <message.icon className="mt-0.5 size-4 shrink-0" />
            {message.text}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-6 grid gap-3">
        <button type="button" onClick={handleContinue} disabled={busy} className={`btn btn-primary w-full whitespace-normal ${DISABLED}`}>
          {state === 'checking' ? <LoaderCircle className="size-5 shrink-0 animate-spin" /> : <BadgeCheck className="size-5 shrink-0" />}
          {t('auth.verify.continue')}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={busy || remaining > 0}
          className={`btn btn-ghost w-full tabular-nums ${DISABLED}`}
        >
          {state === 'sending' ? <LoaderCircle className="size-5 animate-spin" /> : <RefreshCw className="size-4" />}
          {remaining > 0 ? `${t('auth.verify.resendIn')} ${remaining} ${t('auth.verify.seconds')}` : t('auth.verify.resend')}
        </button>
      </div>
    </div>
  );
}
