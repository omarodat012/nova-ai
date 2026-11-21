import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, MailWarning, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Reminds a signed-in password account that its email is still unverified, on every page until it is dismissed.
// It sits opposite the chatbot launcher and stays shorter than the gap under the open chat panel.
export default function VerifyEmailBanner({ hidden = false, onVerify }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [dismissedFor, setDismissedFor] = useState(null);
  const visible = Boolean(user) && !user.emailVerified && dismissedFor !== user.uid && !hidden;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label={t('auth.verify.bannerTitle')}
          className="glass-strong fixed bottom-5 end-24 start-4 z-30 flex items-center gap-3 rounded-2xl border-amber-300/40 p-2.5 shadow-[0_18px_50px_-18px_rgba(252,211,77,0.55)] sm:bottom-6 sm:end-auto sm:start-6 sm:max-w-sm sm:p-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-amber-300/40 bg-amber-300/10 text-amber-200">
            <MailWarning className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{t('auth.verify.bannerTitle')}</p>
            <p className="hidden text-xs leading-relaxed text-muted sm:block">{t('auth.verify.bannerText')}</p>
            <button
              type="button"
              onClick={onVerify}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 underline-offset-4 hover:underline sm:mt-0.5"
            >
              {t('auth.verify.bannerCta')}
              <ArrowRight className="size-3.5 rtl:-scale-x-100" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDismissedFor(user.uid)}
            aria-label={t('auth.verify.dismiss')}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
