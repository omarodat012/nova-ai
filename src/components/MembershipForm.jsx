import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleAlert, LoaderCircle, Mail, Phone, RotateCcw, Send, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getSubteamById, subteams } from '../data/subteams.js';
import { useFormFields } from '../hooks/useFormFields.js';
import { submitApplication } from '../services/applicationsService.js';
import { isValidEmail, isValidPhone, toLatinDigits } from '../utils/validation.js';
import { SelectField, TextField } from './forms/FormFields.jsx';
import StudentSection, { EMPTY_STUDENT_VALUES, STUDENT_FIELDS } from './forms/StudentSection.jsx';
import { TeamLogo } from './subteams/TeamBits.jsx';
import FirebaseNotice from './ui/FirebaseNotice.jsx';

const EMPTY_VALUES = { fullName: '', phone: '', email: '', isStudent: false, ...EMPTY_STUDENT_VALUES, subteam: '' };
const FIELD_ORDER = ['fullName', 'phone', 'email', ...STUDENT_FIELDS, 'subteam'];
const EASE = [0.22, 1, 0.36, 1];

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = 'required';

  if (!values.phone.trim()) errors.phone = 'required';
  else if (!isValidPhone(values.phone)) errors.phone = 'phone';

  if (!values.email.trim()) errors.email = 'required';
  else if (!isValidEmail(values.email)) errors.email = 'email';

  if (values.isStudent) {
    STUDENT_FIELDS.forEach((name) => {
      if (!values[name].trim()) errors[name] = 'required';
    });
  }

  if (!values.subteam) errors.subteam = 'subteam';

  return errors;
}

const SUBMIT_STATUS_BY_CODE = {
  'firebase/not-configured': 'not-configured',
  'application/already-member': 'already-member',
};

function toApplication(values) {
  return {
    fullName: values.fullName.trim(),
    phone: toLatinDigits(values.phone.trim()),
    email: values.email.trim().toLowerCase(),
    isStudent: values.isStudent,
    major: values.isStudent ? values.major.trim() : null,
    university: values.isStudent ? values.university.trim() : null,
    academicYear: values.isStudent ? values.academicYear : null,
    subteam: values.subteam,
  };
}

function SuccessCard({ application, onReset }) {
  const { t, localize } = useLanguage();
  const cardRef = useRef(null);
  const team = getSubteamById(application.subteam);

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      tabIndex={-1}
      role="status"
      className="flex scroll-mt-40 flex-col items-center py-4 text-center outline-none"
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

      <motion.h3
        className="mt-7 text-2xl font-extrabold sm:text-3xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
      >
        {t('form.success.title')}
      </motion.h3>
      <motion.p
        className="mt-3 max-w-md leading-relaxed text-muted"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
      >
        {t('form.success.text')}
      </motion.p>

      <motion.dl
        className="mt-7 w-full max-w-md divide-y divide-edge rounded-3xl border border-edge bg-space/50 text-start"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
      >
        <div className="flex items-center gap-4 p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-edge bg-electric/15 text-logo-blue">
            <User className="size-5" />
          </span>
          <div className="min-w-0">
            <dt className="text-sm text-muted">{t('form.success.name')}</dt>
            <dd className="font-bold break-words">{application.fullName}</dd>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4">
          <TeamLogo team={team} className="size-12" />
          <div className="min-w-0">
            <dt className="text-sm text-muted">{t('form.success.subteam')}</dt>
            <dd className="font-bold">
              {localize(team.name)} <span aria-hidden="true">{team.emoji}</span>
            </dd>
          </div>
        </div>
      </motion.dl>

      <motion.button
        type="button"
        onClick={onReset}
        className="btn btn-ghost mt-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        <RotateCcw className="size-4" />
        {t('form.success.again')}
      </motion.button>
    </motion.div>
  );
}

function ApplicationFlow({ preset }) {
  const { t, localize } = useLanguage();
  const { user } = useAuth();
  const initialValues = {
    ...EMPTY_VALUES,
    fullName: user?.displayName ?? '',
    email: user?.email ?? '',
    subteam: preset,
  };
  const { values, setValues, fieldProps, toggleStudent, validateAll, reset } = useFormFields(initialValues, validate);
  const [status, setStatus] = useState('idle');
  const [application, setApplication] = useState(null);
  const submitting = status === 'submitting';

  // The session resolves after the first render, so fill in the account details once they arrive.
  // Only empty fields are filled; anything the visitor already typed is kept.
  useEffect(() => {
    if (!user) return;
    setValues((current) => ({
      ...current,
      fullName: current.fullName || user.displayName || '',
      email: current.email || user.email || '',
    }));
  }, [user, setValues]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !validateAll(event.currentTarget, FIELD_ORDER)) return;

    setStatus('submitting');
    try {
      setApplication(await submitApplication(toApplication(values)));
      setStatus('idle');
    } catch (error) {
      console.error('[NOVA AI] Could not submit the application.', error);
      setStatus(SUBMIT_STATUS_BY_CODE[error.code] ?? 'error');
    }
  };

  const handleReset = () => {
    reset(initialValues);
    setApplication(null);
  };

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-28 -top-28 size-72 rounded-full bg-neon opacity-20 blur-3xl"
      />
      <AnimatePresence mode="wait" initial={false}>
        {application ? (
          <SuccessCard key="success" application={application} onReset={handleReset} />
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
              <p className="text-sm text-muted">{t('form.requiredNote')}</p>

              <TextField
                icon={User}
                label={t('form.fullName')}
                type="text"
                autoComplete="name"
                placeholder={t('form.fullNamePlaceholder')}
                {...fieldProps('fullName')}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  icon={Phone}
                  label={t('form.phone')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+962 7X XXX XXXX"
                  dir="ltr"
                  {...fieldProps('phone')}
                />
                <TextField
                  icon={Mail}
                  label={t('form.email')}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  dir="ltr"
                  {...fieldProps('email')}
                />
              </div>

              <StudentSection checked={values.isStudent} onToggle={toggleStudent} fieldProps={fieldProps} />

              <SelectField
                icon={Users}
                label={t('form.subteam')}
                placeholder={t('form.subteamPlaceholder')}
                hint={preset && values.subteam === preset ? t('form.subteamPreset') : undefined}
                {...fieldProps('subteam')}
              >
                {subteams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-surface text-white">
                    {localize(team.name)} {team.emoji}
                  </option>
                ))}
              </SelectField>

              {(status === 'error' || status === 'already-member') && (
                <p
                  role="alert"
                  className="flex items-center gap-2 rounded-2xl border border-bow/40 bg-bow/10 px-4 py-3 text-sm font-medium"
                >
                  <CircleAlert className="size-4 shrink-0 text-bow" />
                  {t(status === 'error' ? 'form.errors.submit' : 'form.errors.alreadyMember')}
                </p>
              )}
              {status === 'not-configured' && <FirebaseNotice />}

              <button type="submit" className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-80">
                {submitting ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="size-5 rtl:-scale-x-100" />
                    {t('form.submit')}
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

// The SubTeam starts from `defaultSubteam`, then the `?team=` query param, otherwise unselected.
export default function MembershipForm({ defaultSubteam }) {
  const [searchParams] = useSearchParams();
  const preset = [defaultSubteam, searchParams.get('team')].find((id) => getSubteamById(id)) ?? '';

  return <ApplicationFlow key={preset} preset={preset} />;
}
