import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function TeamResponsibilities({ team }) {
  const { t, localize } = useLanguage();

  return (
    <section>
      <h2 className="flex items-center gap-3 text-2xl font-bold">
        <span aria-hidden="true" className="h-7 w-1.5 rounded-full bg-[var(--accent)]" />
        {t('subteamPage.responsibilities')}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {localize(team.highlights).map((highlight, index) => (
          <motion.li
            key={highlight}
            className="glass group relative overflow-hidden rounded-3xl p-6 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-[0_24px_50px_-28px_var(--accent)] sm:last:odd:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent)] text-space shadow-[0_0_24px_-6px_var(--accent)]">
                <Check className="size-5" strokeWidth={3} />
              </span>
              <span
                aria-hidden="true"
                className="font-display text-3xl font-extrabold text-[var(--accent)] opacity-25 transition-opacity group-hover:opacity-60"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-5 text-lg font-bold leading-relaxed">{highlight}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
