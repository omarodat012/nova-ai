import { motion } from 'framer-motion';

const TONES = {
  success: 'border-emerald-400/40 bg-emerald-400/10 [&>svg]:text-emerald-300',
  error: 'border-bow/40 bg-bow/10 [&>svg]:text-bow',
};

// The result line under a profile form. Render it inside <AnimatePresence> to animate it out as well.
export default function FormMessage({ tone, icon: Icon, children }) {
  return (
    <motion.p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium leading-relaxed ${TONES[tone]}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      {children}
    </motion.p>
  );
}
