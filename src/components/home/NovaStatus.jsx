import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Clock, Megaphone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useNovaStatus } from '../../hooks/useNovaStatus.js';
import { isNovaStatusVisible } from '../../services/novaStatusService.js';
import { formatRelativeTime } from '../../utils/formatDate.js';
import { NovaAvatar } from '../ui/Brand.jsx';
import Modal from '../ui/Modal.jsx';

const EASE = [0.22, 1, 0.36, 1];
const STORY_RING = 'bg-[conic-gradient(from_0deg,#F472B6,#FBBF24,#7C3AED,#4F8CFF,#F472B6)]';

function LiveBadge() {
  const { t } = useLanguage();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-bow/15 px-2 py-0.5 text-[0.7rem] font-bold leading-none text-bow">
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-bow opacity-75" />
        <span className="relative size-2 rounded-full bg-bow" />
      </span>
      {t('novaStatus.live')}
    </span>
  );
}

function StoryModal({ status, open, onClose }) {
  const { t, lang } = useLanguage();
  const updated = formatRelativeTime(status.updatedAt, lang);

  return (
    <Modal open={open} onClose={onClose} labelledBy="nova-status-label" className="max-w-md">
      <div className="flex items-center gap-3 pe-16 ps-5 pt-5">
        <span className="relative size-11 shrink-0">
          <span className={`absolute inset-0 animate-spin-slow rounded-full ${STORY_RING}`} />
          <span className="absolute inset-[2.5px] overflow-hidden rounded-full border-2 border-surface">
            <NovaAvatar className="size-full" />
          </span>
        </span>
        <div className="min-w-0">
          <p id="nova-status-label" className="flex flex-wrap items-center gap-2 font-display font-bold">
            {t('novaStatus.label')}
            <LiveBadge />
          </p>
          {updated && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <Clock className="size-3.5 shrink-0" />
              {t('novaStatus.updated')} {updated}
            </p>
          )}
        </div>
      </div>

      <div className="mx-5 mt-4 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.span
          className="bg-brand block h-full origin-left rounded-full rtl:origin-right"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        />
      </div>

      {status.imageData && (
        <motion.img
          src={status.imageData}
          alt={status.title || t('novaStatus.imageAlt')}
          className="mt-4 max-h-[55svh] w-full bg-space/60 object-contain"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
        />
      )}

      {(status.title || status.message) && (
        <motion.div
          className="px-5 pt-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: EASE }}
        >
          {status.title && (
            <h2 dir="auto" className="break-words text-xl font-extrabold leading-relaxed sm:text-2xl sm:leading-relaxed">
              {status.title}
            </h2>
          )}
          {status.message && (
            <p dir="auto" className="mt-2 whitespace-pre-line break-words leading-loose text-muted">
              {status.message}
            </p>
          )}
        </motion.div>
      )}
      <div className="h-6" />
    </Modal>
  );
}

// The live status admins publish from the dashboard. Renders nothing, and takes no space, while there is none.
export default function NovaStatus() {
  const { t } = useLanguage();
  const { status } = useNovaStatus();
  const [open, setOpen] = useState(false);
  const visible = isNovaStatusVisible(status);

  return (
    <>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            // The negative margin and matching padding leave room for the glow inside the clipped box.
            className="-mx-4 -mt-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="px-4 pb-7 pt-4">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={status.title ? `${t('novaStatus.open')}: ${status.title}` : t('novaStatus.open')}
                className="story-pill inline-flex max-w-full items-center gap-3 rounded-full py-1.5 pe-4 ps-1.5 text-start sm:max-w-md"
              >
                <span className="relative size-12 shrink-0">
                  <span className={`absolute inset-0 animate-spin-slow rounded-full ${STORY_RING}`} />
                  <span className="absolute inset-[2.5px] overflow-hidden rounded-full border-2 border-surface bg-surface">
                    {status.imageData ? (
                      <img src={status.imageData} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="bg-logo grid size-full place-items-center text-white">
                        <Megaphone className="size-5" />
                      </span>
                    )}
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-xs font-bold text-muted">
                    {t('novaStatus.label')}
                    <LiveBadge />
                  </span>
                  {status.title && (
                    <span dir="auto" className="mt-1 block truncate font-display font-bold leading-snug text-white">
                      {status.title}
                    </span>
                  )}
                </span>

                <ChevronRight className="size-5 shrink-0 text-muted rtl:-scale-x-100" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StoryModal status={status} open={open && visible} onClose={() => setOpen(false)} />
    </>
  );
}
