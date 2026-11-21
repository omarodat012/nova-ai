import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CircleAlert, LoaderCircle, LogIn, ShieldX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getAuthErrorKey } from '../../firebase/authErrors.js';
import { GoogleIcon } from '../ui/BrandIcons.jsx';
import FirebaseNotice from '../ui/FirebaseNotice.jsx';

function Screen({ children }) {
  return (
    <section className="relative flex min-h-svh items-center pb-20 pt-32">
      <div className="mx-auto w-full max-w-lg px-5">{children}</div>
    </section>
  );
}

function BackHomeLink({ primary = false }) {
  const { t } = useLanguage();

  return (
    <Link to="/" className={`btn ${primary ? 'btn-primary' : 'btn-ghost'}`}>
      <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" />
      {t('common.backHome')}
    </Link>
  );
}

// Verifying an admin address means signing in with its Google account, which also links it to the same user.
function GoogleVerifyButton() {
  const { t } = useLanguage();
  const { logInWithGoogle } = useAuth();
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  const handleClick = async () => {
    setPending(true);
    setErrorKey(null);
    try {
      await logInWithGoogle();
    } catch (error) {
      setErrorKey(getAuthErrorKey(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} disabled={pending} className="btn btn-primary disabled:cursor-wait">
        {pending ? <LoaderCircle className="size-5 animate-spin" /> : <GoogleIcon className="size-5" />}
        {t('auth.google')}
      </button>
      {errorKey && (
        <p role="alert" className="flex basis-full items-start justify-center gap-2 text-sm font-medium text-bow">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {t(`auth.errors.${errorKey}`)}
        </p>
      )}
    </>
  );
}

function AccessDenied() {
  const { t } = useLanguage();
  const { user, needsAdminVerification } = useAuth();
  const { openAuth } = useOutletContext();
  const reason = !user ? 'guest' : needsAdminVerification ? 'unverified' : 'member';

  return (
    <Screen>
      <motion.div
        className="glass-strong relative overflow-hidden rounded-[2rem] px-6 py-10 text-center shadow-[0_40px_120px_-40px_rgba(244,114,182,0.55)] sm:px-10"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-24 -top-24 size-64 rounded-full bg-bow opacity-15 blur-3xl"
        />
        <div className="relative mx-auto grid size-20 place-items-center">
          <span aria-hidden="true" className="absolute inset-1 animate-pulse-ring rounded-3xl bg-bow/40" />
          <span className="relative grid size-20 place-items-center rounded-3xl border border-bow/45 bg-bow/10 text-bow">
            <ShieldX className="size-10" strokeWidth={1.5} />
          </span>
        </div>

        <h1 className="relative mt-6 text-3xl font-extrabold">{t('admin.denied.title')}</h1>
        <p className="relative mt-3 leading-loose text-muted">{t(`admin.denied.${reason}`)}</p>
        {user && (
          <p className="relative mt-4 text-sm text-muted">
            {t('admin.denied.signedInAs')}{' '}
            <bdi dir="ltr" className="font-bold text-white [overflow-wrap:anywhere]">
              {user.email}
            </bdi>
          </p>
        )}

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          {reason === 'guest' && (
            <button type="button" onClick={openAuth} className="btn btn-primary">
              <LogIn className="size-5 rtl:-scale-x-100" />
              {t('nav.login')}
            </button>
          )}
          {reason === 'unverified' && <GoogleVerifyButton />}
          <BackHomeLink primary={reason === 'member'} />
        </div>
      </motion.div>
    </Screen>
  );
}

// Client-side gate for the admin UI. The data itself is protected by firestore.rules.
export default function ProtectedAdminRoute({ children }) {
  const { t } = useLanguage();
  const { loading, isConfigured, isAdmin } = useAuth();

  if (!isConfigured) {
    return (
      <Screen>
        <FirebaseNotice />
        <div className="mt-6 text-center">
          <BackHomeLink />
        </div>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <div role="status" className="flex flex-col items-center gap-3 text-muted">
          <LoaderCircle className="size-9 animate-spin text-logo-blue" />
          {t('admin.checking')}
        </div>
      </Screen>
    );
  }

  return isAdmin ? children : <AccessDenied />;
}
