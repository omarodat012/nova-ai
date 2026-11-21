import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LoaderCircle, LogIn, UserRound } from 'lucide-react';
import AccountOverview from '../components/profile/AccountOverview.jsx';
import DisplayNameForm from '../components/profile/DisplayNameForm.jsx';
import MemberIdCard from '../components/profile/MemberIdCard.jsx';
import ProfileForm from '../components/profile/ProfileForm.jsx';
import FirebaseNotice from '../components/ui/FirebaseNotice.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const EASE = [0.22, 1, 0.36, 1];

function Screen({ children }) {
  return (
    <section className="relative flex min-h-svh items-center pb-20 pt-32">
      <div className="mx-auto w-full max-w-lg px-5">{children}</div>
    </section>
  );
}

function BackHomeLink({ className = '' }) {
  const { t } = useLanguage();

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-white ${className}`}
    >
      <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" />
      {t('common.backHome')}
    </Link>
  );
}

function GuestCard() {
  const { t } = useLanguage();
  const { openAuth } = useOutletContext();

  return (
    <Screen>
      <motion.div
        className="glass-strong relative overflow-hidden rounded-[2rem] px-6 py-10 text-center shadow-[0_40px_120px_-40px_rgba(79,140,255,0.55)] sm:px-10"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -end-24 -top-24 size-64 rounded-full bg-electric opacity-15 blur-3xl"
        />
        <span className="relative mx-auto grid size-20 place-items-center rounded-3xl border border-edge bg-electric/15 text-logo-blue">
          <UserRound className="size-10" strokeWidth={1.5} />
        </span>
        <h1 className="relative mt-6 text-3xl font-extrabold">{t('profile.guest.title')}</h1>
        <p className="relative mt-3 leading-loose text-muted">{t('profile.guest.text')}</p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={openAuth} className="btn btn-primary">
            <LogIn className="size-5 rtl:-scale-x-100" />
            {t('nav.login')}
          </button>
          <Link to="/" className="btn btn-ghost">
            <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" />
            {t('common.backHome')}
          </Link>
        </div>
      </motion.div>
    </Screen>
  );
}

// /profile: the member card and editable details for members, the account summary for everyone else who is signed in.
export default function Profile() {
  const { t } = useLanguage();
  const { user, loading, isConfigured, memberProfile, memberLoading } = useAuth();

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

  if (loading || memberLoading) {
    return (
      <Screen>
        <div role="status" className="flex flex-col items-center gap-3 text-muted">
          <LoaderCircle className="size-9 animate-spin text-logo-blue" />
          {t('profile.loading')}
        </div>
      </Screen>
    );
  }

  if (!user) return <GuestCard />;

  return (
    <section className="relative pb-24 pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(124,58,237,0.22),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <BackHomeLink />

        {memberProfile ? (
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <MemberIdCard member={memberProfile} />
            </div>
            <motion.div
              className="grid gap-8"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            >
              {/* Keyed so the form starts from the right document if the account changes while the page is open. */}
              <ProfileForm key={memberProfile.id} member={memberProfile} />
              <div className="glass rounded-[2rem] p-6 sm:p-9">
                <h2 className="text-2xl font-bold">{t('profile.displayName.label')}</h2>
                <p className="mt-1.5 leading-relaxed text-muted">{t('profile.displayName.memberHint')}</p>
                <DisplayNameForm key={user.uid} className="mt-6" />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="mt-6">
            <AccountOverview user={user} />
          </div>
        )}
      </div>
    </section>
  );
}
