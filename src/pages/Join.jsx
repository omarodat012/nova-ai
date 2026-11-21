import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MembershipForm from '../components/MembershipForm.jsx';
import SocialButtons from '../components/ui/SocialButtons.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const EASE = [0.22, 1, 0.36, 1];

export default function Join() {
  const { t } = useLanguage();

  return (
    <section className="relative pb-24 pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(79,140,255,0.22),transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <motion.div
          className="lg:sticky lg:top-32 lg:self-start"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-white"
          >
            <ArrowRight className="size-4 -scale-x-100 rtl:scale-x-100" />
            {t('common.backHome')}
          </Link>

          <span className="mt-6 flex w-fit items-center gap-2 rounded-full border border-edge bg-surface/60 px-4 py-1.5 text-sm font-medium text-logo-blue backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-electric shadow-[0_0_10px_2px_rgba(79,140,255,0.8)]" />
            {t('join.badge')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-snug sm:text-5xl sm:leading-snug">
            <span className="text-gradient">{t('join.title')}</span>
          </h1>
          <p className="mt-4 text-lg leading-loose text-muted">{t('join.text')}</p>

          <h2 className="mt-10 text-lg font-bold">{t('join.stepsTitle')}</h2>
          <ol className="mt-5 space-y-5">
            {t('join.steps').map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="bg-brand grid size-10 shrink-0 place-items-center rounded-full font-display font-extrabold shadow-[0_0_24px_-6px_rgba(79,140,255,0.9)]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-0.5 leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
        >
          <MembershipForm />

          <h2 className="mt-10 text-lg font-bold">{t('join.contactTitle')}</h2>
          <SocialButtons className="mt-4" />
        </motion.div>
      </div>
    </section>
  );
}
