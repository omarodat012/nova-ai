import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LoaderCircle, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { assetUrl } from '../../utils/assetUrl.js';

const SWIPE_DISTANCE = 60;
const CONTROL =
  'absolute z-10 grid place-items-center rounded-full border border-edge bg-space/70 text-white backdrop-blur-md transition hover:border-electric hover:bg-electric/25';

// Full-screen photo viewer. `index` is the open photo, or null when closed.
// Arrow keys, the side buttons and swiping move between photos; Escape or the backdrop closes it.
export default function Lightbox({ photos, index, title, onChange, onClose }) {
  const { t, isRTL } = useLanguage();
  const dialogRef = useRef(null);
  const actions = useRef(null);
  const open = index !== null;
  const hasMany = photos.length > 1;

  const step = (delta) => onChange((index + delta + photos.length) % photos.length);
  // "Forward" follows the reading direction: right in English, left in Arabic.
  const forward = isRTL ? -1 : 1;

  useEffect(() => {
    actions.current = { step, onClose, forward };
  });

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') actions.current.onClose();
      if (event.key === 'ArrowRight') actions.current.step(actions.current.forward);
      if (event.key === 'ArrowLeft') actions.current.step(-actions.current.forward);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const onDragEnd = (_event, { offset }) => {
    if (Math.abs(offset.x) < SWIPE_DISTANCE) return;
    step(offset.x < 0 ? forward : -forward);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${t('achievementPage.gallery')}: ${title}`}
          tabIndex={-1}
          className="fixed inset-0 z-[110] flex items-center justify-center outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-space/95 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
          <LoaderCircle className="absolute size-8 animate-spin text-logo-blue" aria-hidden="true" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={photos[index]}
              src={assetUrl(photos[index])}
              alt={`${title} (${index + 1}/${photos.length})`}
              draggable={false}
              drag={hasMany ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={onDragEnd}
              className={`relative max-h-[calc(100svh-9rem)] max-w-[calc(100vw-1.5rem)] rounded-2xl object-contain shadow-[0_40px_120px_-30px_rgba(79,140,255,0.6)] sm:max-w-[calc(100vw-10rem)] ${hasMany ? 'cursor-grab active:cursor-grabbing' : ''}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          <span
            dir="ltr"
            className="absolute start-4 top-4 z-10 rounded-full border border-edge bg-space/70 px-3.5 py-1.5 text-sm font-bold backdrop-blur-md"
          >
            {index + 1} / {photos.length}
          </span>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className={`${CONTROL} end-4 top-4 size-11`}>
            <X className="size-5" />
          </button>

          {hasMany && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('achievementPage.previous')}
                className={`${CONTROL} start-2 top-1/2 size-11 -translate-y-1/2 sm:start-5 sm:size-12`}
              >
                {isRTL ? <ChevronRight className="size-6" /> : <ChevronLeft className="size-6" />}
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('achievementPage.next')}
                className={`${CONTROL} end-2 top-1/2 size-11 -translate-y-1/2 sm:end-5 sm:size-12`}
              >
                {isRTL ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
