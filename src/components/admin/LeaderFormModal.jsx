import { useState } from 'react';
import { BookOpen, Camera, CircleAlert, GraduationCap, LoaderCircle, Mail, Phone, Save, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { academicYears } from '../../data/academicYears.js';
import { useFormFields } from '../../hooks/useFormFields.js';
import { isValidEmail, isValidPhone, toLatinDigits } from '../../utils/validation.js';
import { SelectField, TextField } from '../forms/FormFields.jsx';
import Modal from '../ui/Modal.jsx';

const FIELD_ORDER = ['nameAr', 'nameEn', 'email', 'phone', 'majorAr', 'majorEn', 'academicYear', 'photo'];
const PHOTO_SOURCE = /^(https?:\/\/\S+|\/.+\.(jpe?g|png|webp|gif|avif|svg))$/i;
// Select value for a year typed by hand in src/data/subteams.js that is not one of the standard options.
const CUSTOM_YEAR = 'custom';

function findYear(academicYear) {
  return academicYears.find((year) => year.label.ar === academicYear?.ar || year.label.en === academicYear?.en);
}

// 'assets\leaders\omar.jpg' and 'public/assets/leaders/omar.jpg' both become '/assets/leaders/omar.jpg'.
function toPhotoPath(value) {
  const text = value.trim();
  if (!text || /^https?:\/\//i.test(text)) return text;
  return `/${text.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^public\//i, '')}`;
}

function toFormValues(leader) {
  const hasYear = Boolean(leader?.academicYear?.ar || leader?.academicYear?.en);

  return {
    nameAr: leader?.name.ar ?? '',
    nameEn: leader?.name.en ?? '',
    email: leader?.email ?? '',
    phone: leader?.phone ?? '',
    majorAr: leader?.major.ar ?? '',
    majorEn: leader?.major.en ?? '',
    academicYear: findYear(leader?.academicYear)?.id ?? (hasYear ? CUSTOM_YEAR : ''),
    photo: leader?.photo ?? '',
  };
}

// Only the name is required; everything else is validated when given.
function validate(values) {
  const errors = {};

  if (!values.nameAr.trim()) errors.nameAr = 'required';
  if (!values.nameEn.trim()) errors.nameEn = 'required';
  if (values.email.trim() && !isValidEmail(values.email)) errors.email = 'email';
  if (values.phone.trim() && !isValidPhone(values.phone)) errors.phone = 'phone';
  if (values.photo.trim() && !PHOTO_SOURCE.test(toPhotoPath(values.photo))) errors.photo = 'photoPath';

  return errors;
}

function toLeader(values, original) {
  const year = academicYears.find((item) => item.id === values.academicYear);

  return {
    name: { ar: values.nameAr.trim(), en: values.nameEn.trim() },
    photo: toPhotoPath(values.photo),
    email: values.email.trim().toLowerCase(),
    phone: toLatinDigits(values.phone.trim()),
    major: { ar: values.majorAr.trim(), en: values.majorEn.trim() },
    academicYear:
      values.academicYear === CUSTOM_YEAR ? original.academicYear : { ar: year?.label.ar ?? '', en: year?.label.en ?? '' },
  };
}

function LeaderForm({ leader, teamName, onSave, onClose }) {
  const { t, localize } = useLanguage();
  const { values, fieldProps, validateAll } = useFormFields(toFormValues(leader), validate);
  const [status, setStatus] = useState('idle');
  const saving = status === 'saving';
  const hasCustomYear = toFormValues(leader).academicYear === CUSTOM_YEAR;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !validateAll(event.currentTarget, FIELD_ORDER)) return;

    setStatus('saving');
    try {
      await onSave(toLeader(values, leader));
      onClose();
    } catch (error) {
      console.error('[NOVA AI] Could not save the leader.', error);
      setStatus(error.code === 'permission-denied' ? 'denied' : 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 pb-7 pt-12 sm:px-8">
      <h2 id="leader-form-title" className="text-2xl font-bold">
        {t(leader ? 'admin.leaders.editTitle' : 'admin.leaders.addTitle')}
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        <span className="font-bold text-white">{teamName}</span>
        {' · '}
        {t('form.requiredNote')}
      </p>

      <fieldset disabled={saving} className="mt-6 min-w-0 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            icon={User}
            label={t('admin.leaders.nameAr')}
            type="text"
            dir="rtl"
            lang="ar"
            maxLength={80}
            {...fieldProps('nameAr')}
          />
          <TextField
            icon={User}
            label={t('admin.leaders.nameEn')}
            type="text"
            dir="ltr"
            lang="en"
            maxLength={80}
            {...fieldProps('nameEn')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            icon={Mail}
            label={t('form.email')}
            type="email"
            inputMode="email"
            placeholder="leader@example.com"
            dir="ltr"
            required={false}
            {...fieldProps('email')}
          />
          <TextField
            icon={Phone}
            label={t('form.phone')}
            type="tel"
            inputMode="tel"
            placeholder="+962 7X XXX XXXX"
            dir="ltr"
            required={false}
            {...fieldProps('phone')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            icon={BookOpen}
            label={t('admin.leaders.majorAr')}
            type="text"
            dir="rtl"
            lang="ar"
            maxLength={120}
            required={false}
            {...fieldProps('majorAr')}
          />
          <TextField
            icon={BookOpen}
            label={t('admin.leaders.majorEn')}
            type="text"
            dir="ltr"
            lang="en"
            maxLength={120}
            required={false}
            {...fieldProps('majorEn')}
          />
        </div>

        <div className="sm:w-1/2">
          <SelectField
            icon={GraduationCap}
            label={t('form.academicYear')}
            placeholder={t('admin.leaders.noAcademicYear')}
            required={false}
            {...fieldProps('academicYear')}
          >
            {hasCustomYear && (
              <option value={CUSTOM_YEAR} className="bg-surface text-white">
                {localize(leader.academicYear)}
              </option>
            )}
            {academicYears.map((year) => (
              <option key={year.id} value={year.id} className="bg-surface text-white">
                {localize(year.label)}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          icon={Camera}
          label={t('admin.leaders.photo')}
          type="text"
          dir="ltr"
          placeholder="/assets/leaders/leader-name.jpg"
          required={false}
          hint={t('admin.leaders.photoHint')}
          {...fieldProps('photo')}
        />

        {(status === 'error' || status === 'denied') && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-bow/40 bg-bow/10 px-4 py-3 text-sm font-medium leading-relaxed"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-bow" />
            {t(status === 'denied' ? 'admin.errors.permission' : 'admin.errors.action')}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            {t('admin.common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary disabled:cursor-wait disabled:opacity-80">
            {saving ? <LoaderCircle className="size-5 animate-spin" /> : <Save className="size-5" />}
            {t(saving ? 'admin.common.saving' : 'admin.common.save')}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

// `leader` is the leader being edited, or null to add one. `onSave(leader)` resolves once the team's list is stored.
export default function LeaderFormModal({ open, leader, teamName, onSave, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="leader-form-title" className="max-w-2xl">
      <LeaderForm leader={leader} teamName={teamName} onSave={onSave} onClose={onClose} />
    </Modal>
  );
}
