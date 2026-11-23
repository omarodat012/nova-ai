import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Camera, CircleAlert, CircleCheck, LoaderCircle, Phone, Save, Trash2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getMemberPhoto } from '../../data/memberRoles.js';
import { useFormFields } from '../../hooks/useFormFields.js';
import { createSupervisorProfile, updateOwnProfile } from '../../services/membersService.js';
import { resizeImageToDataUrl } from '../../utils/resizeImage.js';
import { isValidPhone, toLatinDigits } from '../../utils/validation.js';
import { TextField } from '../forms/FormFields.jsx';
import StudentSection, { STUDENT_FIELDS } from '../forms/StudentSection.jsx';
import Avatar from '../ui/Avatar.jsx';
import FormMessage from './FormMessage.jsx';

const FIELD_ORDER = ['fullName', 'phone', ...STUDENT_FIELDS];

function toFormValues(member) {
  return {
    fullName: member.fullName ?? '',
    phone: member.phone ?? '',
    isStudent: Boolean(member.isStudent),
    major: member.major ?? '',
    university: member.university ?? '',
    academicYear: member.academicYear ?? '',
  };
}

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = 'required';
  if (values.phone.trim() && !isValidPhone(values.phone)) errors.phone = 'phone';
  if (values.isStudent) {
    STUDENT_FIELDS.forEach((name) => {
      if (!values[name].trim()) errors[name] = 'required';
    });
  }

  return errors;
}

// Exactly the fields firestore.rules lets a member change on their own document.
function toProfile(values, photoURL) {
  return {
    fullName: values.fullName.trim(),
    phone: toLatinDigits(values.phone.trim()) || null,
    isStudent: values.isStudent,
    major: values.isStudent ? values.major.trim() : null,
    university: values.isStudent ? values.university.trim() : null,
    academicYear: values.isStudent ? values.academicYear : null,
    photoURL,
  };
}

// Lets a member edit their own details. `member` is their saved `members` document ({ id, ...fields }).
export default function ProfileForm({ member }) {
  const { t } = useLanguage();
  const { refreshMemberProfile, isSupervisor } = useAuth();
  const { values, fieldProps, toggleStudent, validateAll } = useFormFields(toFormValues(member), validate);
  const [photoURL, setPhotoURL] = useState(member.photoURL ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  // 'idle' | 'saving' | 'saved' | 'permission' | 'save' (the last two are keys under profile.errors)
  const [status, setStatus] = useState('idle');
  const fileRef = useRef(null);

  const saving = status === 'saving';
  const profile = toProfile(values, photoURL);
  const saved = toProfile(toFormValues(member), member.photoURL ?? null);
  const dirty = Object.keys(profile).some((field) => profile[field] !== saved[field]);

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    // Lets the same file be picked again after removing it.
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('photoType');
      return;
    }

    setPhotoBusy(true);
    setPhotoError(null);
    try {
      setPhotoURL(await resizeImageToDataUrl(file));
    } catch {
      setPhotoError('photoRead');
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || photoBusy || !validateAll(event.currentTarget, FIELD_ORDER)) return;

    setStatus('saving');
    try {
      // `unsaved` is the supervisor's stand-in profile: her first save creates the document.
      await (member.unsaved ? createSupervisorProfile(member.email, profile) : updateOwnProfile(member.id, profile));
      await refreshMemberProfile();
      setStatus('saved');
    } catch (error) {
      console.error('[NOVA AI] Could not save the profile.', error);
      setStatus(error?.code === 'permission-denied' ? 'permission' : 'save');
    }
  };

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-28 -top-28 size-72 rounded-full bg-neon opacity-20 blur-3xl"
      />

      <form onSubmit={handleSubmit} noValidate className="relative">
        <h2 className="text-2xl font-bold">{t('profile.form.title')}</h2>
        <p className="mt-1.5 leading-relaxed text-muted">{t('profile.form.text')}</p>

        <fieldset disabled={saving} className="mt-6 min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-edge bg-space/40 p-4">
            <Avatar
              photoURL={getMemberPhoto({ ...member, photoURL })}
              name={values.fullName}
              className="size-20 text-3xl ring-2 ring-edge"
            />
            <div className="min-w-0 flex-1 basis-52">
              <p className="font-bold">{t('profile.form.photo')}</p>
              <p className="mt-0.5 text-sm text-muted">{t('profile.form.photoHint')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={photoBusy}
                  className="btn btn-ghost btn-sm disabled:cursor-wait"
                >
                  {photoBusy ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
                  {t(photoURL ? 'profile.form.change' : 'profile.form.upload')}
                </button>
                {photoURL && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoURL(null);
                      setPhotoError(null);
                    }}
                    className="btn btn-sm border border-bow/40 bg-bow/10 text-white hover:bg-bow/20"
                  >
                    <Trash2 className="size-4 text-bow" />
                    {t('profile.form.remove')}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} hidden />
              {photoError && (
                <p role="alert" className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-bow">
                  <CircleAlert className="size-4 shrink-0" />
                  {t(`profile.errors.${photoError}`)}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              icon={User}
              label={t('form.fullName')}
              type="text"
              autoComplete="name"
              maxLength={120}
              placeholder={t('form.fullNamePlaceholder')}
              {...fieldProps('fullName')}
            />
            <TextField
              icon={Phone}
              label={t('form.phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+962 7X XXX XXXX"
              dir="ltr"
              required={false}
              {...fieldProps('phone')}
            />
          </div>

          {!isSupervisor && <StudentSection checked={values.isStudent} onToggle={toggleStudent} fieldProps={fieldProps} />}

          <AnimatePresence mode="wait" initial={false}>
            {(status === 'permission' || status === 'save') && (
              <FormMessage key="error" tone="error" icon={CircleAlert}>
                {t(`profile.errors.${status}`)}
              </FormMessage>
            )}
            {status === 'saved' && !dirty && (
              <FormMessage key="saved" tone="success" icon={CircleCheck}>
                {t('profile.form.saved')}
              </FormMessage>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="submit"
              disabled={!(dirty || member.unsaved) || photoBusy}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? <LoaderCircle className="size-5 animate-spin" /> : <Save className="size-5" />}
              {t(saving ? 'profile.form.saving' : 'profile.form.save')}
            </button>
            {dirty && !saving && <p className="text-sm text-muted">{t('profile.form.unsaved')}</p>}
          </div>
        </fieldset>
      </form>
    </div>
  );
}
