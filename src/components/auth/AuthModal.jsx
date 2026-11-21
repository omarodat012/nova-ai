import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, LoaderCircle, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getAuthErrorKey } from '../../firebase/authErrors.js';
import { Logo } from '../ui/Brand.jsx';
import { GoogleIcon } from '../ui/BrandIcons.jsx';
import FirebaseNotice from '../ui/FirebaseNotice.jsx';
import Modal from '../ui/Modal.jsx';
import VerifyEmailStep from './VerifyEmailStep.jsx';

const MODES = ['login', 'signup'];
const MIN_PASSWORD_LENGTH = 6;

function Field({ icon: Icon, label, dir, ...inputProps }) {
  const id = useId();
  const { dir: pageDir } = useLanguage();
  const spacing = dir && dir !== pageDir ? 'pe-10 text-end' : 'ps-10';

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-logo-blue" />
        <input id={id} dir={dir} className={`field ${spacing}`} required {...inputProps} />
      </div>
    </div>
  );
}

function AuthForm({ onSuccess }) {
  const { t } = useLanguage();
  const { isConfigured, signUp, logIn, logInWithGoogle } = useAuth();
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ displayName: '', email: '', password: '' });
  // `pending` names the action in flight ('password' | 'google') so only its button shows the spinner.
  const [pending, setPending] = useState(null);
  const [errorKey, setErrorKey] = useState(null);

  const isSignup = mode === 'signup';
  const busy = pending !== null;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorKey(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const run = async (kind, action) => {
    if (busy) return;
    setPending(kind);
    setErrorKey(null);
    try {
      onSuccess(await action());
    } catch (error) {
      const key = getAuthErrorKey(error);
      if (key === 'generic') console.error('[NOVA AI] Sign-in failed.', error);
      setErrorKey(key);
      setPending(null);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSignup && !values.displayName.trim()) {
      setErrorKey('nameRequired');
      return;
    }
    run('password', () => (isSignup ? signUp(values) : logIn(values)));
  };

  return (
    <div className="px-6 pb-8 pt-12 sm:px-9">
      <div className="flex flex-col items-center text-center">
        <Logo className="size-14" />
        <h2 id="auth-title" className="mt-4 text-2xl font-bold">
          {t(isSignup ? 'auth.signupTitle' : 'auth.loginTitle')}
        </h2>
      </div>

      {!isConfigured && <FirebaseNotice className="mt-6" />}

      <AnimatePresence initial={false}>
        {errorKey && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-start gap-2.5 rounded-2xl border border-bow/35 bg-bow/10 px-4 py-3 text-sm leading-relaxed text-white"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-bow" />
            {t(`auth.errors.${errorKey}`)}
          </motion.p>
        )}
      </AnimatePresence>

      <fieldset disabled={busy || !isConfigured} className="min-w-0 disabled:opacity-60">
        <div className="mt-6 grid grid-cols-2 rounded-full border border-edge bg-space/60 p-1" role="tablist">
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => switchMode(item)}
              className={`relative rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                mode === item ? 'text-white' : 'text-muted hover:text-white'
              }`}
            >
              {mode === item && (
                <motion.span
                  layoutId="auth-tab-pill"
                  className="bg-brand absolute inset-0 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t(item === 'login' ? 'auth.loginTab' : 'auth.signupTab')}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <Field
              icon={User}
              label={t('auth.name')}
              type="text"
              name="displayName"
              autoComplete="name"
              maxLength={80}
              placeholder={t('auth.namePlaceholder')}
              value={values.displayName}
              onChange={handleChange}
            />
          )}
          <Field
            icon={Mail}
            label={t('auth.email')}
            type="email"
            name="email"
            dir="ltr"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
          />
          <Field
            icon={Lock}
            label={t('auth.password')}
            type="password"
            name="password"
            dir="ltr"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
            value={values.password}
            onChange={handleChange}
          />

          <button type="submit" className="btn btn-primary w-full disabled:cursor-not-allowed">
            {pending === 'password' && <LoaderCircle className="size-5 animate-spin" />}
            {t(isSignup ? 'auth.submitSignup' : 'auth.submitLogin')}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-medium text-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-edge" />
          {t('auth.or')}
          <span className="h-px flex-1 bg-edge" />
        </div>

        <button
          type="button"
          onClick={() => run('google', logInWithGoogle)}
          className="btn btn-ghost w-full disabled:cursor-not-allowed"
        >
          {pending === 'google' ? <LoaderCircle className="size-5 animate-spin" /> : <GoogleIcon className="size-5" />}
          {t('auth.google')}
        </button>
      </fieldset>
    </div>
  );
}

const STEP_MOTION = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.22, ease: 'easeOut' },
};

// Signing in closes the modal, unless the address still has to be verified: then it moves on to that step.
function AuthFlow({ initialStep, onClose, onVerified }) {
  const { user } = useAuth();
  const [step, setStep] = useState(initialStep);
  const verifying = step === 'verify' && Boolean(user);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={verifying ? 'verify' : 'form'} {...STEP_MOTION}>
        {verifying ? (
          <VerifyEmailStep onVerified={onVerified} />
        ) : (
          <AuthForm onSuccess={(signedIn) => (signedIn.emailVerified ? onClose() : setStep('verify'))} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// `initialStep` is 'form' (log in / sign up) or 'verify' (straight to "Verify your email" for a signed-in account).
export default function AuthModal({ open, initialStep = 'form', onClose, onVerified }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="auth-title" className="max-w-md">
      <AuthFlow initialStep={initialStep} onClose={onClose} onVerified={onVerified} />
    </Modal>
  );
}
