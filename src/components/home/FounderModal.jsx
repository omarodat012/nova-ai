import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { renderRichText } from '../../utils/richText.jsx';
import Modal from '../ui/Modal.jsx';
import SmartImage from '../ui/SmartImage.jsx';

const RING_GRADIENT = 'bg-[conic-gradient(from_0deg,#4F8CFF,#7C3AED,#F472B6,#4F8CFF)]';

export default function FounderModal({ open, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal open={open} onClose={onClose} labelledBy="founder-title" className="max-w-2xl">
      <div className="relative px-6 pb-9 pt-12 sm:px-10 sm:pb-11">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-28 mx-auto size-80 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.5),transparent_65%)]"
        />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            className="relative size-36 sm:size-40"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.12 }}
          >
            <span className={`absolute -inset-2 animate-spin-slow rounded-full opacity-75 blur-lg ${RING_GRADIENT}`} />
            <span className={`absolute -inset-1 animate-spin-slow rounded-full ${RING_GRADIENT}`} />
            <span className="relative block size-full overflow-hidden rounded-full border-4 border-surface bg-surface">
              <SmartImage
                src="/assets/founder-shahla.jpg"
                alt={t('founder.photoAlt')}
                className="size-full object-cover"
                fallback={
                  <span className="bg-logo grid size-full place-items-center font-display text-6xl font-extrabold text-white">
                    {t('founder.initial')}
                  </span>
                }
              />
            </span>
          </motion.div>

          <motion.span
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3.5 py-1 text-sm font-bold text-amber-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Crown className="size-4" />
            {t('founder.badge')}
          </motion.span>

          <motion.h2
            id="founder-title"
            className="mt-4 text-2xl font-extrabold leading-relaxed sm:text-3xl sm:leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            {t('founder.name')} <span className="mx-1 font-normal text-logo-mauve">|</span>{' '}
            <span className="text-gradient">{t('founder.role')}</span>
          </motion.h2>
        </div>

        <div className="relative mt-6 space-y-4 text-start leading-loose text-muted">
          {t('founder.bio').map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 + index * 0.12 }}
            >
              {renderRichText(paragraph)}
            </motion.p>
          ))}
        </div>
      </div>
    </Modal>
  );
}
