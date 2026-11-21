import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

const VISIBLE_MS = 6000;

// A short confirmation that drops in under the navbar and leaves on its own. `onClose` must be stable.
export default function Toast({ open, onClose, icon: Icon, title, children }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          className="glass-strong fixed inset-x-4 top-24 z-[110] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border-emerald-400/40 p-4 shadow-[0_24px_70px_-18px_rgba(124,58,237,0.85)]"
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <span className="bg-brand grid size-10 shrink-0 animate-glow place-items-center rounded-full">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold leading-snug">{title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-white/85">{children}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
