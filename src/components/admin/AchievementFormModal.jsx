import { useState } from 'react';
import { CalendarDays, CircleAlert, FolderOpen, LoaderCircle, Save, Type } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useFormFields } from '../../hooks/useFormFields.js';
import { addAchievement, updateAchievement } from '../../services/achievementsService.js';
import { detectedGalleries, GALLERIES_PATH, resolvePhotoSource } from '../../utils/achievementMedia.js';
import { todayISO } from '../../utils/formatDate.js';
import { TextAreaField, TextField } from '../forms/FormFields.jsx';
import Modal from '../ui/Modal.jsx';

const FIELD_ORDER = ['titleAr', 'titleEn', 'descriptionAr', 'descriptionEn', 'date', 'image'];
const REQUIRED_FIELDS = ['titleAr', 'titleEn', 'descriptionAr', 'descriptionEn', 'date'];
const DESCRIPTION_ROWS = 9;

function toFormValues(achievement) {
  return {
    titleAr: achievement?.title?.ar ?? '',
    titleEn: achievement?.title?.en ?? '',
    descriptionAr: achievement?.description?.ar ?? '',
    descriptionEn: achievement?.description?.en ?? '',
    date: achievement?.date ?? todayISO(),
    image: achievement?.image ?? '',
  };
}

function validate(values) {
  const errors = {};

  REQUIRED_FIELDS.forEach((name) => {
    if (!values[name].trim()) errors[name] = 'required';
  });
  if (resolvePhotoSource(values.image).kind === 'invalid') errors.image = 'photoSource';

  return errors;
}

function toAchievement(values) {
  return {
    title: { ar: values.titleAr.trim(), en: values.titleEn.trim() },
    description: { ar: values.descriptionAr.trim(), en: values.descriptionEn.trim() },
    date: values.date,
    image: resolvePhotoSource(values.image).value,
  };
}

// Tells the admin what the typed folder or link resolves to.
function PhotoSourceHint({ source }) {
  const { t } = useLanguage();

  if (source.kind === 'image') return t('admin.achievements.photosSingle');
  if (source.kind !== 'folder') return t('admin.achievements.photosHint');
  if (source.photos.length === 0) {
    return <span className="text-amber-300">{t('admin.achievements.photosMissing')}</span>;
  }
  return (
    <span className="text-emerald-300">
      {t('admin.achievements.photosFound')} {source.photos.length}
    </span>
  );
}

function DetectedFolders({ selectedPath, onSelect }) {
  const { t } = useLanguage();

  if (detectedGalleries.length === 0) {
    return <p className="mt-3 text-sm leading-relaxed text-muted">{t('admin.achievements.noFolders')}</p>;
  }

  return (
    <div className="mt-3">
      <p className="text-sm text-muted">{t('admin.achievements.detectedFolders')}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {detectedGalleries.map((gallery) => {
          const selected = gallery.path === selectedPath;
          return (
            <li key={gallery.folder} className="max-w-full">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(gallery.path)}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                  selected
                    ? 'border-electric bg-electric/20 text-white'
                    : 'border-edge bg-white/5 text-muted hover:border-logo-blue hover:text-white'
                }`}
              >
                <FolderOpen className="size-4 shrink-0" />
                <span dir="ltr" className="truncate">
                  {gallery.folder}
                </span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{gallery.photos.length}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AchievementForm({ achievement, onClose }) {
  const { t } = useLanguage();
  const { values, setValues, fieldProps, validateAll } = useFormFields(toFormValues(achievement), validate);
  const [status, setStatus] = useState('idle');
  const saving = status === 'saving';
  const photoSource = resolvePhotoSource(values.image);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !validateAll(event.currentTarget, FIELD_ORDER)) return;

    setStatus('saving');
    try {
      const post = toAchievement(values);
      await (achievement ? updateAchievement(achievement.id, post) : addAchievement(post));
      onClose();
    } catch (error) {
      console.error('[NOVA AI] Could not save the achievement.', error);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 pb-7 pt-12 sm:px-8">
      <h2 id="achievement-form-title" className="text-2xl font-bold">
        {t(achievement ? 'admin.achievements.editTitle' : 'admin.achievements.addTitle')}
      </h2>
      <p className="mt-1.5 text-sm text-muted">{t('form.requiredNote')}</p>

      <fieldset disabled={saving} className="mt-6 min-w-0 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            icon={Type}
            label={t('admin.achievements.titleAr')}
            type="text"
            dir="rtl"
            lang="ar"
            maxLength={120}
            {...fieldProps('titleAr')}
          />
          <TextField
            icon={Type}
            label={t('admin.achievements.titleEn')}
            type="text"
            dir="ltr"
            lang="en"
            maxLength={120}
            {...fieldProps('titleEn')}
          />
        </div>

        <TextAreaField
          label={t('admin.achievements.descriptionAr')}
          dir="rtl"
          lang="ar"
          rows={DESCRIPTION_ROWS}
          hint={t('admin.achievements.descriptionHint')}
          {...fieldProps('descriptionAr')}
        />
        <TextAreaField
          label={t('admin.achievements.descriptionEn')}
          dir="ltr"
          lang="en"
          rows={DESCRIPTION_ROWS}
          hint={t('admin.achievements.descriptionHint')}
          {...fieldProps('descriptionEn')}
        />

        <div className="sm:w-1/2">
          <TextField
            icon={CalendarDays}
            label={t('admin.achievements.date')}
            type="date"
            max="9999-12-31"
            {...fieldProps('date')}
          />
        </div>

        <div>
          <TextField
            icon={FolderOpen}
            label={t('admin.achievements.photos')}
            type="text"
            dir="ltr"
            placeholder={`${GALLERIES_PATH}/event-name`}
            required={false}
            hint={<PhotoSourceHint source={photoSource} />}
            {...fieldProps('image')}
          />
          <DetectedFolders
            selectedPath={photoSource.value}
            onSelect={(path) => setValues((current) => ({ ...current, image: path }))}
          />
        </div>

        {status === 'error' && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-2xl border border-bow/40 bg-bow/10 px-4 py-3 text-sm font-medium"
          >
            <CircleAlert className="size-4 shrink-0 text-bow" />
            {t('admin.errors.action')}
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

// `achievement` is the post being edited, or null to add a new one.
export default function AchievementFormModal({ open, achievement, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="achievement-form-title" className="max-w-2xl">
      <AchievementForm achievement={achievement} onClose={onClose} />
    </Modal>
  );
}
