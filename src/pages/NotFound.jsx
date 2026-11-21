import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-svh items-center pb-20 pt-32">
      <motion.div
        className="mx-auto max-w-xl px-5 text-center"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p dir="ltr" className="text-gradient font-display text-8xl font-extrabold sm:text-9xl">
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold">{t('notFound.title')}</h1>
        <p className="mt-3 text-lg leading-loose text-muted">{t('notFound.text')}</p>
        <Link to="/" className="btn btn-primary mt-8">
          {t('common.backHome')}
        </Link>
      </motion.div>
    </section>
  );
}
