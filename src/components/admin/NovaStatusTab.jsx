import { useCallback, useRef, useState } from 'react';
import { CircleAlert, EyeOff, ImagePlus, LoaderCircle, Megaphone, Radio, Send, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useNovaStatus } from '../../hooks/useNovaStatus.js';
import {
  MESSAGE_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  clearNovaStatus,
  isNovaStatusVisible,
  publishNovaStatus,
} from '../../services/novaStatusService.js';
import { formatRelativeTime } from '../../utils/formatDate.js';
import { compressImageToDataUrl } from '../../utils/resizeImage.js';
import { TextAreaField, TextField } from '../forms/FormFields.jsx';
import Toast from '../ui/Toast.jsx';
import { ActionAlert, CollectionState, ConfirmDialog } from './AdminBits.jsx';

// The headline can be in either language whatever the page language; undefined follows the page.
function textDirection(text) {
  if (!text.trim()) return undefined;
  return /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
}

function LiveState({ status }) {
  const { t, lang } = useLanguage();
  const live = isNovaStatusVisible(status);
  const updated = formatRelativeTime(status.updatedAt, lang);

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        live ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-edge bg-space/40'
      }`}
    >
      <span className="relative mt-1.5 flex size-2.5 shrink-0">
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />}
        <span className={`relative size-2.5 rounded-full ${live ? 'bg-emerald-400' : 'bg-muted/60'}`} />
      </span>
      <div className="min-w-0 text-sm leading-relaxed">
        <p className="font-bold">{t(live ? 'admin.status.live' : 'admin.status.hidden')}</p>
        <p className="text-muted">
          {t(live ? 'admin.status.liveText' : 'admin.status.hiddenText')}
          {live && updated && ` ${t('admin.status.updated')} ${updated}`}
        </p>
      </div>
    </div>
  );
}

function StatusEditor({ status }) {
  const { t } = useLanguage();
  const { busyId, errorKey, run } = useAdminAction();
  const [title, setTitle] = useState(status.title);
  const [message, setMessage] = useState(status.message);
  const [imageData, setImageData] = useState(status.imageData);
  const [imageBusy, setImageBusy] = useState(false);
  // A key under admin.status.errors.
  const [imageError, setImageError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // 'published' | 'cleared' | null
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const fileRef = useRef(null);

  const busy = busyId !== null;
  const canPublish = Boolean(title.trim() || imageData);
  const canClear = isNovaStatusVisible(status) || canPublish || Boolean(message.trim());

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    // Lets the same file be picked again after removing it.
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('imageType');
      return;
    }

    setImageBusy(true);
    setImageError(null);
    try {
      setImageData(await compressImageToDataUrl(file));
    } catch {
      setImageError('imageRead');
    } finally {
      setImageBusy(false);
    }
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    if (busy || imageBusy || !canPublish) return;
    if (await run('publish', () => publishNovaStatus({ title, message, imageData }))) setToast('published');
  };

  const handleClear = async () => {
    const cleared = await run('clear', clearNovaStatus);
    setConfirmOpen(false);
    if (!cleared) return;
    setTitle('');
    setMessage('');
    setImageData(null);
    setImageError(null);
    setToast('cleared');
  };

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-8">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-28 -top-28 size-72 rounded-full bg-bow opacity-10 blur-3xl"
      />

      <form onSubmit={handlePublish} noValidate className="relative">
        <div className="flex flex-wrap items-start gap-4">
          <span className="bg-brand grid size-12 shrink-0 place-items-center rounded-2xl">
            <Radio className="size-6" />
          </span>
          <div className="min-w-0 flex-1 basis-60">
            <h2 className="text-2xl font-bold">{t('admin.status.title')}</h2>
            <p className="mt-1 leading-relaxed text-muted">{t('admin.status.text')}</p>
          </div>
        </div>

        <div className="mt-5">
          <LiveState status={status} />
        </div>

        <fieldset disabled={busy} className="mt-6 min-w-0 space-y-5">
          <TextField
            icon={Megaphone}
            label={t('admin.status.headline')}
            placeholder={t('admin.status.headlinePlaceholder')}
            required={false}
            dir={textDirection(title)}
            maxLength={TITLE_MAX_LENGTH}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextAreaField
            label={t('admin.status.details')}
            placeholder={t('admin.status.detailsPlaceholder')}
            required={false}
            dir="auto"
            rows={3}
            maxLength={MESSAGE_MAX_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <div className="rounded-2xl border border-edge bg-space/40 p-4">
            <p className="font-bold">{t('admin.status.image')}</p>
            <p className="mt-0.5 text-sm text-muted">{t('admin.status.imageHint')}</p>
            {imageData && (
              <img
                src={imageData}
                alt={t('admin.status.imageAlt')}
                className="mt-4 max-h-72 w-full rounded-xl border border-edge bg-space/60 object-contain"
              />
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={imageBusy}
                className="btn btn-ghost btn-sm disabled:cursor-wait"
              >
                {imageBusy ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {t(imageData ? 'admin.status.change' : 'admin.status.upload')}
              </button>
              {imageData && (
                <button
                  type="button"
                  onClick={() => {
                    setImageData(null);
                    setImageError(null);
                  }}
                  className="btn btn-sm border border-bow/40 bg-bow/10 text-white hover:bg-bow/20"
                >
                  <Trash2 className="size-4 text-bow" />
                  {t('admin.status.removeImage')}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} hidden />
            {imageError && (
              <p role="alert" className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-bow">
                <CircleAlert className="size-4 shrink-0" />
                {t(`admin.status.errors.${imageError}`)}
              </p>
            )}
          </div>
        </fieldset>

        <ActionAlert errorKey={errorKey} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="submit"
            disabled={busy || imageBusy || !canPublish}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyId === 'publish' ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5 rtl:-scale-x-100" />}
            {t(busyId === 'publish' ? 'admin.status.publishing' : 'admin.status.publish')}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={busy || !canClear}
            className="btn border border-bow/40 bg-bow/10 text-white hover:bg-bow/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <EyeOff className="size-5 text-bow" />
            {t('admin.status.clear')}
          </button>
          {!canPublish && <p className="text-sm text-muted">{t('admin.status.needContent')}</p>}
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title={t('admin.status.clearTitle')}
        text={t('admin.status.clearText')}
        busy={busyId === 'clear'}
        onConfirm={handleClear}
        onClose={() => setConfirmOpen(false)}
      />

      <Toast
        open={toast !== null}
        onClose={closeToast}
        icon={toast === 'cleared' ? EyeOff : Radio}
        title={toast ? t(`admin.status.${toast}Title`) : ''}
      >
        {toast ? t(`admin.status.${toast}Text`) : ''}
      </Toast>
    </div>
  );
}

export default function NovaStatusTab() {
  const { status, loading, error } = useNovaStatus();

  return (
    // The editor mounts once the document has loaded, so its fields start from what is published.
    <CollectionState collection={{ loading, error, items: [status] }} hasResults>
      <StatusEditor status={status} />
    </CollectionState>
  );
}
