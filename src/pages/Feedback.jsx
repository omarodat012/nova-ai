import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  LoaderCircle,
  LogIn,
  MessageSquareHeart,
  RotateCcw,
  Send,
  Tags,
  UserRound,
} from 'lucide-react';
import { SelectField, TextAreaField } from '../components/forms/FormFields.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import FirebaseNotice from '../components/ui/FirebaseNotice.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { feedbackCategories, getFeedbackCategory } from '../data/feedbackCategories.js';
import { submitFeedback } from '../services/feedbackService.js';

const EASE = [0.22, 1, 0.36, 1];
const MESSAGE_MAX = 3000;

function BackHomeLink() {
  const { t } = useLanguage();

  return (
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-white">
      <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" />
      {t('common.backHome')}
    </Link>
  );
}

function PageHeader() {
  const { t } = useLanguage();

  return (
    <motion.header
      className="mx-auto max-w-2xl text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-edge bg-surface/60 px-4 py-1.5 text-sm font-medium text-logo-blue backdrop-blur-md">
        <MessageSquareHeart className="size-4" />
        {t('feedback.badge')}
      </span>
      <h1 className="mt-5 text-4xl font-extrabold leading-snug sm:text-5xl sm:leading-snug">
        <span className="text-gradient">{t('feedback.title')}</span>
      </h1>
      <p className="mt-4 text-lg leading-loose text-muted">{t('feedback.text')}</p>
    </motion.header>
  );
}

function GuestCard() {
  const { t } = useLanguage();
  const { openAuth } = useOutletContext();

  return (
    <motion.div
      className="glass-strong relative mx-auto mt-10 max-w-lg overflow-hidden rounded-[2rem] px-6 py-10 text-center shadow-[0_40px_120px_-40px_rgba(79,140,255,0.55)] sm:px-10"
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -end-24 -top-24 size-64 rounded-full bg-electric opacity-15 blur-3xl" />
      <span className="relative mx-auto grid size-20 place-items-center rounded-3xl border border-edge bg-electric/15 text-logo-blue">
        <UserRound className="size-10" strokeWidth={1.5} />
      </span>
      <h2 className="relative mt-6 text-2xl font-extrabold">{t('feedback.guest.title')}</h2>
      <p className="relative mt-3 leading-loose text-muted">{t('feedback.guest.text')}</p>
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
  );
}

function ThankYouCard({ category, onReset }) {
  const { t, localize } = useLanguage();
  const CategoryIcon = category.icon;

  return (
    <motion.div
      role="status"
      className="flex flex-col items-center py-4 text-center"
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <div className="relative grid size-24 place-items-center">
        <span aria-hidden="true" className="bg-brand absolute inset-2 animate-pulse-ring rounded-full" />
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#4F8CFF,#7C3AED,#F472B6,#4F8CFF)] blur-[2px]"
        />
        <motion.span
          className="bg-brand relative grid size-20 place-items-center rounded-full shadow-[0_0_44px_-4px_rgba(124,58,237,0.9)]"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
        >
          <Check className="size-10" strokeWidth={3} />
        </motion.span>
      </div>

      <motion.h2
        className="mt-7 text-2xl font-extrabold sm:text-3xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
      >
        {t('feedback.success.title')}
      </motion.h2>
      <motion.p
        className="mt-3 max-w-md leading-relaxed text-muted"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
      >
        {t('feedback.success.text')}
      </motion.p>
      <motion.p
        className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold"
        style={{ borderColor: `${category.accent}66`, background: `${category.accent}1f` }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
      >
        <CategoryIcon className="size-4" style={{ color: category.accent }} />
        {localize(category.label)}
      </motion.p>
      <motion.button
        type="button"
        onClick={onReset}
        className="btn btn-ghost mt-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        <RotateCcw className="size-4" />
        {t('feedback.success.again')}
      </motion.button>
    </motion.div>
  );
}

function FeedbackForm() {
  const { t, localize } = useLanguage();
  const { user, memberProfile } = useAuth();
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [sent, setSent] = useState(null);

  const name = user.displayName?.trim() || memberProfile?.fullName || user.email?.split('@')[0] || '';
  const errors = {
    category: category ? undefined : 'category',
    message: message.trim() ? undefined : 'required',
  };
  const submitting = status === 'submitting';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    if (errors.category || errors.message) {
      event.currentTarget.elements[errors.category ? 'category' : 'message']?.focus();
      return;
    }

    setStatus('submitting');
    try {
      await submitFeedback({
        uid: user.uid,
        userName: name,
        userEmail: user.email ?? null,
        isMember: Boolean(memberProfile),
        category,
        message: message.trim(),
      });
      setSent(getFeedbackCategory(category));
      setStatus('idle');
    } catch (error) {
      console.error('[NOVA AI] Could not submit the feedback.', error);
      setStatus(error.code === 'firebase/not-configured' ? 'not-configured' : 'error');
    }
  };

  const handleReset = () => {
    setCategory('');
    setMessage('');
    setAttempted(false);
    setSent(null);
  };

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
      <span aria-hidden="true" className="pointer-events-none absolute -end-28 -top-28 size-72 rounded-full bg-neon opacity-20 blur-3xl" />
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <ThankYouCard key="success" category={sent} onReset={handleReset} />
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            className="relative"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <fieldset disabled={submitting} className="min-w-0 space-y-5">
              <div className="flex items-center gap-3.5 rounded-2xl border border-edge bg-space/50 p-3.5">
                <Avatar photoURL={memberProfile?.photoURL || user.photoURL} name={name} className="size-11 text-base ring-2 ring-edge" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">{t('feedback.form.sentAs')}</p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold [overflow-wrap:anywhere]">
                    {name}
                    {memberProfile && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-bow/50 bg-bow/10 px-2 py-0.5 text-xs text-bow">
                        <BadgeCheck className="size-3.5" />
                        {t('feedback.form.memberBadge')}
                      </span>
                    )}
                  </p>
                  <p dir="ltr" className="truncate text-sm text-muted rtl:text-right">
                    {user.email}
                  </p>
                </div>
              </div>

              <SelectField
                icon={Tags}
                label={t('feedback.form.category')}
                name="category"
                placeholder={t('feedback.form.categoryPlaceholder')}
                value={category}
                error={attempted ? errors.category : undefined}
                onChange={(event) => setCategory(event.target.value)}
              >
                {feedbackCategories.map((item) => (
                  <option key={item.id} value={item.id} className="bg-surface text-white">
                    {localize(item.label)}
                  </option>
                ))}
              </SelectField>

              <TextAreaField
                label={t('feedback.form.message')}
                name="message"
                rows={8}
                value={message}
                maxLength={MESSAGE_MAX}
                placeholder={t('feedback.form.messagePlaceholder')}
                hint={`${t('feedback.form.messageHint')} ${message.length}/${MESSAGE_MAX}`}
                error={attempted ? errors.message : undefined}
                onChange={(event) => setMessage(event.target.value)}
              />

              {status === 'error' && (
                <p role="alert" className="flex items-center gap-2 rounded-2xl border border-bow/40 bg-bow/10 px-4 py-3 text-sm font-medium">
                  <CircleAlert className="size-4 shrink-0 text-bow" />
                  {t('feedback.form.error')}
                </p>
              )}
              {status === 'not-configured' && <FirebaseNotice />}

              <button type="submit" className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-80">
                {submitting ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" />
                    {t('feedback.form.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="size-5 rtl:-scale-x-100" />
                    {t('feedback.form.submit')}
                  </>
                )}
              </button>
            </fieldset>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// /feedback: a short form for any signed-in account; visitors are invited to sign in first.
export default function Feedback() {
  const { t } = useLanguage();
  const { user, loading, isConfigured } = useAuth();

  return (
    <section className="relative pb-24 pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(244,114,182,0.18),transparent)]"
      />

      <div className="relative mx-auto max-w-3xl px-5">
        <div className="mb-8">
          <BackHomeLink />
        </div>
        <PageHeader />

        {!isConfigured ? (
          <div className="mx-auto mt-10 max-w-lg">
            <FirebaseNotice />
          </div>
        ) : loading ? (
          <div role="status" className="mt-14 flex flex-col items-center gap-3 text-muted">
            <LoaderCircle className="size-9 animate-spin text-logo-blue" />
            {t('feedback.loading')}
          </div>
        ) : !user ? (
          <GuestCard />
        ) : (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
          >
            <FeedbackForm key={user.uid} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
