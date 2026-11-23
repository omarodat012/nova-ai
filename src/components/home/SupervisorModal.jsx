import { motion } from 'framer-motion';
import { GraduationCap, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { renderRichText } from '../../utils/richText.jsx';
import Modal from '../ui/Modal.jsx';
import SmartImage from '../ui/SmartImage.jsx';

const RING_GRADIENT = 'bg-[conic-gradient(from_0deg,#FBBF24,#22D3EE,#4F8CFF,#FBBF24)]';

export default function SupervisorModal({ open, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal open={open} onClose={onClose} labelledBy="supervisor-title" className="max-w-2xl">
      <div className="relative px-6 pb-9 pt-12 sm:px-10 sm:pb-11">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-28 mx-auto size-80 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.32),transparent_65%)]"
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
                src="/assets/supervisor.jpg"
                alt={t('supervisor.photoAlt')}
                className="size-full object-cover"
                fallback={
                  <span className="grid size-full place-items-center bg-[linear-gradient(135deg,#1e3a5f,#16132b_55%,#3b2f12)] text-amber-200">
                    <GraduationCap className="size-16 sm:size-20" strokeWidth={1.25} />
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
            <HeartHandshake className="size-4" />
            {t('supervisor.badge')}
          </motion.span>

          <motion.h2
            id="supervisor-title"
            className="mt-4 text-2xl font-extrabold leading-relaxed sm:text-3xl sm:leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            {t('supervisor.name')}
          </motion.h2>
          <motion.p
            className="mt-1 bg-[linear-gradient(90deg,#fbbf24,#22d3ee)] bg-clip-text font-display text-lg font-bold text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            {t('supervisor.role')}
          </motion.p>
        </div>

        <div className="relative mt-6 space-y-4 text-start leading-loose text-muted">
          {t('supervisor.bio').map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46 + index * 0.12 }}
            >
              {renderRichText(paragraph)}
            </motion.p>
          ))}
        </div>
      </div>
    </Modal>
  );
}
